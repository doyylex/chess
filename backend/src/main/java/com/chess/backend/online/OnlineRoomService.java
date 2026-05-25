package com.chess.backend.online;

import com.github.bhlangonijr.chesslib.Board;
import com.github.bhlangonijr.chesslib.Piece;
import com.github.bhlangonijr.chesslib.PieceType;
import com.github.bhlangonijr.chesslib.Side;
import com.github.bhlangonijr.chesslib.Square;
import com.github.bhlangonijr.chesslib.move.Move;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.WebSocketSession;

@Service
public class OnlineRoomService {

  private static final String ROOM_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  private static final int ROOM_CODE_LENGTH = 6;
  private static final int CHAT_MESSAGE_MAX_LENGTH = 200;

  private final Map<String, OnlineRoom> rooms = new ConcurrentHashMap<>();
  private final SecureRandom random = new SecureRandom();

  public RoomJoinResponse createRoom() {
    String code = generateUniqueCode();
    OnlineRoom room = new OnlineRoom(code);
    OnlinePlayer white = createPlayer("w");
    room.white(white);
    rooms.put(code, room);
    return joinResponse(room, white);
  }

  public RoomJoinResponse joinRoom(String code) {
    OnlineRoom room = findRoom(code);

    synchronized (room) {
      if (room.black() != null) {
        throw new OnlineRoomException(
            HttpStatus.CONFLICT, OnlineErrorCodes.ROOM_FULL, "The room is already full.");
      }

      OnlinePlayer black = createPlayer("b");
      room.black(black);
      return joinResponse(room, black);
    }
  }

  public OnlineState registerSession(
      String code, String playerId, String token, WebSocketSession session) {
    OnlineRoom room = findRoom(code);

    synchronized (room) {
      requirePlayer(room, playerId, token);
      room.sessions().put(session.getId(), session);
      room.sessionPlayers().put(session.getId(), playerId);
      return state(room);
    }
  }

  public Optional<String> unregisterSession(WebSocketSession session) {
    for (OnlineRoom room : rooms.values()) {
      synchronized (room) {
        if (room.sessions().remove(session.getId()) != null) {
          room.sessionPlayers().remove(session.getId());
          return Optional.of(room.code());
        }
      }
    }

    return Optional.empty();
  }

  public OnlineState makeMove(
      String code,
      String playerId,
      String token,
      String from,
      String to,
      String promotion) {
    OnlineRoom room = findRoom(code);

    synchronized (room) {
      OnlinePlayer player = requirePlayer(room, playerId, token);

      if (!"PLAYING".equals(roomStatus(room))) {
        throw new OnlineRoomException(
            HttpStatus.CONFLICT, OnlineErrorCodes.GAME_NOT_STARTED, "The game has not started yet.");
      }

      if (!player.color().equals(turnColor(room.board()))) {
        throw new OnlineRoomException(
            HttpStatus.CONFLICT, OnlineErrorCodes.NOT_YOUR_TURN, "It is not your turn.");
      }

      Move move = parseMove(room.board(), from, to, promotion);

      if (!room.board().legalMoves().contains(move)) {
        throw new OnlineRoomException(
            HttpStatus.BAD_REQUEST, OnlineErrorCodes.ILLEGAL_MOVE, "Illegal move.");
      }

      if (!room.board().doMove(move)) {
        throw new OnlineRoomException(
            HttpStatus.BAD_REQUEST, OnlineErrorCodes.ILLEGAL_MOVE, "Illegal move.");
      }

      String moveText = formatMoveText(from, to, promotion);
      room.lastMoveColor(player.color());
      room.lastMoveText(moveText);
      room.lastMove(formatMove(player, moveText));
      return state(room);
    }
  }

  public ChatMessage createChatMessage(String code, String playerId, String token, String message) {
    OnlineRoom room = findRoom(code);

    synchronized (room) {
      OnlinePlayer player = requirePlayer(room, playerId, token);
      String trimmedMessage = message == null ? "" : message.trim();

      if (trimmedMessage.isEmpty()) {
        throw new OnlineRoomException(
            HttpStatus.BAD_REQUEST, OnlineErrorCodes.CHAT_EMPTY, "The message is empty.");
      }

      if (trimmedMessage.length() > CHAT_MESSAGE_MAX_LENGTH) {
        throw new OnlineRoomException(
            HttpStatus.BAD_REQUEST,
            OnlineErrorCodes.CHAT_TOO_LONG,
            "The message cannot exceed 200 characters.");
      }

      return new ChatMessage(
          player.color(), colorName(player.color()), trimmedMessage, Instant.now().toString());
    }
  }

  public List<WebSocketSession> sessions(String code) {
    OnlineRoom room = findRoom(code);

    synchronized (room) {
      return new ArrayList<>(room.sessions().values());
    }
  }

  public OnlineState state(String code) {
    OnlineRoom room = findRoom(code);

    synchronized (room) {
      return state(room);
    }
  }

  private OnlineRoom findRoom(String code) {
    OnlineRoom room = rooms.get(normalizeCode(code));

    if (room == null) {
      throw new OnlineRoomException(
          HttpStatus.NOT_FOUND, OnlineErrorCodes.ROOM_NOT_FOUND, "Room not found.");
    }

    return room;
  }

  private OnlinePlayer createPlayer(String color) {
    return new OnlinePlayer(UUID.randomUUID().toString(), UUID.randomUUID().toString(), color);
  }

  private RoomJoinResponse joinResponse(OnlineRoom room, OnlinePlayer player) {
    return new RoomJoinResponse(
        room.code(),
        player.id(),
        player.token(),
        player.color(),
        state(room));
  }

