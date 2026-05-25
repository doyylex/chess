(function () {
  const STORAGE_KEY = "chessLanguage";
  const DEFAULT_LANGUAGE = "en";
  const SUPPORTED_LANGUAGES = new Set(["en", "es"]);

  const dictionaries = {
    en: {
      "app.title": "Local Chess",
      "app.name": "Chess",
      "start.aria": "Start menu",
      "start.kicker": "Chess club",
      "start.lede": "Choose how to play: a local game, an adjustable AI opponent, or an online room by code.",
      "mode.local.title": "Play local",
      "mode.local.description": "Two players in this browser",
      "mode.ai.title": "Play vs AI",
      "mode.ai.description": "Choose a difficulty before starting",
      "mode.online.title": "Play online",
      "mode.online.description": "Create a room or join with a code",
      "style.button": "Styles",
      "language.button": "Language",

      "styles.aria": "Visual style selection",
      "styles.kicker": "Styles",
      "styles.title": "Choose the atmosphere",
      "styles.description": "Change the complete look of the board, menus, and modals.",
      "styles.close": "Close styles menu",
      "styles.grid": "Visual styles",
      "styles.principal.title": "Principal",
      "styles.principal.description": "Dark club, deep greens, and soft gold",
      "styles.neon.title": "Modern neon",
      "styles.neon.description": "Futuristic contrast with cyan, magenta, and lime",
      "styles.tournament.title": "Tournament",
      "styles.tournament.description": "Competitive green, beige, and soft red alerts",
      "styles.wood.title": "Wood",
      "styles.wood.description": "Classic board, honey, walnut, and dark leather",

      "language.aria": "Language selection",
      "language.kicker": "Language",
      "language.title": "Choose your language",
      "language.description": "The interface will update immediately and remember your choice.",
      "language.close": "Close language menu",
      "language.grid": "Languages",
      "language.en.title": "English",
      "language.en.description": "Default interface language",
      "language.es.title": "Español",
      "language.es.description": "Full interface in Spanish",

      "ai.aria": "Difficulty selection",
      "ai.kicker": "Vs AI",
      "ai.title": "Choose your opponent",
      "ai.description": "Select a difficulty to start as White.",
      "ai.close": "Close AI menu",
      "ai.grid": "Difficulties",
      "ai.compatLabel": "Difficulty",
      "ai.start": "Start vs AI",
      "difficulty.easy.label": "Easy",
      "difficulty.easy.description": "Simple AI, makes mistakes and plays with lots of randomness",
      "difficulty.normal.label": "Normal",
      "difficulty.normal.description": "Simple AI, more organized but still beatable",
      "difficulty.hard.label": "Hard",
      "difficulty.hard.description": "Stockfish with controlled strength",
      "difficulty.expert.label": "Expert",
      "difficulty.expert.description": "Strong Stockfish, for suffering elegantly",

      "online.aria": "Online room",
      "online.kicker": "Online",
      "online.title": "Create or join a room",
      "online.description": "Set up a private game by code, no login required.",
      "online.close": "Close online menu",
      "online.create.title": "Create room",
      "online.create.description": "Generate a code to share",
      "online.join.title": "Join room",
      "online.join.description": "Enter with someone else's code",
      "online.roomCode": "Room code",
      "online.joinButton": "Join",
      "online.back": "Back",
      "online.menuStatus": "Choose whether to create a room or join with a code.",
      "online.enterCode": "Enter the 6-character code.",

      "game.boardAria": "Chessboard",
      "game.statusAria": "Game status",
      "game.localEyebrow": "Local game",
      "game.aiEyebrow": "Game vs AI",
      "game.onlineEyebrow": "Online game",
      "game.mode.local": "Mode: Local",
      "game.mode.ai": "Mode: Vs AI",
      "game.mode.online": "Mode: Online",
      "game.difficulty": "Difficulty: {difficulty}",
      "game.onlineRoom": "Online room: -",
      "game.onlineRoomActive": "Room: {code} | You play {color}",
      "game.turn": "Turn",
      "game.lastMove": "Last move",
      "game.status": "Status",
      "game.connectionAria": "Connection status",
      "game.reset": "Restart",
      "game.changeMode": "Change mode",

      "chat.aria": "Online chat",
      "chat.title": "Chat",
      "chat.live": "Live",
      "chat.empty": "No messages yet.",
      "chat.placeholder": "Message...",
      "chat.inputAria": "Chat message",
      "chat.send": "Send",
      "chat.you": "You",
      "chat.rival": "Opponent",
      "chat.emptyError": "Write a message before sending.",
      "chat.maxError": "Maximum 200 characters.",
      "chat.sendError": "The message could not be sent.",

      "promotion.comment": "Pawn promotion modal",
      "promotion.close": "Close promotion",
      "promotion.kicker": "Promotion",
      "promotion.title": "Choose a piece",
      "promotion.description": "Your pawn reached the end of the board. Select what it becomes.",
      "piece.queen": "Queen",
      "piece.rook": "Rook",
      "piece.bishop": "Bishop",
      "piece.knight": "Knight",

      "result.kicker": "Result",
      "result.youWon": "YOU WON",
      "result.youLost": "YOU LOST",
      "result.draw": "DRAW",
      "result.finished": "GAME OVER",
      "result.checkmate": "Checkmate.",
      "result.whiteWins": "White wins.",
      "result.blackWins": "Black wins.",
      "result.drawDetail": "The game ended in a draw.",
      "result.finishedDetail": "The game ended.",
      "result.changeMode": "Change mode",
      "result.backToMenu": "Back to main menu",

      "color.w": "White",
      "color.b": "Black",
      "color.white": "White",
      "color.black": "Black",
      "move.none": "None",
      "move.label": "{color}: {move}",

      "status.inProgress": "Game in progress.",
      "status.onlineInProgress": "Online game in progress.",
      "status.check": "{color} is in check.",
      "status.checkmate": "Checkmate. {winner} wins.",
      "status.draw": "Draw.",
      "status.stalemate": "Draw by stalemate.",
      "status.threefold": "Draw by threefold repetition.",
      "status.insufficientMaterial": "Draw by insufficient material.",
      "status.finished": "Game over.",
      "status.waitingOpponent": "Waiting for opponent.",
      "status.onlineDraw": "The online game ended in a draw.",
      "status.onlineFinished": "The online game ended.",

      "engine.simpleReady": "Simple AI ready",
      "engine.stockfishReady": "Stockfish ready",
      "engine.stockfishUnavailable": "Stockfish unavailable",
      "engine.stockfishUnavailableLow": "Stockfish unavailable; Easy/Normal available",
      "engine.simpleUnavailable": "Simple AI unavailable",
      "engine.thinking": "Thinking...",
      "engine.invalidMove": "Invalid AI move",
      "engine.error": "Engine error",
      "engine.loading": "Loading Stockfish...",
      "engine.configuring": "Configuring difficulty...",
      "engine.noOnlineRoom": "No online room",
      "engine.waitingOpponent": "Waiting for opponent...",
      "engine.gameFinished": "Game finished",
      "engine.opponentDisconnected": "Opponent disconnected",
      "engine.yourTurn": "Your turn",
      "engine.opponentTurn": "Opponent's turn",
      "engine.invalidOnlineMessage": "Invalid online message",
      "engine.onlineError": "Online error",
      "engine.connectingRoom": "Connecting room...",
      "engine.connectionError": "Online connection error",
      "engine.connectionClosed": "Online connection closed",
      "engine.roomNotConnected": "The room is not connected",
      "engine.sendingMove": "Sending move...",
      "engine.emptyChat": "The message is empty",
      "engine.chatTooLong": "The message cannot exceed 200 characters",
      "engine.resetOnlineUnavailable": "Online restart is not available yet",

      "online.creatingRoom": "Creating room...",
      "online.roomCreated": "Room {code} created.",
      "online.backendUnavailable": "Could not connect to the backend. Start Spring Boot on port 8080.",
      "online.codeLength": "Enter a 6-character code.",
      "online.joiningRoom": "Joining room...",
      "online.joinedRoom": "You joined {code}.",
      "online.joinError": "Could not join the room.",
      "online.actionError": "The action could not be completed.",
      "online.roomFull": "The room is already full.",
      "online.notStarted": "The game has not started yet.",
      "online.notYourTurn": "It is not your turn.",
      "online.illegalMove": "Illegal move.",
      "online.invalidMove": "Invalid move.",
      "online.roomNotFound": "Room not found.",
      "online.unauthorizedPlayer": "Unauthorized player.",
      "online.unsupportedMessage": "Unsupported message.",
      "online.invalidConnection": "Invalid connection.",
      "online.invalidRoomCode": "Invalid room code.",

      "errors.chessJs": "chess.js could not be loaded.",
      "errors.chessboardJs": "chessboard.js could not be loaded.",
      "profiler.show": "Profiler",
      "profiler.hide": "Hide profiler",
      "profiler.empty": "No measurements yet",
      "profiler.measurements": "{count} measurements",
    },
    es: {
      "app.title": "Ajedrez local",
      "app.name": "Ajedrez",
      "start.aria": "Menú inicial",
      "start.kicker": "Club de ajedrez",
      "start.lede": "Elige cómo jugar: una partida local, contra una IA ajustable o una sala online por código.",
      "mode.local.title": "Jugar local",
      "mode.local.description": "Dos jugadores en este navegador",
      "mode.ai.title": "Jugar vs IA",
      "mode.ai.description": "Elige dificultad antes de empezar",
      "mode.online.title": "Jugar online",
      "mode.online.description": "Crea una sala o entra con código",
      "style.button": "Estilos",
      "language.button": "Idioma",

      "styles.aria": "Selección de estilo visual",
      "styles.kicker": "Estilos",
      "styles.title": "Elige la atmósfera",
      "styles.description": "Cambia el aspecto completo del tablero, menús y modales.",
      "styles.close": "Cerrar menú de estilos",
      "styles.grid": "Estilos visuales",
      "styles.principal.title": "Principal",
      "styles.principal.description": "Club oscuro, verdes profundos y dorado suave",
      "styles.neon.title": "Neón moderno",
      "styles.neon.description": "Contraste futurista con cian, magenta y lima",
      "styles.tournament.title": "Torneo",
      "styles.tournament.description": "Verde competitivo, beige y alertas rojas suaves",
      "styles.wood.title": "Madera",
      "styles.wood.description": "Tablero clásico, miel, nogal y cuero oscuro",

      "language.aria": "Selección de idioma",
      "language.kicker": "Idioma",
      "language.title": "Elige tu idioma",
      "language.description": "La interfaz se actualizará al instante y recordará tu elección.",
      "language.close": "Cerrar menú de idioma",
      "language.grid": "Idiomas",
      "language.en.title": "English",
      "language.en.description": "Idioma predeterminado de la interfaz",
      "language.es.title": "Español",
      "language.es.description": "Interfaz completa en español",

      "ai.aria": "Selección de dificultad",
      "ai.kicker": "Vs IA",
      "ai.title": "Elige tu rival",
      "ai.description": "Selecciona una dificultad para empezar con blancas.",
      "ai.close": "Cerrar menú de IA",
      "ai.grid": "Dificultades",
      "ai.compatLabel": "Dificultad",
      "ai.start": "Empezar vs IA",
      "difficulty.easy.label": "Fácil",
      "difficulty.easy.description": "IA simple, juega con errores y mucho azar",
      "difficulty.normal.label": "Normal",
      "difficulty.normal.description": "IA simple, más ordenada pero vencible",
      "difficulty.hard.label": "Difícil",
      "difficulty.hard.description": "Stockfish con fuerza controlada",
      "difficulty.expert.label": "Experto",
      "difficulty.expert.description": "Stockfish fuerte, para sufrir con elegancia",

      "online.aria": "Sala online",
      "online.kicker": "Online",
      "online.title": "Crear o unirse a una sala",
      "online.description": "Arma una partida privada por código, sin iniciar sesión.",
      "online.close": "Cerrar menú online",
      "online.create.title": "Crear sala",
      "online.create.description": "Genera un código para compartir",
      "online.join.title": "Unirse a sala",
      "online.join.description": "Entra con el código de otra persona",
      "online.roomCode": "Código de sala",
      "online.joinButton": "Unirse",
      "online.back": "Volver",
      "online.menuStatus": "Elige si quieres crear una sala o entrar con un código.",
      "online.enterCode": "Ingresa el código de 6 caracteres.",

      "game.boardAria": "Tablero de ajedrez",
      "game.statusAria": "Estado de la partida",
      "game.localEyebrow": "Partida local",
      "game.aiEyebrow": "Partida vs IA",
      "game.onlineEyebrow": "Partida online",
      "game.mode.local": "Modo: Local",
      "game.mode.ai": "Modo: Vs IA",
      "game.mode.online": "Modo: Online",
      "game.difficulty": "Dificultad: {difficulty}",
      "game.onlineRoom": "Sala online: -",
      "game.onlineRoomActive": "Sala: {code} | Juegas {color}",
      "game.turn": "Turno",
      "game.lastMove": "Última jugada",
      "game.status": "Estado",
      "game.connectionAria": "Estado de conexión",
      "game.reset": "Reiniciar",
      "game.changeMode": "Cambiar modo",

      "chat.aria": "Chat online",
      "chat.title": "Chat",
      "chat.live": "En vivo",
      "chat.empty": "Todavía no hay mensajes.",
      "chat.placeholder": "Mensaje...",
      "chat.inputAria": "Mensaje de chat",
      "chat.send": "Enviar",
      "chat.you": "Tú",
      "chat.rival": "Rival",
      "chat.emptyError": "Escribe un mensaje antes de enviar.",
      "chat.maxError": "Máximo 200 caracteres.",
      "chat.sendError": "No se pudo enviar el mensaje.",

      "promotion.comment": "Modal de promoción de peón",
      "promotion.close": "Cerrar promoción",
      "promotion.kicker": "Promoción",
      "promotion.title": "Elige una pieza",
      "promotion.description": "Tu peón llegó al final del tablero. Selecciona en qué se convierte.",
      "piece.queen": "Dama",
      "piece.rook": "Torre",
      "piece.bishop": "Alfil",
      "piece.knight": "Caballo",

      "result.kicker": "Resultado",
      "result.youWon": "GANASTE",
      "result.youLost": "PERDISTE",
      "result.draw": "TABLAS",
      "result.finished": "PARTIDA TERMINADA",
      "result.checkmate": "Jaque mate.",
      "result.whiteWins": "Ganan las blancas.",
      "result.blackWins": "Ganan las negras.",
      "result.drawDetail": "La partida terminó en tablas.",
      "result.finishedDetail": "La partida terminó.",
      "result.changeMode": "Cambiar modo",
      "result.backToMenu": "Volver al menú principal",

      "color.w": "Blancas",
      "color.b": "Negras",
      "color.white": "Blancas",
      "color.black": "Negras",
      "move.none": "Ninguna",
      "move.label": "{color}: {move}",

      "status.inProgress": "Partida en curso.",
      "status.onlineInProgress": "Partida online en curso.",
      "status.check": "{color} está en jaque.",
      "status.checkmate": "Jaque mate. Ganan {winner}.",
      "status.draw": "Tablas.",
      "status.stalemate": "Tablas por ahogado.",
      "status.threefold": "Tablas por triple repetición.",
      "status.insufficientMaterial": "Tablas por material insuficiente.",
      "status.finished": "Partida terminada.",
      "status.waitingOpponent": "Esperando rival.",
      "status.onlineDraw": "La partida online terminó en tablas.",
      "status.onlineFinished": "La partida online terminó.",

      "engine.simpleReady": "IA simple lista",
      "engine.stockfishReady": "Stockfish listo",
      "engine.stockfishUnavailable": "Stockfish no disponible",
      "engine.stockfishUnavailableLow": "Stockfish no disponible; Fácil/Normal disponibles",
      "engine.simpleUnavailable": "IA simple no disponible",
      "engine.thinking": "Pensando...",
      "engine.invalidMove": "Jugada de IA inválida",
      "engine.error": "Error de motor",
      "engine.loading": "Cargando Stockfish...",
      "engine.configuring": "Configurando dificultad...",
      "engine.noOnlineRoom": "Sin sala online",
      "engine.waitingOpponent": "Esperando rival...",
      "engine.gameFinished": "Partida finalizada",
      "engine.opponentDisconnected": "Rival desconectado",
      "engine.yourTurn": "Tu turno",
      "engine.opponentTurn": "Turno del rival",
      "engine.invalidOnlineMessage": "Mensaje online inválido",
      "engine.onlineError": "Error online",
      "engine.connectingRoom": "Conectando sala...",
      "engine.connectionError": "Error de conexión online",
      "engine.connectionClosed": "Conexión online cerrada",
      "engine.roomNotConnected": "La sala no está conectada",
      "engine.sendingMove": "Enviando jugada...",
      "engine.emptyChat": "El mensaje está vacío",
      "engine.chatTooLong": "El mensaje no puede superar 200 caracteres",
      "engine.resetOnlineUnavailable": "Reiniciar online todavía no está disponible",

      "online.creatingRoom": "Creando sala...",
      "online.roomCreated": "Sala {code} creada.",
      "online.backendUnavailable": "No se pudo conectar al backend. Inicia Spring Boot en el puerto 8080.",
      "online.codeLength": "Ingresa un código de 6 caracteres.",
      "online.joiningRoom": "Uniéndose a la sala...",
      "online.joinedRoom": "Te uniste a {code}.",
      "online.joinError": "No se pudo unir a la sala.",
      "online.actionError": "No se pudo completar la acción.",
      "online.roomFull": "La sala ya está llena.",
      "online.notStarted": "La partida aún no empezó.",
      "online.notYourTurn": "No es tu turno.",
      "online.illegalMove": "Movimiento ilegal.",
      "online.invalidMove": "Movimiento inválido.",
      "online.roomNotFound": "Sala no encontrada.",
      "online.unauthorizedPlayer": "Jugador no autorizado.",
      "online.unsupportedMessage": "Mensaje no soportado.",
      "online.invalidConnection": "Conexión inválida.",
      "online.invalidRoomCode": "Código de sala inválido.",

      "errors.chessJs": "No se pudo cargar chess.js.",
      "errors.chessboardJs": "No se pudo cargar chessboard.js.",
      "profiler.show": "Profiler",
      "profiler.hide": "Ocultar profiler",
      "profiler.empty": "Sin mediciones todavía",
      "profiler.measurements": "{count} mediciones",
    },
  };

  const listeners = new Set();
  let currentLanguage = readSavedLanguage();

  function normalizeLanguage(language) {
    return SUPPORTED_LANGUAGES.has(language) ? language : DEFAULT_LANGUAGE;
  }

  function readSavedLanguage() {
    try {
      return normalizeLanguage(window.localStorage.getItem(STORAGE_KEY));
    } catch (error) {
      return DEFAULT_LANGUAGE;
    }
  }

  function saveLanguage(language) {
    try {
      window.localStorage.setItem(STORAGE_KEY, language);
    } catch (error) {
      console.warn("Could not save language preference.", error);
    }
  }

  function interpolate(text, params = {}) {
    return Object.entries(params).reduce(
      (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
      text,
    );
  }

  function t(key, params = {}) {
    const dictionary = dictionaries[currentLanguage] || dictionaries[DEFAULT_LANGUAGE];
    const fallback = dictionaries[DEFAULT_LANGUAGE][key] || key;
    return interpolate(dictionary[key] || fallback, params);
  }

  function applyToDocument(root = document) {
    root.querySelectorAll("[data-i18n]").forEach((element) => {
      element.textContent = t(element.dataset.i18n);
    });

    root.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
      element.setAttribute("placeholder", t(element.dataset.i18nPlaceholder));
    });

    root.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
      element.setAttribute("aria-label", t(element.dataset.i18nAriaLabel));
    });

    root.querySelectorAll("[data-i18n-alt]").forEach((element) => {
      element.setAttribute("alt", t(element.dataset.i18nAlt));
    });

    document.documentElement.lang = currentLanguage;
    document.title = t("app.title");
  }

  function setLanguage(language, { persist = true } = {}) {
    const normalizedLanguage = normalizeLanguage(language);

    currentLanguage = normalizedLanguage;
    document.body.dataset.language = normalizedLanguage;

    if (persist) {
      saveLanguage(normalizedLanguage);
    }

    applyToDocument();
    listeners.forEach((listener) => listener(normalizedLanguage));
  }

  function onChange(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function getLanguage() {
    return currentLanguage;
  }

  window.ChessI18n = {
    applyToDocument,
    getLanguage,
    onChange,
    setLanguage,
    t,
  };
})();
