const ChessLibrary = window.Chess;
const ChessboardLibrary = window.Chessboard || window.ChessBoard;
const Profiler = window.ChessProfiler;
const Sounds = window.ChessSounds;
const StockfishEngineFactory = window.createStockfishEngine;
const SimpleChessAi = window.SimpleChessAi;
const Config = window.ChessConfig;
const ThemeUiFactory = window.ChessThemeUi;
const ResultModalFactory = window.ChessResultModal;
const PromotionModalFactory = window.ChessPromotionModal;
const MoveHintsFactory = window.ChessMoveHints;
const OnlineClientFactory = window.ChessOnlineClient;
const GameStatusFactory = window.ChessGameStatus;
const MoveSoundEventsFactory = window.ChessMoveSoundEvents;
const AiControllerFactory = window.ChessAiController;
const I18n = window.ChessI18n;

const startMenu = document.querySelector("#start-menu");
const gameApp = document.querySelector("#game-app");
const startLocalButton = document.querySelector("#start-local-button");
const startAiButton = document.querySelector("#start-ai-button");
const startOnlineButton = document.querySelector("#start-online-button");
const styleMenuButton = document.querySelector("#style-menu-button");
const stylePanel = document.querySelector("#style-panel");
const styleMenuCloseButton = document.querySelector("#style-menu-close-button");
const styleCards = document.querySelectorAll("#style-panel .style-card");
const languageMenuButton = document.querySelector("#language-menu-button");
const languagePanel = document.querySelector("#language-panel");
const languageMenuCloseButton = document.querySelector("#language-menu-close-button");
const languageCards = document.querySelectorAll(".language-card");
const startDifficultyPanel = document.querySelector("#difficulty-panel");
const onlinePanel = document.querySelector("#online-panel");
const aiDifficultySelect = document.querySelector("#ai-difficulty");
const startAiConfirmButton = document.querySelector("#start-ai-confirm-button");
const aiMenuCloseButton = document.querySelector("#ai-menu-close-button");
const difficultyCards = document.querySelectorAll(".difficulty-card");
const createRoomButton = document.querySelector("#create-room-button");
const onlineChoiceActions = document.querySelector("#online-choice-actions");
const showJoinRoomButton = document.querySelector("#show-join-room-button");
const onlineJoinForm = document.querySelector("#online-join-form");
const onlineMenuCloseButton = document.querySelector("#online-menu-close-button");
const onlineBackButton = document.querySelector("#online-back-button");
const roomCodeInput = document.querySelector("#room-code-input");
const joinRoomButton = document.querySelector("#join-room-button");
const onlineMenuStatusElement = document.querySelector("#online-menu-status");
const startEngineStatusElement = document.querySelector("#start-engine-status");
const turnElement = document.querySelector("#turn");
const lastMoveElement = document.querySelector("#last-move");
const statusElement = document.querySelector("#game-status");
const appEyebrow = document.querySelector("#app-eyebrow");
const modeLabel = document.querySelector("#mode-label");
const difficultyLabel = document.querySelector("#difficulty-label");
const onlineLabel = document.querySelector("#online-label");
const resetButton = document.querySelector("#reset-button");
const changeModeButton = document.querySelector("#change-mode-button");
const profilerToggleButton = document.querySelector("#profiler-toggle-button");
const profilerPanel = document.querySelector("#profiler-panel");
const promotionModal = document.querySelector("#promotion-modal");
const promotionCloseButton = document.querySelector("#promotion-close-button");
const promotionButtons = document.querySelectorAll(".promotion-btn");
const resultModal = document.querySelector("#result-modal");
const resultCard = resultModal?.querySelector(".result-card");
const resultTitleElement = document.querySelector("#result-title");
const resultReasonElement = document.querySelector("#result-reason");
const resultDetailElement = document.querySelector("#result-detail");
const resultActions = resultModal?.querySelector(".result-actions");
const resultPrimaryButton = document.querySelector("#result-primary-button");
const resultMenuButton = document.querySelector("#result-menu-button");
const engineStatusElement = document.querySelector("#engine-status");
const chatMessagesElement = document.querySelector("#chat-messages");
const chatEmptyElement = document.querySelector("#chat-empty");
const chatStatusElement = document.querySelector("#chat-status");
const chatForm = document.querySelector("#chat-form");
const chatInput = document.querySelector("#chat-input");

const basePieceUrl = Config.basePieceUrl;
const backendBaseUrl = Config.backendBaseUrl;
const backendWsUrl = Config.backendWsUrl;
const DEFAULT_THEME = Config.defaultTheme;
const THEMES = Config.themes;
const DEFAULT_DIFFICULTY = Config.defaultDifficulty;
const DIFFICULTY_PROFILES = Config.difficultyProfiles;

function t(key, params = {}) {
  return I18n?.t(key, params) || key;
}

