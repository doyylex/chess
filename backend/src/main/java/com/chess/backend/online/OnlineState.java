package com.chess.backend.online;

public record OnlineState(
    String code,
    String fen,
    String turn,
    String roomStatus,
    String gameStatus,
    String statusCode,
    String winnerColor,
    String checkedColor,
    String lastMove,
    String lastMoveColor,
    String lastMoveText,
    boolean whiteConnected,
    boolean blackConnected) {}
