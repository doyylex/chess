package com.chess.backend.online;

final class OnlinePlayer {

  private final String id;
  private final String token;
  private final String color;

  OnlinePlayer(String id, String token, String color) {
    this.id = id;
    this.token = token;
    this.color = color;
  }

  String id() {
    return id;
  }

  String token() {
    return token;
  }

  String color() {
    return color;
  }
}