if (!ChessLibrary) {
  statusElement.textContent = t("errors.chessJs");
  throw new Error(t("errors.chessJs"));
}

if (!ChessboardLibrary) {
  statusElement.textContent = t("errors.chessboardJs");
  throw new Error(t("errors.chessboardJs"));
}

const game = new ChessLibrary();
const engine = StockfishEngineFactory
  ? measure("engine.create", () => StockfishEngineFactory())
  : null;

let board = null;
let currentMode = "menu";
let lastMove = t("move.none");
let pendingPromotion = null;
let selectedDifficulty = DEFAULT_DIFFICULTY;
let shownResultKey = null;
const themeUi = ThemeUiFactory.create({
  cards: styleCards,
  defaultTheme: DEFAULT_THEME,
  storageKey: Config.themeStorageKey,
  themes: THEMES,
});
const gameStatus = GameStatusFactory.create({
  game,
  getPlayerColor: (mode) =>
    mode === "online" ? onlineClient.getSession()?.color || null : "w",
  measure,
});
const soundEvents = MoveSoundEventsFactory.create({
  game,
  isGameOver: () => gameStatus.isGameOver(),
  playSound,
});
const resultUi = ResultModalFactory.create({
  actions: resultActions,
  card: resultCard,
  detailElement: resultDetailElement,
  menuButton: resultMenuButton,
  modal: resultModal,
  playResultSound,
  primaryButton: resultPrimaryButton,
  reasonElement: resultReasonElement,
  titleElement: resultTitleElement,
});
const promotionUi = PromotionModalFactory.create({
  basePieceUrl,
  measure,
  modal: promotionModal,
});
const moveHints = MoveHintsFactory.create({
  canMovePiece,
  getLegalMoves: () => game.moves({ verbose: true }),
  measure,
});
const onlineClient = OnlineClientFactory.create({
  backendBaseUrl,
  backendWsUrl,
  focusCodeInput: () => roomCodeInput.focus(),
  getCurrentMode: () => currentMode,
  measure,
  now,
  onChat: handleOnlineChat,
  onSessionStart: startOnlineSession,
  onState: handleOnlineState,
  record,
  setButtonsLocked: setOnlineButtonsLocked,
  setEngineStatus,
  setMenuStatus: setOnlineMenuStatus,
});
const aiController = AiControllerFactory.create({
  colorName,
  engine,
  game,
  getCurrentMode: () => currentMode,
  getEngineStatusState: () => engineStatusElement.dataset.state,
  getProfile: getDifficultyProfile,
  isGameOver,
  measure,
  playMoveSound,
  setDifficultyOptionsAvailability,
  setEngineStatus,
  setGameActionsLocked,
  setLastMove: (moveLabel) => {
    lastMove = moveLabel;
  },
  simpleAi: SimpleChessAi,
  syncBoardPosition: () => {
    measure("board.position", () => board.position(game.fen()));
  },
  updateStatus,
});

function playSound(kind) {
  if (Sounds && typeof Sounds.play === "function") {
    Sounds.play(kind);
  }
}

function readSavedTheme() {
  return themeUi.readSaved();
}

function applyTheme(theme, { persist = true } = {}) {
  themeUi.apply(theme, { persist });
}

function measure(name, callback) {
  if (!Profiler || typeof Profiler.measure !== "function") {
    return callback();
  }

  return Profiler.measure(name, callback);
}

function record(name, durationMs) {
  if (Profiler && typeof Profiler.record === "function") {
    Profiler.record(name, durationMs);
  }
}

function now() {
  return window.performance && window.performance.now
    ? window.performance.now()
    : Date.now();
}

function colorName(color) {
  return gameStatus.colorName(color);
}

function difficultyLabelFor(difficultyKey = selectedDifficulty) {
  const profile = DIFFICULTY_PROFILES[difficultyKey] || DIFFICULTY_PROFILES.normal;
  return t(profile.labelKey || `difficulty.${difficultyKey}.label`);
}

function getDifficultyProfile() {
  return DIFFICULTY_PROFILES[selectedDifficulty] || DIFFICULTY_PROFILES.normal;
}

function usesStockfish(profile = getDifficultyProfile()) {
  return aiController.usesStockfish(profile);
}

function usesSimpleAi(profile = getDifficultyProfile()) {
  return aiController.usesSimpleAi(profile);
}

function syncDifficultyCardsAvailability() {
  difficultyCards.forEach((card) => {
    const difficultyKey = card.dataset.difficulty;
    const option = Array.from(aiDifficultySelect.options).find(
      (selectOption) => selectOption.value === difficultyKey,
    );
    const isDisabled = Boolean(option?.disabled);

    card.disabled = isDisabled;
    card.setAttribute("aria-disabled", String(isDisabled));
    card.classList.remove("difficulty-card-selected");
  });
}

