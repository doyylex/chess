(function () {
  function createMoveHints({
    boardSelector = "#board",
    canMovePiece,
    getLegalMoves,
    measure,
  }) {
    let eventsBound = false;
    let isDraggingPiece = false;

    function squareElement(square) {
      return document.querySelector(`${boardSelector} .square-${square}`);
    }

    function clear() {
      return measure("moveHints.clear", () => {
        document
          .querySelectorAll(
            `${boardSelector} .move-source, ${boardSelector} .move-destination, ${boardSelector} .move-capture, ${boardSelector} .move-promotion`,
          )
          .forEach((element) => {
            element.classList.remove(
              "move-source",
              "move-destination",
              "move-capture",
              "move-promotion",
            );
          });
      });
    }

    function bindEvents() {
      const boardElement = document.querySelector(boardSelector);

      if (!boardElement || eventsBound) {
        return;
      }

      eventsBound = true;

      boardElement.addEventListener("mouseup", () => {
        isDraggingPiece = false;
        clear();
      }, true);

      boardElement.addEventListener("mouseleave", () => {
        if (!isDraggingPiece) {
          clear();
        }
      });

      document.addEventListener("mouseup", () => {
        if (isDraggingPiece) {
          isDraggingPiece = false;
          clear();
        }
      });
    }

    function startDrag() {
      isDraggingPiece = true;
    }

    function stopDrag() {
      isDraggingPiece = false;
    }

    function show(square, piece) {
      return measure("moveHints.show", () => {
        clear();

        if (!piece || !canMovePiece(piece)) {
          return;
        }

        const moves = measure("moveHints.moves", () =>
          getLegalMoves().filter((move) => move.from === square),
        );

        if (moves.length === 0) {
          return;
        }

        squareElement(square)?.classList.add("move-source");

        moves.forEach((move) => {
          const element = squareElement(move.to);

          if (!element) {
            return;
          }

          element.classList.add("move-destination");

          if (move.captured) {
            element.classList.add("move-capture");
          }

          if (move.promotion) {
            element.classList.add("move-promotion");
          }
        });
      });
    }

    return {
      bindEvents,
      clear,
      show,
      startDrag,
      stopDrag,
    };
  }

  window.ChessMoveHints = {
    create: createMoveHints,
  };
})();
