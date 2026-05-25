package com.chess.backend.online;

import com.github.bhlangonijr.chesslib.Board;
import java.util.HashMap;
import java.util.Map;
import org.springframework.web.socket.WebSocketSession;

final class OnlineRoom {

  private final String code;
  private final Board board;
  private final Map<String, WebSocketSession> sessions;
  private final Map<String, String> sessionPlayers;
  private OnlinePlayer white;
  private OnlinePlayer black;
  private String lastMove;
  private String lastMoveColor;
  private String lastMoveText;

  OnlineRoom(String code) {
    this.code = code;
    this.board = new Board();
    this.sessions = new HashMap<>();
    this.sessionPlayers = new HashMap<>();
    this.lastMove = "None";
    this.lastMoveColor = null;
    this.lastMoveText = "";
  }

  String code() {
    return code;
  }

  Board board() {
    return board;
  }

  OnlinePlayer white() {
    return white;
  }

  void white(OnlinePlayer white) {
    this.white = white;
  }

  OnlinePlayer black() {
    return black;
  }

  void black(OnlinePlayer black) {
    this.black = black;
  }

  String lastMove() {
    return lastMove;
  }

  void lastMove(String lastMove) {
    this.lastMove = lastMove;
  }

  String lastMoveColor() {
    return lastMoveColor;
  }

  void lastMoveColor(String lastMoveColor) {
    this.lastMoveColor = lastMoveColor;
  }

  String lastMoveText() {
    return lastMoveText;
  }

  void lastMoveText(String lastMoveText) {
    this.lastMoveText = lastMoveText;
  }

  Map<String, WebSocketSession> sessions() {
    return sessions;
  }

  Map<String, String> sessionPlayers() {
    return sessionPlayers;
  }
}
