(function () {
  const STORAGE_KEY = "chessOnlineSession";

  function t(key, params = {}) {
    return window.ChessI18n?.t(key, params) || key;
  }

  function translateBackendCode(code) {
    const translations = {
      ACTION_ERROR: "online.actionError",
      CHAT_EMPTY: "engine.emptyChat",
      CHAT_TOO_LONG: "engine.chatTooLong",
      GAME_NOT_STARTED: "online.notStarted",
      ILLEGAL_MOVE: "online.illegalMove",
      INVALID_CONNECTION: "online.invalidConnection",
      INVALID_MOVE: "online.invalidMove",
      INVALID_ROOM_CODE: "online.invalidRoomCode",
      NOT_YOUR_TURN: "online.notYourTurn",
      ROOM_FULL: "online.roomFull",
      ROOM_NOT_FOUND: "online.roomNotFound",
      UNAUTHORIZED_PLAYER: "online.unauthorizedPlayer",
      UNSUPPORTED_MESSAGE: "online.unsupportedMessage",
    };
    const key = translations[code];

    return key ? t(key) : "";
  }

  function translateBackendMessage(message, fallbackKey = "online.actionError", code = "") {
    const codeTranslation = translateBackendCode(code);

    if (codeTranslation) {
      return codeTranslation;
    }

    const text = String(message || "").toLowerCase();

    if (text.includes("room is already full")) {
      return t("online.roomFull");
    }

    if (text.includes("game has not started")) {
      return t("online.notStarted");
    }

    if (text.includes("not your turn")) {
      return t("online.notYourTurn");
    }

    if (text.includes("illegal move")) {
      return t("online.illegalMove");
    }

    if (text.includes("invalid move")) {
      return t("online.invalidMove");
    }

    if (text.includes("message is empty")) {
      return t("engine.emptyChat");
    }

    if (text.includes("message cannot exceed 200")) {
      return t("engine.chatTooLong");
    }

    if (text.includes("room not found")) {
      return t("online.roomNotFound");
    }

    if (text.includes("unauthorized player")) {
      return t("online.unauthorizedPlayer");
    }

    if (text.includes("unsupported message")) {
      return t("online.unsupportedMessage");
    }

    if (text.includes("invalid connection")) {
      return t("online.invalidConnection");
    }

    if (text.includes("invalid room code")) {
      return t("online.invalidRoomCode");
    }

    return message || t(fallbackKey);
  }

  function createOnlineClient({
    backendBaseUrl,
    backendWsUrl,
    focusCodeInput,
    getCurrentMode,
    measure,
    now,
    onChat,
    onSessionStart,
    onState,
    record,
    setButtonsLocked,
    setEngineStatus,
    setMenuStatus,
  }) {
    let socket = null;
    let session = null;
    let state = null;

    function normalizeRoomCode(value) {
      return value
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 6);
    }

    function getSession() {
      return session;
    }

    function getState() {
      return state;
    }

    function opponentConnected(nextState) {
      if (!session || !nextState) {
        return false;
      }

      return session.color === "w"
        ? nextState.blackConnected
        : nextState.whiteConnected;
    }

    function updateConnectionStatus(nextState) {
      if (!session || !nextState) {
        setEngineStatus(t("engine.noOnlineRoom"), "loading");
        return;
      }

      if (nextState.roomStatus === "WAITING") {
        setEngineStatus(t("engine.waitingOpponent"), "loading");
        return;
      }

      if (nextState.roomStatus === "FINISHED") {
        setEngineStatus(t("engine.gameFinished"), "ready");
        return;
      }

      if (!opponentConnected(nextState)) {
        setEngineStatus(t("engine.opponentDisconnected"), "error");
        return;
      }

      if (nextState.turn === session.color) {
        setEngineStatus(t("engine.yourTurn"), "ready");
        return;
      }

      setEngineStatus(t("engine.opponentTurn"), "thinking");
    }

    function setState(nextState) {
      const previousState = state;

      state = nextState;
      onState(nextState, previousState);
      updateConnectionStatus(nextState);
    }

    function closeSocket() {
      if (!socket) {
        return;
      }

      socket.onopen = null;
      socket.onmessage = null;
      socket.onerror = null;
      socket.onclose = null;

      if (
        socket.readyState === WebSocket.OPEN ||
        socket.readyState === WebSocket.CONNECTING
      ) {
        socket.close();
      }

      socket = null;
    }

    function clearSession() {
      closeSocket();
      session = null;
      state = null;
      sessionStorage.removeItem(STORAGE_KEY);
    }

    function handleMessage(event) {
      return measure("online.wsMessage", () => {
        let payload;

        try {
          payload = JSON.parse(event.data);
        } catch (error) {
          console.warn("Invalid online message.", error);
          setEngineStatus(t("engine.invalidOnlineMessage"), "error");
          return;
        }

        if (payload.type === "state" && payload.state) {
          setState(payload.state);
          return;
        }

        if (payload.type === "error") {
          setEngineStatus(
            translateBackendMessage(payload.message, "engine.onlineError", payload.code),
            "error",
          );
          return;
        }

        if (payload.type === "chat" && payload.chat) {
          onChat(payload.chat);
          return;
        }

        console.warn("Unsupported online message.", payload);
      });
    }

    function connectSocket() {
      if (!session) {
        return;
      }

      closeSocket();
      setEngineStatus(t("engine.connectingRoom"), "loading");

      const params = new URLSearchParams({
        playerId: session.playerId,
        token: session.token,
      });
      const nextSocket = new WebSocket(
        `${backendWsUrl}/ws/rooms/${session.code}?${params.toString()}`,
      );

      socket = nextSocket;

      nextSocket.onopen = () => {
        if (socket === nextSocket) {
          updateConnectionStatus(state);
        }
      };

      nextSocket.onmessage = (event) => {
        if (socket === nextSocket) {
          handleMessage(event);
        }
      };

      nextSocket.onerror = () => {
        if (socket === nextSocket) {
          setEngineStatus(t("engine.connectionError"), "error");
        }
      };

      nextSocket.onclose = () => {
        if (socket === nextSocket) {
          socket = null;

          if (getCurrentMode() === "online") {
            setEngineStatus(t("engine.connectionClosed"), "error");
          }
        }
      };
    }

    function startSession(response) {
      clearSession();
      session = {
        code: response.code,
        color: response.color,
        playerId: response.playerId,
        token: response.token,
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      onSessionStart(response);

      if (response.state) {
        setState(response.state);
      }

      connectSocket();
    }

    async function fetchJson(path, options = {}) {
      const startedAt = now();

      try {
        const response = await fetch(`${backendBaseUrl}${path}`, {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
          ...options,
        });
        const contentType = response.headers.get("content-type") || "";
        const body = contentType.includes("application/json")
          ? await response.json()
          : await response.text();

        if (!response.ok) {
          const message =
            typeof body === "object" && body
              ? body.message || body.error || t("online.actionError")
              : body || t("online.actionError");
          const code = typeof body === "object" && body ? body.code || "" : "";

          const translatedError = new Error(
            translateBackendMessage(message, "online.actionError", code),
          );
          translatedError.code = code;
          throw translatedError;
        }

        return body;
      } finally {
        record("online.http", now() - startedAt);
      }
    }

    async function createRoom() {
      setButtonsLocked(true);
      setMenuStatus(t("online.creatingRoom"), "loading");

      try {
        const response = await fetchJson("/api/rooms");
        setMenuStatus(t("online.roomCreated", { code: response.code }), "ready");
        startSession(response);
      } catch (error) {
        console.warn("Could not create the room.", error);
        setMenuStatus(
          t("online.backendUnavailable"),
          "error",
        );
      } finally {
        setButtonsLocked(false);
      }
    }

    async function joinRoom(code) {
      const normalizedCode = normalizeRoomCode(code);

      if (normalizedCode.length !== 6) {
        setMenuStatus(t("online.codeLength"), "error");
        focusCodeInput();
        return;
      }

      setButtonsLocked(true);
      setMenuStatus(t("online.joiningRoom"), "loading");

      try {
        const response = await fetchJson(`/api/rooms/${normalizedCode}/join`);
        setMenuStatus(t("online.joinedRoom", { code: response.code }), "ready");
        startSession(response);
      } catch (error) {
        console.warn("Could not join the room.", error);
        setMenuStatus(
          translateBackendMessage(error.message, "online.joinError", error.code),
          "error",
        );
      } finally {
        setButtonsLocked(false);
      }
    }

    function sendMove({ from, to, promotion = "" }) {
      return measure("online.sendMove", () => {
        if (!socket || socket.readyState !== WebSocket.OPEN) {
          setEngineStatus(t("engine.roomNotConnected"), "error");
          return false;
        }

        socket.send(
          JSON.stringify({
            type: "move",
            from,
            to,
            promotion,
          }),
        );
        setEngineStatus(t("engine.sendingMove"), "thinking");
        return true;
      });
    }

    function sendChat(message) {
      return measure("online.sendChat", () => {
        const trimmedMessage = String(message || "").trim();

        if (!trimmedMessage) {
          setEngineStatus(t("engine.emptyChat"), "error");
          return false;
        }

        if (trimmedMessage.length > 200) {
          setEngineStatus(t("engine.chatTooLong"), "error");
          return false;
        }

        if (!socket || socket.readyState !== WebSocket.OPEN) {
          setEngineStatus(t("engine.roomNotConnected"), "error");
          return false;
        }

        socket.send(
          JSON.stringify({
            type: "chat",
            message: trimmedMessage,
          }),
        );
        return true;
      });
    }

    function canMovePiece(pieceColor) {
      return (
        session &&
        state &&
        state.roomStatus === "PLAYING" &&
        state.turn === session.color &&
        pieceColor === session.color
      );
    }

    function canSendMove() {
      return (
        session &&
        state &&
        state.roomStatus === "PLAYING" &&
        state.turn === session.color
      );
    }

    return {
      canMovePiece,
      canSendMove,
      clearSession,
      createRoom,
      getSession,
      getState,
      joinRoom,
      normalizeRoomCode,
      sendChat,
      sendMove,
    };
  }

  window.ChessOnlineClient = {
    create: createOnlineClient,
  };
})();
