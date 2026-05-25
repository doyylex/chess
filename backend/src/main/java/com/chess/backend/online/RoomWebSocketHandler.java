package com.chess.backend.online;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.net.URI;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.util.MultiValueMap;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.web.util.UriComponentsBuilder;

@Component
public class RoomWebSocketHandler extends TextWebSocketHandler {

  private final OnlineRoomService onlineRoomService;
  private final ObjectMapper objectMapper;

  public RoomWebSocketHandler(OnlineRoomService onlineRoomService, ObjectMapper objectMapper) {
    this.onlineRoomService = onlineRoomService;
    this.objectMapper = objectMapper;
  }

  @Override
  public void afterConnectionEstablished(WebSocketSession session) throws Exception {
    String code = roomCode(session);
    MultiValueMap<String, String> query = queryParams(session);
    String playerId = query.getFirst("playerId");
    String token = query.getFirst("token");
    OnlineState state = onlineRoomService.registerSession(code, playerId, token, session);

    sendState(session, state);
    broadcastState(code);
  }

  @Override
  protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
    String code = roomCode(session);
    MultiValueMap<String, String> query = queryParams(session);
    String playerId = query.getFirst("playerId");
    String token = query.getFirst("token");
    Map<String, Object> payload =
        objectMapper.readValue(message.getPayload(), new TypeReference<>() {});
    String type = stringValue(payload.get("type"));

    try {
      if ("move".equals(type)) {
        onlineRoomService.makeMove(
            code,
            playerId,
            token,
            stringValue(payload.get("from")),
            stringValue(payload.get("to")),
            stringValue(payload.get("promotion")));
        broadcastState(code);
        return;
      }

      if ("chat".equals(type)) {
        ChatMessage chat =
            onlineRoomService.createChatMessage(
                code, playerId, token, stringValue(payload.get("message")));
        broadcastChat(code, chat);
        return;
      }

      sendError(
          session,
          OnlineErrorCodes.UNSUPPORTED_MESSAGE,
          "Unsupported message.");
    } catch (OnlineRoomException error) {
      sendError(session, error.code(), error.getReason());
    } catch (ResponseStatusException error) {
      sendError(session, OnlineErrorCodes.ACTION_ERROR, error.getReason());
    }
  }

  @Override
  public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
    if (session.isOpen()) {
      session.close(CloseStatus.SERVER_ERROR);
    }
  }

  @Override
  public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
    onlineRoomService.unregisterSession(session).ifPresent(this::broadcastStateQuietly);
  }

  private void broadcastState(String code) throws IOException {
    OnlineState state = onlineRoomService.state(code);
    List<WebSocketSession> sessions = onlineRoomService.sessions(code);

    for (WebSocketSession session : sessions) {
      sendState(session, state);
    }
  }

  private void broadcastChat(String code, ChatMessage chat) throws IOException {
    List<WebSocketSession> sessions = onlineRoomService.sessions(code);

    for (WebSocketSession session : sessions) {
      sendChat(session, chat);
    }
  }

  private void broadcastStateQuietly(String code) {
    try {
      broadcastState(code);
    } catch (IOException ignored) {
      // Connection cleanup should not crash the WebSocket handler.
    }
  }

  private void sendState(WebSocketSession session, OnlineState state) throws IOException {
    sendJson(session, Map.of("type", "state", "state", state));
  }

  private void sendChat(WebSocketSession session, ChatMessage chat) throws IOException {
    sendJson(session, Map.of("type", "chat", "chat", chat));
  }

  private void sendError(WebSocketSession session, String code, String message) throws IOException {
    sendJson(
        session,
        Map.of(
            "type", "error",
            "code", code,
            "message", message == null ? "" : message));
  }

  private void sendJson(WebSocketSession session, Map<String, Object> payload) throws IOException {
    if (session.isOpen()) {
      session.sendMessage(new TextMessage(objectMapper.writeValueAsString(payload)));
    }
  }

  private String roomCode(WebSocketSession session) {
    URI uri = session.getUri();

    if (uri == null) {
      throw new OnlineRoomException(
          HttpStatus.BAD_REQUEST, OnlineErrorCodes.INVALID_CONNECTION, "Invalid connection.");
    }

    String path = uri.getPath();
    int marker = path.lastIndexOf('/');

    if (marker < 0 || marker == path.length() - 1) {
      throw new OnlineRoomException(
          HttpStatus.BAD_REQUEST, OnlineErrorCodes.INVALID_ROOM_CODE, "Invalid room code.");
    }

    return path.substring(marker + 1);
  }

  private MultiValueMap<String, String> queryParams(WebSocketSession session) {
    URI uri = session.getUri();

    if (uri == null) {
      throw new OnlineRoomException(
          HttpStatus.BAD_REQUEST, OnlineErrorCodes.INVALID_CONNECTION, "Invalid connection.");
    }

    return UriComponentsBuilder.fromUri(uri).build().getQueryParams();
  }

  private String stringValue(Object value) {
    return value == null ? "" : String.valueOf(value);
  }
}
