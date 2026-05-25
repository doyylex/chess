package com.chess.backend.online;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/rooms")
@CrossOrigin(origins = {"http://127.0.0.1:8000", "http://localhost:8000"})
public class RoomController {

  private final OnlineRoomService onlineRoomService;

  public RoomController(OnlineRoomService onlineRoomService) {
    this.onlineRoomService = onlineRoomService;
  }

  @PostMapping
  public RoomJoinResponse createRoom() {
    return onlineRoomService.createRoom();
  }

  @PostMapping("/{code}/join")
  public RoomJoinResponse joinRoom(@PathVariable String code) {
    return onlineRoomService.joinRoom(code);
  }
}
