(function () {
  const currentScript = document.currentScript;
  const stockfishScriptUrl = new URL(
    "../vendor/stockfish/stockfish-18-lite-single.js",
    currentScript.src,
  );

  function now() {
    return window.performance && window.performance.now
      ? window.performance.now()
      : Date.now();
  }

  function t(key, params = {}) {
    return window.ChessI18n?.t(key, params) || key;
  }

  function createStockfishEngine() {
    const profiler = window.ChessProfiler;
    const listeners = new Set();
    let worker = null;
    let state = "idle";
    let initPromise = null;
    let initStartedAt = 0;
    let pendingReady = null;
    let pendingBestMove = null;

    function measure(name, callback) {
      if (!profiler || typeof profiler.measure !== "function") {
        return callback();
      }

      return profiler.measure(name, callback);
    }

    function record(name, durationMs) {
      if (profiler && typeof profiler.record === "function") {
        profiler.record(name, durationMs);
      }
    }

    function emit(nextState, message) {
      state = nextState;
      listeners.forEach((listener) => listener({ state, message }));
    }

    function post(command) {
      if (worker) {
        worker.postMessage(command);
      }
    }

    function rejectPending(error) {
      if (pendingReady) {
        window.clearTimeout(pendingReady.timeoutId);
        pendingReady.reject(error);
        pendingReady = null;
      }

      if (pendingBestMove) {
        window.clearTimeout(pendingBestMove.timeoutId);
        pendingBestMove.reject(error);
        pendingBestMove = null;
      }
    }

    function handleBestMove(line) {
      measure("engine.bestmove", () => {
        if (!pendingBestMove) {
          return;
        }

        const parts = line.split(/\s+/);
        const bestMove = parts[1];
        const elapsed = now() - pendingBestMove.startedAt;

        window.clearTimeout(pendingBestMove.timeoutId);
        record("engine.thinkTime", elapsed);
        pendingBestMove.resolve(bestMove);
        pendingBestMove = null;
        emit("ready", t("engine.stockfishReady"));
      });
    }

    function handleLine(line) {
      measure("engine.workerMessage", () => {
        if (line === "uciok") {
          post("isready");
          return;
        }

        if (line === "readyok") {
          if (pendingReady) {
            const readyRequest = pendingReady;

            pendingReady = null;
            window.clearTimeout(readyRequest.timeoutId);
            readyRequest.resolve();

            if (readyRequest.metricName) {
              record(readyRequest.metricName, now() - readyRequest.startedAt);
            }

            emit("ready", t("engine.stockfishReady"));
            return;
          }

          emit("ready", t("engine.stockfishReady"));
          return;
        }

        if (line.startsWith("bestmove ")) {
          handleBestMove(line);
        }
      });
    }

    function waitForReady(metricName, timeoutMessage, timeoutMs = 10000) {
      if (!worker) {
        return Promise.reject(new Error(t("engine.stockfishUnavailable")));
      }

      if (pendingReady) {
        return Promise.reject(new Error(t("engine.error")));
      }

      return new Promise((resolve, reject) => {
        pendingReady = {
          resolve,
          reject,
          metricName,
          startedAt: now(),
          timeoutId: window.setTimeout(() => {
            const error = new Error(timeoutMessage);
            const readyRequest = pendingReady;

            pendingReady = null;
            emit("error", t("engine.error"));
            readyRequest.reject(error);
          }, timeoutMs),
        };

        post("isready");
      });
    }

    function init() {
      if (initPromise) {
        return initPromise;
      }

      initStartedAt = now();
      emit("loading", t("engine.loading"));

      initPromise = new Promise((resolve, reject) => {
        measure("engine.init", () => {
          try {
            worker = new Worker(stockfishScriptUrl.href);

            worker.onmessage = (event) => handleLine(String(event.data));
            worker.onerror = (event) => {
              const error = new Error(event.message || t("engine.error"));
              emit("error", t("engine.error"));
              rejectPending(error);
              reject(error);
            };

            pendingReady = {
              resolve,
              reject,
              metricName: "engine.ready",
              startedAt: initStartedAt,
              timeoutId: window.setTimeout(() => {
                const error = new Error(t("engine.error"));
                emit("error", t("engine.error"));
                rejectPending(error);
                reject(error);
              }, 20000),
            };

            post("uci");
          } catch (error) {
            emit("error", t("engine.error"));
            reject(error);
          }
        });
      });

      return initPromise;
    }

    async function setDifficulty(skillLevel) {
      await init();

      const numericSkill = Number(skillLevel);
      const normalizedSkill = Number.isFinite(numericSkill)
        ? Math.min(20, Math.max(0, Math.round(numericSkill)))
        : 20;

      post(`setoption name Skill Level value ${normalizedSkill}`);
      return waitForReady(
        "engine.setDifficulty",
        t("engine.error"),
      );
    }

    async function getBestMove(fen, moveTime) {
      await init();

      if (pendingBestMove) {
        throw new Error(t("engine.thinking"));
      }

      emit("thinking", t("engine.thinking"));

      return new Promise((resolve, reject) => {
        pendingBestMove = {
          resolve,
          reject,
          startedAt: now(),
          timeoutId: window.setTimeout(() => {
            const error = new Error(t("engine.error"));
            pendingBestMove = null;
            emit("ready", t("engine.stockfishReady"));
            reject(error);
          }, Math.max(moveTime + 10000, 12000)),
        };

        post(`position fen ${fen}`);
        post(`go movetime ${moveTime}`);
      });
    }

    function newGame() {
      if (worker) {
        post("ucinewgame");
      }
    }

    function stop() {
      if (worker && pendingBestMove) {
        post("stop");
      }
    }

    function onStatus(listener) {
      listeners.add(listener);
      listener({ state, message: state });

      return () => {
        listeners.delete(listener);
      };
    }

    window.addEventListener("beforeunload", () => {
      if (worker) {
        post("quit");
      }
    });

    return {
      getBestMove,
      init,
      newGame,
      onStatus,
      setDifficulty,
      stop,
    };
  }

  window.createStockfishEngine = createStockfishEngine;
})();
