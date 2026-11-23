import { bullets, code, courseModule, heading, lesson, note, predict, task, text } from '../contentBlocks';

const designTokens = lesson('l1', 'Design tokens', 25, [
  text('A design token is a named design decision, such as color-brand or space-4. Components use the name, never the raw value, so changing the token updates the whole product. Tokens are the bridge between design tools and code.'),
  code('{\n  "color": {\n    "brand": { "value": "indigo" },\n    "text":  { "value": "midnightblue" }\n  },\n  "space": { "4": { "value": "16px" } }\n}'),
  heading('Naming'),
  bullets('Use roles, not looks: color-text-muted instead of color-grey-500 when the colour means "secondary text"', 'Keep a consistent pattern: category, property, variant, state', 'Never name a token after its value, because values change'),
  text('The W3C Design Tokens Community Group is working on a standard file format so tools can exchange tokens.'),
  note('If a value is used twice, it probably needs a token. If it is used once, ask whether it needs to exist at all.'),
], [
  predict('e1', 'Which name is the better token name?', '', ['blue-4F46E5', 'color-action-primary', 'big-padding', 'button-colour-final2'], 1, 'It describes the role, so the value can change without renaming the token.'),
  task('e2', 'Write three CSS custom properties for the page background, the main text colour and the card radius, using role-based names.', 'Use the pattern --category-role.', ':root {\n  --color-background: white;\n  --color-text: midnightblue;\n  --radius-card: 12px;\n}'),
]);

const semanticColour = lesson('l2', 'Colour systems and dark mode', 25, [
  text('Systems use two token layers. Primitive tokens hold the raw palette (blue-500). Semantic tokens say how a colour is used (color-action-primary) and point at a primitive.'),
  code(':root {\n  --blue-600: royalblue;\n  --slate-900: midnightblue;\n  --slate-50: ghostwhite;\n  --color-action: var(--blue-600);\n  --color-text: var(--slate-900);\n  --color-surface: var(--slate-50);\n}'),
  heading('Dark mode'),
  text('With semantic tokens, dark mode only reassigns the semantic layer. No component changes.'),
  code('@media (prefers-color-scheme: dark) {\n  :root {\n    --color-text: var(--slate-50);\n    --color-surface: var(--slate-900);\n  }\n}'),
  note('Dark mode is not an inverted light mode. Re-check contrast and avoid pure black backgrounds with pure white text, which can look harsh.', 'warning'),
], [
  predict('e1', 'In a two-layer token system, what changes for dark mode?', '', ['Every component file', 'The semantic tokens', 'The primitive palette names', 'The HTML'], 1, 'Components read semantic tokens. Re-pointing those is enough.'),
  task('e2', 'Add a semantic token --color-border that uses --slate-200 in light mode and --slate-700 in dark mode (assume both primitives exist).', 'Define it in :root and again inside the dark media query.', ':root {\n  --color-border: var(--slate-200);\n}\n\n@media (prefers-color-scheme: dark) {\n  :root {\n    --color-border: var(--slate-700);\n  }\n}'),
]);

const responsiveType = lesson('l3', 'Responsive type and spacing', 20, [
  text('Screens range from small phones to wide monitors. A system defines how type and space adapt instead of fixing one size.'),
  bullets('Use relative units (rem, %, fr) for type and layout', 'Define breakpoints once as tokens, such as 600px, 900px and 1200px', 'Scale headings between a minimum and a maximum with clamp()'),
  code('h1 {\n  font-size: clamp(1.75rem, 1.2rem + 2vw, 2.5rem);\n}'),
  text('clamp(min, preferred, max) keeps the heading at least 1.75rem, at most 2.5rem, and fluid in between.'),
  note('Design mobile first: start with the smallest layout, then add rules for wider screens.'),
], [
  predict('e1', 'What does clamp(1rem, 2vw, 2rem) return when 2vw is 3rem?', '', ['1rem', '2rem', '3rem', '2vw'], 1, 'The preferred value is above the maximum, so clamp() returns the maximum, 2rem.'),
  task('e2', 'Write a CSS rule that sets body text to 1rem on phones and 1.125rem from a viewport width of 56.25em (900px at the default text size) upwards, mobile first.', 'Use a media query with the range syntax (width >= 56.25em).', 'body {\n  font-size: 1rem;\n}\n\n@media (width >= 56.25em) {\n  body {\n    font-size: 1.125rem;\n  }\n}'),
]);

const atomicDesign = lesson('l1', 'Atomic design and component anatomy', 25, [
  text('Atomic Design, introduced by Brad Frost, is a popular way to think about building interfaces from small parts to whole pages.'),
  bullets('Atoms: single elements such as a button, label or input', 'Molecules: small groups of atoms, such as a search field with its button', 'Organisms: larger sections such as a header or a product card list', 'Templates and pages: layouts filled with real content'),
  heading('Anatomy of a component'),
  text('Document every component with the same structure: what it is for, its parts, its variants, its states, how it behaves and what to avoid.'),
  note('Build small parts first and compose them. A card that rebuilds its own button cannot benefit when the button improves.'),
], [
  predict('e1', 'A search field made of a text input and a submit button is best described as a:', '', ['Atom', 'Molecule', 'Organism', 'Page'], 1, 'It combines two atoms into one small working unit, which is a molecule.'),
  task('e2', 'Break a product card (image, title, price, Add to cart button) into atoms and molecules.', 'Single elements are atoms; the group that works together is a molecule.', 'Atoms: image, title text, price text, button.\nMolecule: the product card, which combines them into one unit.'),
]);

