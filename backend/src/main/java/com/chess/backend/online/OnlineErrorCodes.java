package com.chess.backend.online;

final class OnlineErrorCodes {

  static final String ACTION_ERROR = "ACTION_ERROR";
  static final String CHAT_EMPTY = "CHAT_EMPTY";
  static final String CHAT_TOO_LONG = "CHAT_TOO_LONG";
  static final String GAME_NOT_STARTED = "GAME_NOT_STARTED";
  static final String ILLEGAL_MOVE = "ILLEGAL_MOVE";
  static final String INVALID_CONNECTION = "INVALID_CONNECTION";
  static final String INVALID_MOVE = "INVALID_MOVE";
  static final String INVALID_ROOM_CODE = "INVALID_ROOM_CODE";
  static final String NOT_YOUR_TURN = "NOT_YOUR_TURN";
  static final String ROOM_FULL = "ROOM_FULL";
  static final String ROOM_NOT_FOUND = "ROOM_NOT_FOUND";
  static final String UNAUTHORIZED_PLAYER = "UNAUTHORIZED_PLAYER";
  static final String UNSUPPORTED_MESSAGE = "UNSUPPORTED_MESSAGE";

  private OnlineErrorCodes() {}
}
