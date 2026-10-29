// Workspace design tokens. One set of sizes, so every bar, button and tab in
// the workspace lines up (this is the "design system" for the page).
//
//   bar     - height of every pane header (problem tabs, editor toolbar)
//   ctrl    - height of every desktop control (button, select, icon button)
//   ctrlLg  - touch size used on phones
//   radius  - the only corner radius used for controls
//
// Borders: the page uses ONE hairline (theme divider) between regions.
// Everything else is separated by tone (chrome / canvas / panel / raised).
export const WS = { bar: 44, ctrl: 32, ctrlLg: 40, radius: 8, barSm: 36 };

export const mono = { fontFamily: '"JetBrains Mono", "Fira Code", monospace' };

// Phone accent: the same indigo the phone Dashboard and Problems pages use for tinted buttons and chips.
export const PHONE_ACCENT = '#6366F1';
