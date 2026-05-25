(function () {
  function createMoveSoundEvents({
    game,
    isGameOver,
    playSound,
  }) {
    function getMoveSoundKind(move) {
      if (game.in_checkmate() || game.in_draw() || isGameOver()) {
        return null;
      }

      if (game.in_check()) {
        return "check";
      }

      if (move?.promotion) {
        return "promotion";
      }

      if (move?.captured || move?.san?.includes("x")) {
        return "capture";
      }

      return "move";
    }

    function playMove(move) {
      const soundKind = getMoveSoundKind(move);

      if (soundKind) {
        playSound(soundKind);
      }
    }

    function playResult(variant) {
      if (variant === "win") {
        playSound("win");
        return;
      }

      if (variant === "loss") {
        playSound("loss");
        return;
      }

      playSound("draw");
    }

    function getMoveSoundKindFromState(state) {
      if (state?.roomStatus === "FINISHED") {
        return null;
      }

      const san = state?.lastMove || "";

      if (game.in_check()) {
        return "check";
      }

      if (san.includes("=")) {
        return "promotion";
      }

      if (san.includes("x")) {
        return "capture";
      }

      return san && san !== "None" ? "move" : null;
    }

    return {
      getMoveSoundKind,
      getMoveSoundKindFromState,
      playMove,
      playResult,
    };
  }

  window.ChessMoveSoundEvents = {
    create: createMoveSoundEvents,
  };
})();
