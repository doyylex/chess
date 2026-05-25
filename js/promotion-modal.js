(function () {
  function createPromotionModal({
    basePieceUrl,
    measure,
    modal,
  }) {
    function updateImages(turn) {
      return measure("promotionModal.updateImages", () => {
        document.querySelector("#promo-img-q").src = `${basePieceUrl}${turn}Q.png`;
        document.querySelector("#promo-img-r").src = `${basePieceUrl}${turn}R.png`;
        document.querySelector("#promo-img-b").src = `${basePieceUrl}${turn}B.png`;
        document.querySelector("#promo-img-n").src = `${basePieceUrl}${turn}N.png`;
      });
    }

    function open() {
      return measure("promotionModal.open", () => {
        modal?.classList.remove("hidden");
      });
    }

    function close() {
      return measure("promotionModal.close", () => {
        modal?.classList.add("hidden");
      });
    }

    return {
      close,
      open,
      updateImages,
    };
  }

  window.ChessPromotionModal = {
    create: createPromotionModal,
  };
})();