function setDifficultyOptionsAvailability() {
  const stockfishUnavailable = !engine || aiController.isEngineFailed();
  const simpleUnavailable = !SimpleChessAi;

  Array.from(aiDifficultySelect.options).forEach((option) => {
    const profile = DIFFICULTY_PROFILES[option.value];

    if (!profile) {
      return;
    }

    option.disabled =
      (usesStockfish(profile) && stockfishUnavailable) ||
      (usesSimpleAi(profile) && simpleUnavailable);
  });

  if (aiDifficultySelect.selectedOptions[0]?.disabled) {
    const fallbackOption = Array.from(aiDifficultySelect.options).find(
      (option) => !option.disabled,
    );

    if (fallbackOption) {
      selectedDifficulty = fallbackOption.value;
      aiDifficultySelect.value = fallbackOption.value;
    }
  }

  startAiButton.disabled = simpleUnavailable && stockfishUnavailable;
  startAiConfirmButton.disabled =
    !aiDifficultySelect.value || aiDifficultySelect.selectedOptions[0]?.disabled;
  syncDifficultyCardsAvailability();
}

function setSelectedDifficulty(difficultyKey) {
  selectedDifficulty = DIFFICULTY_PROFILES[difficultyKey]
    ? difficultyKey
    : DEFAULT_DIFFICULTY;

  if (aiDifficultySelect) {
    aiDifficultySelect.value = selectedDifficulty;
  }

  setDifficultyOptionsAvailability();

  if (aiDifficultySelect) {
    aiDifficultySelect.value = selectedDifficulty;
  }

  difficultyLabel.textContent = t("game.difficulty", {
    difficulty: difficultyLabelFor(selectedDifficulty),
  });
}

function isGameOver() {
  return gameStatus.isGameOver();
}

function getGameResult() {
  return gameStatus.getGameResult();
}

function getResultFromStatusText(statusText) {
  return gameStatus.getResultFromStatusText(statusText);
}

function getResultPresentation(result, mode) {
  return gameStatus.getResultPresentation(result, mode);
}

function getResultKey(result, mode) {
  return gameStatus.getResultKey(result, mode);
}

function playMoveSound(move) {
  soundEvents.playMove(move);
}

function playResultSound(variant) {
  soundEvents.playResult(variant);
}

function getMoveSoundKindFromState(state) {
  return soundEvents.getMoveSoundKindFromState(state);
}

function closeResultModal() {
  resultUi.close();
}

function clearResultNotice() {
  shownResultKey = null;
  closeResultModal();
}

function showResultModal(result, mode = currentMode) {
  const presentation = getResultPresentation(result, mode);
  resultUi.show(result, presentation, mode);
}

function maybeShowGameResult() {
  if (currentMode !== "local" && currentMode !== "ai") {
    return;
  }

  const result = getGameResult();

  if (!result) {
    return;
  }

  const resultKey = getResultKey(result, currentMode);

  if (shownResultKey === resultKey) {
    return;
  }

  shownResultKey = resultKey;
  showResultModal(result, currentMode);
}

function maybeShowOnlineResult(state) {
  if (currentMode !== "online" || state?.roomStatus !== "FINISHED") {
    return;
  }

  const result =
    getGameResult() ||
    getOnlineResultFromState(state) ||
    getResultFromStatusText(state.gameStatus);
  const resultKey = getResultKey(result, "online");

  if (shownResultKey === resultKey) {
    return;
  }

  shownResultKey = resultKey;
  showResultModal(result, "online");
}

function isPromotionMove(source, target) {
  return measure("isPromotionMove", () => {
    const moves = measure("game.moves", () => game.moves({ verbose: true }));

    return moves.some((move) => {
      return move.from === source && move.to === target && move.promotion;
    });
  });
}

function clearMoveHints() {
  return moveHints.clear();
}

function bindBoardHintEvents() {
  moveHints.bindEvents();
}

function showMoveHints(square, piece) {
  return moveHints.show(square, piece);
}

function getGameStatus() {
  return gameStatus.getGameStatus();
}

function updateStatus() {
  return measure("updateStatus", () => {
    turnElement.textContent = colorName(game.turn());
    lastMoveElement.textContent = lastMove;
    statusElement.textContent = getGameStatus();
    maybeShowGameResult();
  });
}

function setEngineStatus(message, state) {
  engineStatusElement.textContent = message;
  engineStatusElement.dataset.state = state;

  if (startEngineStatusElement) {
    startEngineStatusElement.textContent = message;
    startEngineStatusElement.dataset.state = state;
  }
}

function setGameActionsLocked(isLocked) {
  resetButton.disabled = isLocked || currentMode === "online";
  changeModeButton.disabled = isLocked;
}

