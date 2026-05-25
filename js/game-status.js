(function () {
  function t(key, params = {}) {
    return window.ChessI18n?.t(key, params) || key;
  }

  function createGameStatus({
    game,
    getPlayerColor,
    measure,
  }) {
    function colorName(color) {
      if (color === "w") {
        return t("color.w");
      }

      if (color === "b") {
        return t("color.b");
      }

      return "-";
    }

    function isGameOver() {
      return game.game_over();
    }

    function hasGameState(methodName) {
      return typeof game[methodName] === "function" && game[methodName]();
    }

    function getDrawReason() {
      if (hasGameState("in_stalemate")) {
        return t("status.stalemate");
      }

      if (hasGameState("in_threefold_repetition")) {
        return t("status.threefold");
      }

      if (hasGameState("insufficient_material")) {
        return t("status.insufficientMaterial");
      }

      return t("status.draw");
    }

    function getGameResult() {
      return measure("getGameResult", () => {
        if (game.in_checkmate()) {
          const winnerColor = game.turn() === "w" ? "b" : "w";

          return {
            detail: winnerColor === "w"
              ? t("result.whiteWins")
              : t("result.blackWins"),
            reason: t("result.checkmate"),
            type: "win",
            winnerColor,
          };
        }

        if (game.in_draw()) {
          return {
            detail: t("result.drawDetail"),
            reason: getDrawReason(),
            type: "draw",
            winnerColor: null,
          };
        }

        if (isGameOver()) {
          return {
            detail: t("result.finishedDetail"),
            reason: t("status.finished"),
            type: "finished",
            winnerColor: null,
          };
        }

        return null;
      });
    }

    function getResultFromStatusText(statusText) {
      const status = statusText || "";
      const lowerStatus = status.toLowerCase();

      if (lowerStatus.includes("tablas") || lowerStatus.includes("draw")) {
        return {
          detail: t("status.onlineDraw"),
          reason: status || t("status.draw"),
          type: "draw",
          winnerColor: null,
        };
      }

      const winnerColor = lowerStatus.includes("blancas") || lowerStatus.includes("white")
        ? "w"
        : lowerStatus.includes("negras") || lowerStatus.includes("black")
          ? "b"
          : null;

      if (winnerColor) {
        return {
          detail: winnerColor === "w"
            ? t("result.whiteWins")
            : t("result.blackWins"),
          reason: lowerStatus.includes("jaque mate") || lowerStatus.includes("checkmate")
            ? t("result.checkmate")
            : status || t("status.finished"),
          type: "win",
          winnerColor,
        };
      }

      return {
        detail: t("status.onlineFinished"),
        reason: status || t("status.finished"),
        type: "finished",
        winnerColor: null,
      };
    }

    function getResultPresentation(result, mode) {
      if (result.type === "draw") {
        return {
          detail: result.detail,
          reason: result.reason,
          title: t("result.draw"),
          variant: "draw",
        };
      }

      if (result.type === "win" && result.winnerColor) {
        const playerColor = getPlayerColor(mode);
        const didPlayerWin = playerColor && result.winnerColor === playerColor;

        return {
          detail: result.detail,
          reason: result.reason,
          title: didPlayerWin ? t("result.youWon") : t("result.youLost"),
          variant: didPlayerWin ? "win" : "loss",
        };
      }

      return {
        detail: result.detail,
        reason: result.reason,
        title: t("result.finished"),
        variant: "draw",
      };
    }

    function getResultKey(result, mode) {
      return [
        mode,
        game.fen(),
        result.type,
        result.winnerColor || "none",
        result.reason,
      ].join("|");
    }

    function getGameStatus() {
      return measure("getGameStatus", () => {
        if (game.in_checkmate()) {
          const winner = colorName(game.turn() === "w" ? "b" : "w");
          return t("status.checkmate", { winner });
        }

        if (game.in_draw()) {
          return t("status.draw");
        }

        if (isGameOver()) {
          return t("status.finished");
        }

        if (game.in_check()) {
          return t("status.check", { color: colorName(game.turn()) });
        }

        return t("status.inProgress");
      });
    }

    return {
      colorName,
      getGameResult,
      getGameStatus,
      getResultFromStatusText,
      getResultKey,
      getResultPresentation,
      isGameOver,
    };
  }

  window.ChessGameStatus = {
    create: createGameStatus,
  };
})();
