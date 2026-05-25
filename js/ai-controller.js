(function () {
  function t(key, params = {}) {
    return window.ChessI18n?.t(key, params) || key;
  }

  function createAiController({
    colorName,
    engine,
    game,
    getCurrentMode,
    getEngineStatusState,
    getProfile,
    isGameOver,
    measure,
    playMoveSound,
    setDifficultyOptionsAvailability,
    setEngineStatus,
    setGameActionsLocked,
    setLastMove,
    simpleAi,
    syncBoardPosition,
    updateStatus,
  }) {
    let enabled = false;
    let thinking = false;
    let configuring = false;
    let engineReady = false;
    let engineFailed = false;
    let requestId = 0;

    function usesStockfish(profile = getProfile()) {
      return profile.aiType === "stockfish";
    }

    function usesSimpleAi(profile = getProfile()) {
      return profile.aiType === "simple";
    }

    function isEnabled() {
      return enabled;
    }

    function isEngineReady() {
      return engineReady;
    }

    function isEngineFailed() {
      return engineFailed;
    }

    function blocksInput() {
      return thinking || (enabled && configuring);
    }

    function setEnabled(nextEnabled) {
      enabled = Boolean(nextEnabled);
    }

    function cancel() {
      requestId += 1;
      thinking = false;
    }

    function disable() {
      cancel();
      enabled = false;
    }

    function stopEngine() {
      if (engine) {
        engine.stop();
      }
    }

    function setReadyStatus() {
      if (usesSimpleAi()) {
        setEngineStatus(t("engine.simpleReady"), "ready");
        return;
      }

      if (engineReady) {
        setEngineStatus(t("engine.stockfishReady"), "ready");
        return;
      }

      setEngineStatus(t("engine.stockfishUnavailable"), "error");
    }

    function parseUciMove(uciMove) {
      if (!uciMove || uciMove === "(none)" || uciMove.length < 4) {
        return null;
      }

      return {
        from: uciMove.slice(0, 2),
        to: uciMove.slice(2, 4),
        promotion: uciMove.slice(4, 5) || "q",
      };
    }

    function applyEngineMove(bestMove) {
      return measure("engine.applyMove", () => {
        const parsedMove = parseUciMove(bestMove);

        if (!parsedMove) {
          return null;
        }

        return measure("game.move", () => game.move(parsedMove));
      });
    }

    function applySimpleAiMove(simpleMove) {
      return measure("simpleAi.applyMove", () => {
        if (!simpleMove) {
          return null;
        }

        return measure("game.move", () =>
          game.move({
            from: simpleMove.from,
            to: simpleMove.to,
            promotion: simpleMove.promotion || "q",
          }),
        );
      });
    }

    function wait(ms) {
      return new Promise((resolve) => {
        window.setTimeout(resolve, ms);
      });
    }

    async function getSimpleAiMove(profile) {
      if (profile.moveDelay > 0) {
        await wait(profile.moveDelay);
      }

      return simpleAi.chooseMove(game, profile);
    }

    async function maybeRequestMove() {
      const profile = getProfile();

      if (
        !enabled ||
        thinking ||
        configuring ||
        getCurrentMode() !== "ai" ||
        game.turn() !== "b" ||
        isGameOver()
      ) {
        return;
      }

      if (usesStockfish(profile) && (!engine || !engineReady)) {
        return;
      }

      if (usesSimpleAi(profile) && !simpleAi) {
        setEngineStatus(t("engine.simpleUnavailable"), "error");
        return;
      }

      const activeRequestId = ++requestId;
      thinking = true;
      setEngineStatus(t("engine.thinking"), "thinking");

      try {
        const nextMove = usesSimpleAi(profile)
          ? await getSimpleAiMove(profile)
          : await engine.getBestMove(game.fen(), profile.moveTime);

        if (
          activeRequestId !== requestId ||
          !enabled ||
          getCurrentMode() !== "ai" ||
          game.turn() !== "b" ||
          isGameOver()
        ) {
          return;
        }

        const move = usesSimpleAi(profile)
          ? applySimpleAiMove(nextMove)
          : applyEngineMove(nextMove);

        if (!move) {
          console.warn("The AI returned an invalid move.");
          setEngineStatus(t("engine.invalidMove"), "error");
          return;
        }

        setLastMove(`${colorName(move.color)}: ${move.san}`);
        syncBoardPosition();
        playMoveSound(move);
        updateStatus();
      } catch (error) {
        console.warn("Could not get a move from Stockfish.", error);
        setEngineStatus(t("engine.error"), "error");
      } finally {
        if (activeRequestId === requestId) {
          thinking = false;

          if (getEngineStatusState() !== "error") {
            setReadyStatus();
          }
        }
      }
    }

    function scheduleMove() {
      window.setTimeout(() => {
        maybeRequestMove();
      }, 0);
    }

    async function applySelectedDifficulty() {
      const profile = getProfile();

      if (configuring || !enabled) {
        return;
      }

      if (usesSimpleAi(profile)) {
        setReadyStatus();
        maybeRequestMove();
        return;
      }

      if (!engine || engineFailed || typeof engine.setDifficulty !== "function") {
        setEngineStatus(t("engine.stockfishUnavailable"), "error");
        return;
      }

      configuring = true;
      setGameActionsLocked(true);
      setEngineStatus(t("engine.configuring"), "loading");

      try {
        await engine.setDifficulty(profile.skillLevel);
      } catch (error) {
        console.warn("Could not configure Stockfish difficulty.", error);
        engineReady = false;
        engineFailed = true;
        enabled = false;
        setDifficultyOptionsAvailability();
        setEngineStatus(t("engine.error"), "error");
      } finally {
        configuring = false;
        setGameActionsLocked(false);

        if (getCurrentMode() === "ai" && engineReady && !engineFailed) {
          setEngineStatus(t("engine.stockfishReady"), "ready");
          maybeRequestMove();
        }
      }
    }

    function resetForNewGame() {
      cancel();

      if (engine) {
        engine.stop();
        measure("engine.newGame", () => engine.newGame());
      }

      if (engineReady) {
        setEngineStatus(t("engine.stockfishReady"), "ready");
      }

      if (enabled) {
        applySelectedDifficulty();
      }
    }

    function handleEngineStatus({ state, message }) {
      if (getCurrentMode() === "online") {
        if (state === "ready") {
          engineReady = true;
          engineFailed = false;
          setDifficultyOptionsAvailability();
          return;
        }

        if (state === "error") {
          engineReady = false;
          engineFailed = true;
          setDifficultyOptionsAvailability();
          return;
        }

        if (state !== "thinking") {
          engineReady = false;
        }

        return;
      }

      if (state === "ready") {
        engineReady = true;
        engineFailed = false;
        setDifficultyOptionsAvailability();
        setEngineStatus(t("engine.stockfishReady"), "ready");
        maybeRequestMove();
        return;
      }

      if (state === "thinking") {
        setEngineStatus(t("engine.thinking"), "thinking");
        return;
      }

      if (state === "error") {
        engineReady = false;
        engineFailed = true;
        setDifficultyOptionsAvailability();

        if (enabled && usesStockfish()) {
          enabled = false;
          setEngineStatus(t("engine.error"), "error");
          return;
        }

        setEngineStatus(t("engine.stockfishUnavailableLow"), "error");
        return;
      }

      engineReady = false;
      setEngineStatus(message || t("engine.loading"), "loading");
    }

    function markEngineUnavailable() {
      engineFailed = true;
      setDifficultyOptionsAvailability();
      setEngineStatus(t("engine.stockfishUnavailableLow"), "error");
    }

    return {
      applySelectedDifficulty,
      blocksInput,
      cancel,
      disable,
      handleEngineStatus,
      isEnabled,
      isEngineFailed,
      isEngineReady,
      markEngineUnavailable,
      maybeRequestMove,
      resetForNewGame,
      scheduleMove,
      setEnabled,
      stopEngine,
      usesSimpleAi,
      usesStockfish,
    };
  }

  window.ChessAiController = {
    create: createAiController,
  };
})();
