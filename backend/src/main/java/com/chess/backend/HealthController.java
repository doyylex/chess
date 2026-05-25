package com.chess.backend;

import java.time.Instant;
import java.util.Map;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

  @CrossOrigin(origins = {"http://127.0.0.1:8000", "http://localhost:8000"})
  @GetMapping("/api/health")
  public Map<String, String> health() {
    return Map.of(
        "status", "ok",
        "service", "chess-backend",
        "time", Instant.now().toString());
  }
}