function setModeUi(mode) {
  const isAiMode = mode === "ai";
  const isOnlineMode = mode === "online";
  gameApp.dataset.mode = mode;
  appEyebrow.textContent = isAiMode
    ? t("game.aiEyebrow")
    : isOnlineMode
      ? t("game.onlineEyebrow")
      : t("game.localEyebrow");
  modeLabel.textContent = isAiMode
    ? t("game.mode.ai")
    : isOnlineMode
      ? t("game.mode.online")
      : t("game.mode.local");
  difficultyLabel.classList.toggle("panel-hidden", !isAiMode);
  onlineLabel.classList.toggle("panel-hidden", !isOnlineMode);
  resetButton.disabled = isOnlineMode;
  setSelectedDifficulty(selectedDifficulty);
}

function setOnlineMenuStatus(message, state = "loading") {
  onlineMenuStatusElement.textContent = message;
  onlineMenuStatusElement.dataset.state = state;
}

function setOnlineButtonsLocked(isLocked) {
  createRoomButton.disabled = isLocked;
  showJoinRoomButton.disabled = isLocked;
  joinRoomButton.disabled = isLocked;
  onlineBackButton.disabled = isLocked;
  onlineMenuCloseButton.disabled = isLocked;
  roomCodeInput.disabled = isLocked;
}

function setChatStatus(message, state = "idle") {
  if (!chatStatusElement) {
    return;
  }

  chatStatusElement.textContent = message;
  chatStatusElement.dataset.state = state;
}

function clearChatMessages() {
  if (!chatMessagesElement) {
    return;
  }

  chatMessagesElement
    .querySelectorAll(".chat-message")
    .forEach((messageElement) => messageElement.remove());
  chatEmptyElement?.classList.remove("panel-hidden");
  setChatStatus("", "idle");
}

function normalizeRoomCode(value) {
  return onlineClient.normalizeRoomCode(value);
}

function translateOnlineMoveLabel(moveLabel) {
  if (!moveLabel || moveLabel === "None") {
    return t("move.none");
  }

  return moveLabel
    .replace(/^White:/, `${colorName("w")}:`)
    .replace(/^Black:/, `${colorName("b")}:`);
}

function formatOnlineMove(state) {
  if (state?.lastMoveColor && state?.lastMoveText) {
    return t("move.label", {
      color: colorName(state.lastMoveColor),
      move: state.lastMoveText,
    });
  }

  return translateOnlineMoveLabel(state?.lastMove);
}

function translateOnlineStatus(state) {
  if (state?.statusCode === "WAITING_OPPONENT") {
    return t("status.waitingOpponent");
  }

  if (state?.statusCode === "CHECKMATE") {
    return t("status.checkmate", {
      winner: colorName(state.winnerColor),
    });
  }

  if (state?.statusCode === "DRAW") {
    return t("status.draw");
  }

  if (state?.statusCode === "CHECK") {
    return t("status.check", {
      color: colorName(state.checkedColor || state.turn),
    });
  }

  if (state?.statusCode === "IN_PROGRESS") {
    return t("status.onlineInProgress");
  }

  const statusText = state?.gameStatus || "";
  const status = statusText || "";
  const lowerStatus = status.toLowerCase();

  if (!status) {
    return t("status.onlineInProgress");
  }

  if (lowerStatus.includes("esperando rival") || lowerStatus.includes("waiting")) {
    return t("status.waitingOpponent");
  }

  if (lowerStatus.includes("jaque mate") || lowerStatus.includes("checkmate")) {
    const winner = lowerStatus.includes("black")
      ? colorName("b")
      : colorName("w");
    return t("status.checkmate", { winner });
  }

  if (lowerStatus.includes("tablas") || lowerStatus.includes("draw")) {
    return t("status.draw");
  }

  if (lowerStatus.includes("partida online en curso") || lowerStatus.includes("online game")) {
    return t("status.onlineInProgress");
  }

  return status
    .replaceAll("White", colorName("w"))
    .replaceAll("Black", colorName("b"));
}

function getOnlineResultFromState(state) {
  if (state?.statusCode === "CHECKMATE" && state.winnerColor) {
    return {
      detail: state.winnerColor === "w"
        ? t("result.whiteWins")
        : t("result.blackWins"),
      reason: t("result.checkmate"),
      type: "win",
      winnerColor: state.winnerColor,
    };
  }

  if (state?.statusCode === "DRAW") {
    return {
      detail: t("result.drawDetail"),
      reason: t("status.draw"),
      type: "draw",
      winnerColor: null,
    };
  }

  return null;
}

function translateSenderLabel(label, color) {
  if (color === "w" || color === "b") {
    return colorName(color);
  }

  return label || t("chat.rival");
}

