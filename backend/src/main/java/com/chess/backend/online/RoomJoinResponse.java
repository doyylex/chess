package com.chess.backend.online;

public record RoomJoinResponse(
    String code,
    String playerId,
    String token,
    String color,
    OnlineState state) {}
