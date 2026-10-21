// Phone-only Monaco options shared by the pair room editor
// (same choices as the workspace editor — see the reasons in WorkspacePage).
export const MOBILE_EDITOR_OPTIONS = {
  folding: false,
  glyphMargin: false,
  lineNumbersMinChars: 2,
  lineDecorationsWidth: 6,
  renderLineHighlight: 'gutter',
  overviewRulerLanes: 0,
  hideCursorInOverviewRuler: true,
  scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
  stickyScroll: { enabled: false },
  // Popups cover a phone screen and Enter would accept them instead of adding a new line.
  quickSuggestions: false,
  suggestOnTriggerCharacters: false,
  acceptSuggestionOnEnter: 'off',
  acceptSuggestionOnCommitCharacter: false,
  wordBasedSuggestions: 'off',
  parameterHints: { enabled: false },
  hover: { enabled: false },
  contextmenu: false,
  occurrencesHighlight: 'off',
  selectionHighlight: false,
};