const statesAndVariants = lesson('l2', 'Variants and states', 20, [
  text('A variant is a deliberate option, such as a primary or secondary button. A state is how the component responds to the user or the system.'),
  bullets('Default and hover', 'Focus: a clear visible outline for keyboard users', 'Active (pressed)', 'Disabled: not available; explain why when it is not obvious', 'Loading and error where they apply'),
  code('.button:focus-visible {\n  outline: 2px solid var(--color-focus);\n  outline-offset: 2px;\n}'),
  note('Never remove the focus outline without a replacement. Keyboard users would lose their place on the page.', 'warning'),
], [
  predict('e1', 'Which CSS selector shows a focus ring for keyboard users without showing it after a mouse click in most browsers?', '', [':hover', ':focus-visible', ':active', ':checked'], 1, ':focus-visible matches when the browser decides a visible focus indicator is helpful, mainly for keyboard focus.'),
  task('e2', 'List the states a text input should design for.', 'Think of the full life of a form field.', 'Default, hover, focus, filled, disabled, read-only, error (with message) and, where relevant, success and loading.'),
]);

const formsAndFeedback = lesson('l3', 'Forms and feedback patterns', 25, [
  text('Patterns combine components to solve a recurring problem. Forms and feedback are the most common ones.'),
  heading('Forms'),
  bullets('Validate on blur or submit, not on every keystroke', 'Say what went wrong and how to fix it: "Password needs at least 8 characters"', 'Keep the typed values after an error', 'Move focus to the first error and list errors at the top of long forms'),
  heading('Feedback'),
  bullets('Inline messages for field problems', 'Toasts for short, non-critical confirmations that disappear on their own', 'Banners for page-wide or persistent information', 'Dialogs only when the user must decide before continuing'),
  note('A toast disappears, so never put information in one that the user must be able to read again or act on.', 'warning'),
], [
  predict('e1', 'Which message follows good form feedback?', '', ['Invalid input', 'Error 422', 'Enter a date in the format DD/MM/YYYY', 'Something went wrong'], 2, 'It tells the user exactly what to enter. The others describe the failure without a fix.'),
  task('e2', 'Rewrite the error "Invalid password" so it explains what to do.', 'State the rule that was broken.', 'Your password needs at least 8 characters, including one number.'),
]);

const wcagBasics = lesson('l1', 'WCAG essentials', 25, [
  text('The Web Content Accessibility Guidelines (WCAG) are the international standard for accessible web content. They are built on four principles: Perceivable, Operable, Understandable and Robust (POUR). Levels A, AA and AAA grade conformance, and AA is the usual target.'),
  bullets('Contrast: 4.5:1 for normal text, 3:1 for large text and interface parts', 'Text alternatives: meaningful images have alt text; decorative images use an empty alt', 'Keyboard: every action works without a mouse and focus is always visible', 'Text can be resized to 200% without losing content', 'Do not rely on colour alone'),
  code('<img src="chart.png" alt="Sales grew 20% from January to March" />\n<img src="divider.svg" alt="" />'),
  note('Building accessibility into tokens and components is cheaper than fixing every page later. That is the strongest argument for doing it in the design system.'),
], [
  predict('e1', 'What alt text should a purely decorative image have?', '', ['"image"', 'The file name', 'An empty alt attribute (alt="")', 'No alt attribute'], 2, 'An empty alt tells screen readers to skip it. A missing alt can make them read the file name.'),
  task('e2', 'Name the four WCAG principles.', 'The acronym is POUR.', 'Perceivable, Operable, Understandable, Robust.'),
]);

const accessibleComponents = lesson('l2', 'Accessible components', 25, [
  text('Use native HTML first: a real button, link or input already brings keyboard support and the right role. Add ARIA only when no native element fits, and follow the WAI-ARIA Authoring Practices for custom widgets.'),
  heading('Keyboard behaviour to define for every component'),
  bullets('Tab moves between controls and Shift+Tab goes back', 'Enter and Space activate buttons', 'Arrow keys move inside groups such as tabs, menus and radio buttons', 'Escape closes dialogs and menus, and focus returns to the control that opened them'),
  code('<!-- Avoid -->\n<div class="button" onclick="save()">Save</div>\n\n<!-- Prefer -->\n<button type="button" onclick="save()">Save</button>'),
  note('The first rule of ARIA is not to use ARIA when a native element does the job. Wrong ARIA is worse than none.', 'warning'),
], [
  predict('e1', 'Which element gives keyboard support and a button role without extra code?', '', ['<div onclick>', '<span role="button">', '<button>', '<a> without href'], 2, 'The native button element handles focus, Enter, Space and its role by default.'),
  task('e2', 'List the keyboard behaviour a modal dialog must have.', 'Think about focus when it opens and closes.', 'Focus moves into the dialog when it opens, Tab stays inside it, Escape closes it and focus returns to the control that opened it.'),
]);

export const tokensModule = courseModule('i1', 'intermediate', 'Tokens', [designTokens, semanticColour, responsiveType]);
export const componentsModule = courseModule('i2', 'intermediate', 'Components and patterns', [atomicDesign, statesAndVariants, formsAndFeedback]);
export const accessibilityModule = courseModule('i3', 'intermediate', 'Accessibility', [wcagBasics, accessibleComponents]);
