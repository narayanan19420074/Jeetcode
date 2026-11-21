// What the board shows at the width and height it gets (not the window, because the sidebar and the side panel take room).
const SEARCH_INLINE_WIDTH = 700;
const NUMBERS_WIDTH = 540;
const ICON_ONLY_WIDTH = 640;
const TIGHT_HEIGHT = 700;

export default function useBoardLayout(boardW, boardH) {
  return {
    roomy: boardW >= SEARCH_INLINE_WIDTH,
    wide: boardW >= NUMBERS_WIDTH,
    iconOnly: boardW < ICON_ONLY_WIDTH,
    tight: boardH < TIGHT_HEIGHT,
  };
}