function handleOnlineState(state, previousState = null) {
  return measure("online.state", () => {
    const session = onlineClient.getSession();
    const previousFen = previousState?.fen || null;
    lastMove = formatOnlineMove(state);

    if (state.fen) {
      const loaded = game.load(state.fen);

      if (!loaded) {
        console.warn("The backend sent an invalid FEN.", state.fen);
      }
    }

    if (board) {
      clearMoveHints();
      measure("board.position", () => board.position(game.fen(), false));
      measure("board.orientation", () =>
        board.orientation(session?.color === "b" ? "black" : "white"),
      );
    }

    turnElement.textContent = colorName(state.turn);
    lastMoveElement.textContent = lastMove;
    statusElement.textContent = translateOnlineStatus(state);
    onlineLabel.textContent = t("game.onlineRoomActive", {
      code: state.code,
      color: colorName(session?.color),
    });

    if (previousFen && state.fen && previousFen !== state.fen) {
      const soundKind = getMoveSoundKindFromState(state);

      if (soundKind) {
        playSound(soundKind);
      }
    }

    maybeShowOnlineResult(state);
  });
}

function formatChatTime(sentAt) {
  const date = new Date(sentAt);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function handleOnlineChat(chat) {
  if (!chatMessagesElement || !chat) {
    return;
  }

  const session = onlineClient.getSession();
  const isOwnMessage = chat.senderColor === session?.color;
  const messageElement = document.createElement("article");
  const metaElement = document.createElement("p");
  const textElement = document.createElement("p");
  const timeText = formatChatTime(chat.sentAt);

  messageElement.className = `chat-message ${isOwnMessage ? "chat-own" : "chat-rival"}`;
  metaElement.className = "chat-meta";
  textElement.className = "chat-text";
  metaElement.textContent = `${isOwnMessage ? t("chat.you") : translateSenderLabel(chat.senderLabel, chat.senderColor)}${
    timeText ? ` · ${timeText}` : ""
  }`;
  textElement.textContent = chat.message || "";

  messageElement.append(metaElement, textElement);
  chatEmptyElement?.classList.add("panel-hidden");
  chatMessagesElement.append(messageElement);
  chatMessagesElement.scrollTop = chatMessagesElement.scrollHeight;
  setChatStatus("", "idle");
}

function clearOnlineSession() {
  onlineClient.clearSession();
  onlineLabel.textContent = t("game.onlineRoom");
  clearChatMessages();
}

function startOnlineSession() {
  clearResultNotice();
  aiController.disable();
  currentMode = "online";

  setModeUi("online");
  startMenu.classList.remove("ai-focused");
  startMenu.classList.remove("online-focused");
  startMenu.classList.remove("style-focused");
  startMenu.classList.remove("language-focused");
  startDifficultyPanel.classList.add("panel-hidden");
  onlinePanel.classList.add("panel-hidden");
  stylePanel.classList.add("panel-hidden");
  languagePanel.classList.add("panel-hidden");
  startMenu.classList.add("screen-hidden");
  gameApp.classList.remove("screen-hidden");
  ensureBoard();

  window.setTimeout(() => {
    measure("board.resize", () => board.resize());
  }, 0);
}

async function createOnlineRoom() {
  return onlineClient.createRoom();
}

async function joinOnlineRoom() {
  const code = normalizeRoomCode(roomCodeInput.value);
  roomCodeInput.value = code;
  return onlineClient.joinRoom(code);
}

function sendOnlineMove({ from, to, promotion = "" }) {
  return onlineClient.sendMove({ from, to, promotion });
}

function sendOnlineChat() {
  if (!chatInput) {
    return;
  }

  const message = chatInput.value.trim();

  if (!message) {
    setChatStatus(t("chat.emptyError"), "error");
    chatInput.focus();
    return;
  }

  if (message.length > 200) {
    setChatStatus(t("chat.maxError"), "error");
    chatInput.focus();
    return;
  }

  if (onlineClient.sendChat(message)) {
    chatInput.value = "";
    setChatStatus("", "idle");
  } else {
    setChatStatus(t("chat.sendError"), "error");
  }
}

function handleOnlineDrop(source, target) {
  return measure("online.onDrop", () => {
    if (!onlineClient.canSendMove()) {
      return "snapback";
    }

    if (isPromotionMove(source, target)) {
      pendingPromotion = { from: source, to: target, online: true };
      updatePromotionImages(game.turn());
      openPromotionModal();
      return "snapback";
    }

    sendOnlineMove({ from: source, to: target });
    return "snapback";
  });
}

function handleEngineStatus({ state, message }) {
  aiController.handleEngineStatus({ state, message });
}

function canMovePiece(piece) {
  if (
    currentMode === "menu" ||
    pendingPromotion ||
    aiController.blocksInput() ||
    isGameOver()
  ) {
    return false;
  }

  const pieceColor = piece[0];

  if (currentMode === "online") {
    return onlineClient.canMovePiece(pieceColor);
  }

  if (aiController.isEnabled()) {
    return game.turn() === "w" && pieceColor === "w";
  }

  return pieceColor === game.turn();
}

function onDragStart(source, piece) {
  return measure("onDragStart", () => {
    const canMove = canMovePiece(piece);

    if (!canMove) {
      clearMoveHints();
      return false;
    }

    moveHints.startDrag();
    showMoveHints(source, piece);
    return true;
  });
}

function updatePromotionImages(turn) {
  return promotionUi.updateImages(turn);
}

function openPromotionModal() {
  return promotionUi.open();
}

function closePromotionModal() {
  return promotionUi.close();
}

function cancelPromotionSelection() {
  closePromotionModal();
  pendingPromotion = null;
  clearMoveHints();

  if (board) {
    measure("board.position", () => board.position(game.fen(), false));
  }
}

function scheduleEngineMove() {
  aiController.scheduleMove();
}

function onDrop(source, target) {
  return measure("onDrop", () => {
    moveHints.stopDrag();
    clearMoveHints();

    if (target === "offboard") {
      return "snapback";
    }

    if (currentMode === "online") {
      return handleOnlineDrop(source, target);
    }

    if (isPromotionMove(source, target)) {
      pendingPromotion = { from: source, to: target };
      updatePromotionImages(game.turn());
      openPromotionModal();
      return "snapback";
    }

    const move = measure("game.move", () =>
      game.move({
        from: source,
        to: target,
        promotion: "q",
      }),
    );

    if (!move) {
      playSound("invalid");
      return "snapback";
    }

    lastMove = `${colorName(move.color)}: ${move.san}`;
    playMoveSound(move);
    updateStatus();
    scheduleEngineMove();
    return undefined;
  });
}

function onSnapEnd() {
  return measure("onSnapEnd", () => {
    moveHints.stopDrag();
    clearMoveHints();
    measure("board.position", () => board.position(game.fen()));
  });
}

function ensureBoard() {
  if (board) {
    bindBoardHintEvents();
    window.setTimeout(() => {
      measure("board.resize", () => board.resize());
    }, 0);
    return;
  }

  const config = {
    draggable: true,
    position: "start",
    pieceTheme: `${basePieceUrl}{piece}.png`,
    onDragStart,
    onDrop,
    onSnapEnd,
  };

  board = measure("board.init", () => ChessboardLibrary("board", config));
  bindBoardHintEvents();
}

function resetGame() {
  return measure("resetGame", () => {
    if (currentMode === "online") {
      setEngineStatus(t("engine.resetOnlineUnavailable"), "error");
      return;
    }

    clearResultNotice();
    game.reset();
    lastMove = t("move.none");

    if (board) {
      clearMoveHints();
      measure("board.position", () => board.position(game.fen(), false));
    }

    closePromotionModal();
    pendingPromotion = null;
    updateStatus();
    aiController.resetForNewGame();
  });
}

function showDifficultySelection() {
  setDifficultyOptionsAvailability();
  startMenu.classList.add("ai-focused");
  startMenu.classList.remove("online-focused");
  startMenu.classList.remove("style-focused");
  startMenu.classList.remove("language-focused");
  stylePanel.classList.add("panel-hidden");
  languagePanel.classList.add("panel-hidden");
  onlinePanel.classList.add("panel-hidden");
  startDifficultyPanel.classList.remove("panel-hidden");
  setSelectedDifficulty(aiDifficultySelect.value);

  const firstAvailableCard = Array.from(difficultyCards).find(
    (card) => !card.disabled,
  );

  (firstAvailableCard || aiMenuCloseButton).focus();
}

function showOnlinePanel() {
  startMenu.classList.remove("ai-focused");
  startMenu.classList.remove("style-focused");
  startMenu.classList.remove("language-focused");
  startMenu.classList.add("online-focused");
  startDifficultyPanel.classList.add("panel-hidden");
  stylePanel.classList.add("panel-hidden");
  languagePanel.classList.add("panel-hidden");
  onlinePanel.classList.remove("panel-hidden");
  onlineChoiceActions.classList.remove("panel-hidden");
  onlineJoinForm.classList.add("panel-hidden");
  roomCodeInput.value = "";
  setOnlineMenuStatus(
    t("online.menuStatus"),
    "loading",
  );
  createRoomButton.focus();
}

function closeOnlineMenu() {
  startMenu.classList.remove("online-focused");
  startMenu.classList.remove("language-focused");
  onlinePanel.classList.add("panel-hidden");
  onlineChoiceActions.classList.remove("panel-hidden");
  onlineJoinForm.classList.add("panel-hidden");
  roomCodeInput.value = "";
  setOnlineMenuStatus(
    t("online.menuStatus"),
    "loading",
  );
  startOnlineButton.focus();
}

function showStylePanel() {
  startMenu.classList.remove("ai-focused");
  startMenu.classList.remove("online-focused");
  startMenu.classList.remove("language-focused");
  startMenu.classList.add("style-focused");
  startDifficultyPanel.classList.add("panel-hidden");
  onlinePanel.classList.add("panel-hidden");
  languagePanel.classList.add("panel-hidden");
  stylePanel.classList.remove("panel-hidden");
  themeUi.syncCards(document.body.dataset.theme || DEFAULT_THEME);

  const selectedCard = Array.from(styleCards).find((card) =>
    card.classList.contains("style-card-selected"),
  );

  (selectedCard || styleMenuCloseButton).focus();
}

function closeStyleMenu() {
  startMenu.classList.remove("style-focused");
  stylePanel.classList.add("panel-hidden");
  styleMenuButton.focus();
}

function syncLanguageCards(language = I18n?.getLanguage()) {
  languageCards.forEach((card) => {
    const isSelected = card.dataset.languageChoice === language;

    card.classList.toggle("language-card-selected", isSelected);
    card.setAttribute("aria-pressed", String(isSelected));
  });
}

function refreshTranslatedUi() {
  I18n?.applyToDocument();
  syncLanguageCards();
  setSelectedDifficulty(selectedDifficulty);
  setModeUi(currentMode === "menu" ? "local" : currentMode);

  if (lastMove === "None") {
    lastMove = t("move.none");
  }

  updateStatus();

  if (currentMode === "online" && onlineClient.getState()) {
    handleOnlineState(onlineClient.getState(), onlineClient.getState());
  }
}

function showLanguagePanel() {
  startMenu.classList.remove("ai-focused");
  startMenu.classList.remove("online-focused");
  startMenu.classList.remove("style-focused");
  startMenu.classList.add("language-focused");
  startDifficultyPanel.classList.add("panel-hidden");
  onlinePanel.classList.add("panel-hidden");
  stylePanel.classList.add("panel-hidden");
  languagePanel.classList.remove("panel-hidden");
  syncLanguageCards();

  const selectedCard = Array.from(languageCards).find((card) =>
    card.classList.contains("language-card-selected"),
  );

  (selectedCard || languageMenuCloseButton).focus();
}

function closeLanguageMenu() {
  startMenu.classList.remove("language-focused");
  languagePanel.classList.add("panel-hidden");
  languageMenuButton.focus();
}

function closeAiMenu() {
  startMenu.classList.remove("ai-focused");
  startMenu.classList.remove("language-focused");
  startDifficultyPanel.classList.add("panel-hidden");
  syncDifficultyCardsAvailability();
  startAiButton.focus();
}

function showOnlineJoinForm() {
  onlineChoiceActions.classList.add("panel-hidden");
  onlineJoinForm.classList.remove("panel-hidden");
  setOnlineMenuStatus(t("online.enterCode"), "loading");
  roomCodeInput.focus();
}

function startGame(mode) {
  if (mode === "ai" && aiDifficultySelect.selectedOptions[0]?.disabled) {
    return;
  }

  clearResultNotice();
  clearOnlineSession();
  currentMode = mode;
  aiController.setEnabled(mode === "ai");
  setModeUi(mode);
  startMenu.classList.remove("ai-focused");
  startMenu.classList.remove("online-focused");
  startMenu.classList.remove("style-focused");
  startMenu.classList.remove("language-focused");
  startDifficultyPanel.classList.add("panel-hidden");
  onlinePanel.classList.add("panel-hidden");
  stylePanel.classList.add("panel-hidden");
  languagePanel.classList.add("panel-hidden");
  startMenu.classList.add("screen-hidden");
  gameApp.classList.remove("screen-hidden");
  ensureBoard();
  measure("board.orientation", () => board.orientation("white"));
  resetGame();

  window.setTimeout(() => {
    measure("board.resize", () => board.resize());
  }, 0);
}

function returnToMenu() {
  clearResultNotice();
  aiController.disable();
  currentMode = "menu";
  clearOnlineSession();

  aiController.stopEngine();

  closePromotionModal();
  pendingPromotion = null;
  clearMoveHints();
  startMenu.classList.remove("ai-focused");
  startMenu.classList.remove("online-focused");
  startMenu.classList.remove("style-focused");
  startMenu.classList.remove("language-focused");
  startDifficultyPanel.classList.add("panel-hidden");
  onlinePanel.classList.add("panel-hidden");
  stylePanel.classList.add("panel-hidden");
  languagePanel.classList.add("panel-hidden");
  game.reset();
  lastMove = t("move.none");

  if (board) {
    measure("board.orientation", () => board.orientation("white"));
    measure("board.position", () => board.position(game.fen(), false));
  }

  updateStatus();
  gameApp.classList.add("screen-hidden");
  startMenu.classList.remove("screen-hidden");
}

function setProfilerVisible(isVisible) {
  if (!profilerPanel || !profilerToggleButton) {
    return;
  }

  profilerPanel.classList.toggle("profiler-hidden", !isVisible);
  profilerToggleButton.setAttribute("aria-expanded", String(isVisible));
  profilerToggleButton.textContent = isVisible
    ? t("profiler.hide")
    : t("profiler.show");
}

startLocalButton.addEventListener("click", () => startGame("local"));
startAiButton.addEventListener("click", showDifficultySelection);
startOnlineButton.addEventListener("click", showOnlinePanel);
styleMenuButton.addEventListener("click", showStylePanel);
languageMenuButton.addEventListener("click", showLanguagePanel);
startAiConfirmButton.addEventListener("click", () => {
  setSelectedDifficulty(aiDifficultySelect.value);
  startGame("ai");
});
styleCards.forEach((card) => {
  card.addEventListener("click", () => {
    applyTheme(card.dataset.themeChoice);
  });
});
languageCards.forEach((card) => {
  card.addEventListener("click", () => {
    I18n?.setLanguage(card.dataset.languageChoice);
    refreshTranslatedUi();
  });
});
difficultyCards.forEach((card) => {
  card.addEventListener("click", () => {
    if (card.disabled) {
      return;
    }

    setSelectedDifficulty(card.dataset.difficulty);
    startGame("ai");
  });
});
createRoomButton.addEventListener("click", createOnlineRoom);
showJoinRoomButton.addEventListener("click", showOnlineJoinForm);
joinRoomButton.addEventListener("click", joinOnlineRoom);
onlineBackButton.addEventListener("click", showOnlinePanel);
onlineMenuCloseButton.addEventListener("click", closeOnlineMenu);
styleMenuCloseButton.addEventListener("click", closeStyleMenu);
languageMenuCloseButton.addEventListener("click", closeLanguageMenu);
aiMenuCloseButton.addEventListener("click", closeAiMenu);
resetButton.addEventListener("click", resetGame);
changeModeButton.addEventListener("click", returnToMenu);
if (resultPrimaryButton) {
  resultPrimaryButton.addEventListener("click", resetGame);
}
if (resultMenuButton) {
  resultMenuButton.addEventListener("click", returnToMenu);
}
if (promotionCloseButton) {
  promotionCloseButton.addEventListener("click", cancelPromotionSelection);
}
if (profilerToggleButton && profilerPanel) {
  profilerToggleButton.addEventListener("click", () => {
    setProfilerVisible(profilerPanel.classList.contains("profiler-hidden"));
  });
}

aiDifficultySelect.addEventListener("change", () => {
  setSelectedDifficulty(aiDifficultySelect.value);
});

roomCodeInput.addEventListener("input", () => {
  roomCodeInput.value = normalizeRoomCode(roomCodeInput.value);
});

roomCodeInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    joinOnlineRoom();
  }
});

