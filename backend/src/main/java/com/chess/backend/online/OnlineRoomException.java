package com.chess.backend.online;

import org.springframework.http.HttpStatusCode;
import org.springframework.web.server.ResponseStatusException;

public class OnlineRoomException extends ResponseStatusException {

  private final String code;

  public OnlineRoomException(HttpStatusCode status, String code, String reason) {
    super(status, reason);
    this.code = code;
  }

  public String code() {
    return code;
  }
}
