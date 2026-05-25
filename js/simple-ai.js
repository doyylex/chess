(function () {
  const ChessLibrary = window.Chess;
  const Profiler = window.ChessProfiler;
  const pieceValues = {
    p: 100,
    n: 320,
    b: 330,
    r: 500,
    q: 900,
    k: 0,
  };

  function measure(name, callback) {
    if (!Profiler || typeof Profiler.measure !== "function") {
      return callback();
    }

    return Profiler.measure(name, callback);
  }

  function randomItem(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  function scoreMove(game, move, config) {
    return measure("simpleAi.evaluateMove", () => {
      const clone = new ChessLibrary(game.fen());
      let score = 0;

      if (move.captured) {
        score += pieceValues[move.captured] || 0;
      }

      if (move.promotion) {
        score += (pieceValues[move.promotion] || 0) - pieceValues.p;
      }

      const appliedMove = clone.move({
        from: move.from,
        to: move.to,
        promotion: move.promotion || "q",
      });

      if (!appliedMove) {
        return Number.NEGATIVE_INFINITY;
      }

      if (clone.in_checkmate()) {
        score += 10000;
      } else if (clone.in_check()) {
        score += config.checkBonus;
      }

      return score + (Math.random() * config.noise * 2 - config.noise);
    });
  }

  function chooseMove(game, config) {
    return measure("simpleAi.chooseMove", () => {
      if (!ChessLibrary || !game || typeof game.moves !== "function") {
        return null;
      }

      const moves = game.moves({ verbose: true });

      if (moves.length === 0) {
        return null;
      }

      if (Math.random() < config.randomMoveChance) {
        return randomItem(moves);
      }

      const scoredMoves = moves
        .map((move) => ({
          move,
          score: scoreMove(game, move, config),
        }))
        .sort((a, b) => b.score - a.score);
      const poolSize = Math.max(
        1,
        Math.min(config.candidatePool, scoredMoves.length),
      );

      return randomItem(scoredMoves.slice(0, poolSize)).move;
    });
  }

  window.SimpleChessAi = {
    chooseMove,
  };
})();
