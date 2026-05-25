package com.chess.backend.online;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class OnlineExceptionHandler {

  @ExceptionHandler(OnlineRoomException.class)
  public ResponseEntity<OnlineErrorResponse> handleOnlineRoomException(
      OnlineRoomException error) {
    return ResponseEntity.status(error.getStatusCode())
        .body(new OnlineErrorResponse(error.code(), error.getReason()));
  }
}
