(function () {
  function createThemeUi({
    cards,
    defaultTheme,
    storageKey,
    themes,
  }) {
    function normalize(theme) {
      return themes.has(theme) ? theme : defaultTheme;
    }

    function readSaved() {
      try {
        return normalize(window.localStorage.getItem(storageKey));
      } catch (error) {
        return defaultTheme;
      }
    }

    function save(theme) {
      try {
        window.localStorage.setItem(storageKey, theme);
      } catch (error) {
        console.warn("Could not save the visual style.", error);
      }
    }

    function syncCards(theme) {
      cards.forEach((card) => {
        const isSelected = card.dataset.themeChoice === theme;

        card.classList.toggle("style-card-selected", isSelected);
        card.setAttribute("aria-pressed", String(isSelected));
      });
    }

    function apply(theme, { persist = true } = {}) {
      const normalizedTheme = normalize(theme);

      document.body.dataset.theme = normalizedTheme;
      syncCards(normalizedTheme);

      if (persist) {
        save(normalizedTheme);
      }
    }

    return {
      apply,
      readSaved,
      syncCards,
    };
  }

  window.ChessThemeUi = {
    create: createThemeUi,
  };
})();
