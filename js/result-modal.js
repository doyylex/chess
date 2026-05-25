(function () {
  function t(key, params = {}) {
    return window.ChessI18n?.t(key, params) || key;
  }

  function createResultModal({
    actions,
    card,
    detailElement,
    menuButton,
    modal,
    playResultSound,
    primaryButton,
    reasonElement,
    titleElement,
  }) {
    function close() {
      modal?.classList.add("hidden");
    }

    function show(result, presentation, mode) {
      if (
        !modal ||
        !card ||
        !titleElement ||
        !reasonElement ||
        !detailElement ||
        !primaryButton ||
        !menuButton ||
        !actions
      ) {
        return;
      }

      const isOnlineMode = mode === "online";

      card.classList.remove("result-win", "result-loss", "result-draw");
      card.classList.add(`result-${presentation.variant}`);
      titleElement.textContent = presentation.title;
      reasonElement.textContent = presentation.reason;
      detailElement.textContent = presentation.detail;
      actions.classList.toggle("result-online", isOnlineMode);
      primaryButton.classList.toggle("panel-hidden", isOnlineMode);
      menuButton.textContent = isOnlineMode
        ? t("result.backToMenu")
        : t("result.changeMode");

      playResultSound(presentation.variant);
      modal.classList.remove("hidden");

      if (isOnlineMode) {
        menuButton.focus();
        return;
      }

      primaryButton.focus();
    }

    return {
      close,
      show,
    };
  }

  window.ChessResultModal = {
    create: createResultModal,
  };
})();
