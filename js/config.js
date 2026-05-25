(function () {
  const backendHost = window.location.hostname || "localhost";
  const backendHttpProtocol = window.location.protocol === "https:" ? "https" : "http";
  const backendWsProtocol = window.location.protocol === "https:" ? "wss" : "ws";

  window.ChessConfig = {
    basePieceUrl: "vendor/pieces/wikipedia/",
    backendBaseUrl: `${backendHttpProtocol}://${backendHost}:8080`,
    backendWsUrl: `${backendWsProtocol}://${backendHost}:8080`,
    defaultDifficulty: "normal",
    defaultTheme: "principal",
    themeStorageKey: "chessTheme",
    themes: new Set(["principal", "neon", "tournament", "wood"]),
    difficultyProfiles: {
      easy: {
        aiType: "simple",
        candidatePool: 10,
        checkBonus: 25,
        labelKey: "difficulty.easy.label",
        moveDelay: 250,
        noise: 650,
        randomMoveChance: 0.8,
      },
      normal: {
        aiType: "simple",
        candidatePool: 5,
        checkBonus: 45,
        labelKey: "difficulty.normal.label",
        moveDelay: 350,
        noise: 220,
        randomMoveChance: 0.3,
      },
      hard: {
        aiType: "stockfish",
        labelKey: "difficulty.hard.label",
        moveTime: 800,
        skillLevel: 10,
      },
      expert: {
        aiType: "stockfish",
        labelKey: "difficulty.expert.label",
        moveTime: 1200,
        skillLevel: 20,
      },
    },
  };
})();
