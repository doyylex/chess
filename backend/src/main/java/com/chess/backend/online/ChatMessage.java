package com.chess.backend.online;

public record ChatMessage(String senderColor, String senderLabel, String message, String sentAt) {}