if (chatForm) {
  chatForm.addEventListener("submit", (event) => {
    event.preventDefault();
    sendOnlineChat();
  });
}

let resizeTimeout;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    measure("resize.debounced", () => {
      if (board && currentMode !== "menu") {
        measure("board.resize", () => board.resize());
      }
    });
  }, 100);
});

promotionButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    measure("promotion.select", () => {
      if (!pendingPromotion) {
        return;
      }

      const promotionPiece = btn.getAttribute("data-piece");

      if (pendingPromotion.online) {
        sendOnlineMove({
          from: pendingPromotion.from,
          to: pendingPromotion.to,
          promotion: promotionPiece,
        });
        closePromotionModal();
        pendingPromotion = null;
        return;
      }

      const move = measure("game.move", () =>
        game.move({
          from: pendingPromotion.from,
          to: pendingPromotion.to,
          promotion: promotionPiece,
        }),
      );

      if (move) {
        lastMove = `${colorName(move.color)}: ${move.san}`;
        measure("board.position", () => board.position(game.fen()));
        playMoveSound(move);
        updateStatus();
        scheduleEngineMove();
      }

      closePromotionModal();
      pendingPromotion = null;
      clearMoveHints();
    });
  });
});

promotionModal.addEventListener("click", (event) => {
  measure("promotion.cancel", () => {
    if (event.target === promotionModal) {
      cancelPromotionSelection();
    }
  });
});

if (engine) {
  engine.onStatus(handleEngineStatus);
  engine.init().catch((error) => {
    console.warn("Could not start Stockfish.", error);
  });
} else {
  aiController.markEngineUnavailable();
}

I18n?.setLanguage(I18n.getLanguage(), { persist: false });
syncLanguageCards();
setProfilerVisible(false);
applyTheme(readSavedTheme(), { persist: false });
setModeUi("local");
setDifficultyOptionsAvailability();
updateStatus();