  private OnlinePlayer requirePlayer(OnlineRoom room, String playerId, String token) {
    return findPlayer(room, playerId)
        .filter((player) -> player.token().equals(token))
        .orElseThrow(
            () ->
                new OnlineRoomException(
                    HttpStatus.UNAUTHORIZED,
                    OnlineErrorCodes.UNAUTHORIZED_PLAYER,
                    "Unauthorized player."));
  }

  private Optional<OnlinePlayer> findPlayer(OnlineRoom room, String playerId) {
    if (room.white() != null && room.white().id().equals(playerId)) {
      return Optional.of(room.white());
    }

    if (room.black() != null && room.black().id().equals(playerId)) {
      return Optional.of(room.black());
    }

    return Optional.empty();
  }

  private OnlineState state(OnlineRoom room) {
    return new OnlineState(
        room.code(),
        room.board().getFen(),
        turnColor(room.board()),
        roomStatus(room),
        gameStatus(room),
        statusCode(room),
        winnerColor(room.board()),
        checkedColor(room.board()),
        room.lastMove(),
        room.lastMoveColor(),
        room.lastMoveText(),
        isConnected(room, room.white()),
        isConnected(room, room.black()));
  }

  private String roomStatus(OnlineRoom room) {
    if (room.board().isMated() || room.board().isDraw()) {
      return "FINISHED";
    }

    if (room.white() == null || room.black() == null) {
      return "WAITING";
    }

    return "PLAYING";
  }

  private String gameStatus(OnlineRoom room) {
    if (room.white() == null || room.black() == null) {
      return "Waiting for opponent.";
    }

    Board board = room.board();

    if (board.isMated()) {
      String winner = board.getSideToMove() == Side.WHITE ? "Black" : "White";
      return "Checkmate. " + winner + " wins.";
    }

    if (board.isDraw()) {
      return "Draw.";
    }

    if (board.isKingAttacked()) {
      return colorName(turnColor(board)) + " is in check.";
    }

    return "Online game in progress.";
  }

  private String statusCode(OnlineRoom room) {
    if (room.white() == null || room.black() == null) {
      return "WAITING_OPPONENT";
    }

    Board board = room.board();

    if (board.isMated()) {
      return "CHECKMATE";
    }

    if (board.isDraw()) {
      return "DRAW";
    }

    if (board.isKingAttacked()) {
      return "CHECK";
    }

    return "IN_PROGRESS";
  }

  private String winnerColor(Board board) {
    if (!board.isMated()) {
      return null;
    }

    return board.getSideToMove() == Side.WHITE ? "b" : "w";
  }

  private String checkedColor(Board board) {
    if (!board.isKingAttacked()) {
      return null;
    }

    return turnColor(board);
  }

  private boolean isConnected(OnlineRoom room, OnlinePlayer player) {
    if (player == null) {
      return false;
    }

    return room.sessionPlayers().values().stream().anyMatch(player.id()::equals);
  }

  private Move parseMove(Board board, String from, String to, String promotion) {
    try {
      Square fromSquare = Square.fromValue(from.toUpperCase(Locale.ROOT));
      Square toSquare = Square.fromValue(to.toUpperCase(Locale.ROOT));
      Piece promotionPiece = promotionPiece(board.getSideToMove(), promotion);

      if (promotionPiece == Piece.NONE) {
        return new Move(fromSquare, toSquare);
      }

      return new Move(fromSquare, toSquare, promotionPiece);
    } catch (RuntimeException error) {
      throw new OnlineRoomException(
          HttpStatus.BAD_REQUEST, OnlineErrorCodes.INVALID_MOVE, "Invalid move.");
    }
  }

  private Piece promotionPiece(Side side, String promotion) {
    if (promotion == null || promotion.isBlank()) {
      return Piece.NONE;
    }

    return switch (promotion.toLowerCase(Locale.ROOT)) {
      case "q" -> Piece.make(side, PieceType.QUEEN);
      case "r" -> Piece.make(side, PieceType.ROOK);
      case "b" -> Piece.make(side, PieceType.BISHOP);
      case "n" -> Piece.make(side, PieceType.KNIGHT);
      default -> Piece.NONE;
    };
  }

  private String formatMoveText(String from, String to, String promotion) {
    String moveText = from.toLowerCase(Locale.ROOT) + "-" + to.toLowerCase(Locale.ROOT);

    if (promotion != null && !promotion.isBlank()) {
      moveText += "=" + promotion.toUpperCase(Locale.ROOT);
    }

    return moveText;
  }

  private String formatMove(OnlinePlayer player, String moveText) {
    return colorName(player.color()) + ": " + moveText;
  }

  private String turnColor(Board board) {
    return board.getSideToMove() == Side.WHITE ? "w" : "b";
  }

  private String colorName(String color) {
    return "w".equals(color) ? "White" : "Black";
  }

  private String normalizeCode(String code) {
    return code == null ? "" : code.trim().toUpperCase(Locale.ROOT);
  }

  private String generateUniqueCode() {
    String code;

    do {
      code = generateCode();
    } while (rooms.containsKey(code));

    return code;
  }

  private String generateCode() {
    StringBuilder code = new StringBuilder(ROOM_CODE_LENGTH);

    for (int index = 0; index < ROOM_CODE_LENGTH; index += 1) {
      code.append(ROOM_ALPHABET.charAt(random.nextInt(ROOM_ALPHABET.length())));
    }

    return code.toString();
  }
}
