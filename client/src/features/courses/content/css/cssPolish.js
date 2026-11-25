import { bullets, code, courseModule, heading, lesson, note, predict, task, text } from '../contentBlocks';

const scrollbars = lesson('l1', 'Scrollbar designs', 30, [
  text('A scrollbar is the control that shows how far an element is scrolled and lets you drag it. It appears when content is taller or wider than its box and overflow is set to auto or scroll. Its look comes from the operating system unless you style it.'),
  heading('Design names'),
  bullets('Default (native): the browser and system look', 'Thin: a slimmer bar that takes less room', 'Coloured: brand-coloured thumb on a soft track', 'Rounded thumb: a pill-shaped handle', 'Overlay (auto-hide): the system draws it over the content and hides it when idle', 'Hidden but scrollable: no bar, used on carousels with other cues', 'Stable gutter: space is always reserved so the layout never jumps', 'Snap carousel: scroll that stops neatly on each item'),
  heading('Standard properties'),
  code('.scroll-area {\n  overflow-y: auto;\n  scrollbar-width: thin;                      /* auto, thin or none */\n  scrollbar-color: var(--brand) transparent;  /* thumb then track */\n  scrollbar-gutter: stable;                   /* reserve space */\n}'),
  text('scrollbar-width and scrollbar-color are the standard way. They are supported by current Chrome, Edge and Firefox, and by newer Safari versions, so check browser support before you rely on them.'),
  heading('WebKit pseudo-elements (rounded thumb)'),
  code(':root { --scrollbar-size: 0.5rem; }\n\n.scroll-rounded::-webkit-scrollbar {\n  width: var(--scrollbar-size);\n  height: var(--scrollbar-size);\n}\n.scroll-rounded::-webkit-scrollbar-track { background: transparent; }\n.scroll-rounded::-webkit-scrollbar-thumb {\n  background: var(--brand);\n  border-radius: var(--radius-pill);\n}\n.scroll-rounded::-webkit-scrollbar-thumb:hover {\n  background: color-mix(in srgb, var(--brand) 80%, black);\n}'),
  heading('Hidden, smooth and snapping'),
  code('/* Hidden but still scrollable */\n.no-scrollbar { scrollbar-width: none; }\n.no-scrollbar::-webkit-scrollbar { display: none; }\n\n/* Smooth anchor scrolling, only when the user allows motion */\nhtml { scroll-behavior: smooth; }\n@media (prefers-reduced-motion: reduce) {\n  html { scroll-behavior: auto; }\n}\n\n/* Stop scroll chaining out of a modal */\n.modal-body { overscroll-behavior: contain; }\n\n/* Snap carousel */\n.carousel {\n  display: flex;\n  gap: 1rem;\n  overflow-x: auto;\n  scroll-snap-type: x mandatory;\n}\n.carousel > * { flex: none; scroll-snap-align: start; }'),
  note('Do not make the thumb so thin or so pale that people cannot see or grab it, and do not hide scrollbars unless another cue shows there is more content.', 'warning'),
], [
  predict('e1', 'Which property reserves space for the scrollbar so the layout does not shift when it appears?', '', ['scrollbar-gutter: stable', 'scrollbar-width: none', 'overflow: hidden', 'scroll-behavior: smooth'], 0, 'stable keeps the gutter space whether or not a scrollbar is currently shown.'),
  task('e2', 'Give the .sidebar a thin brand-coloured scrollbar on a transparent track using the standard properties, plus a rounded thumb for WebKit (assume --scrollbar-size exists).', 'Use scrollbar-width and scrollbar-color, then ::-webkit-scrollbar and ::-webkit-scrollbar-thumb.', '.sidebar {\n  overflow-y: auto;\n  scrollbar-width: thin;\n  scrollbar-color: var(--brand) transparent;\n}\n\n.sidebar::-webkit-scrollbar { width: var(--scrollbar-size); }\n.sidebar::-webkit-scrollbar-track { background: transparent; }\n.sidebar::-webkit-scrollbar-thumb {\n  background: var(--brand);\n  border-radius: var(--radius-pill);\n}'),
]);

const motion = lesson('l2', 'Transitions and animations', 25, [
  text('A transition smoothly changes a property from one value to another when something happens, such as a hover. An animation plays a series of steps that you describe with @keyframes, and it can run by itself.'),
  code('.btn {\n  transition: background-color 0.2s ease, transform 0.1s ease;\n}\n.btn:hover { background-color: navy; }\n.btn:active { transform: scale(0.97); }'),
  heading('Keyframes'),
  code('@keyframes fade-up {\n  from { opacity: 0; transform: translateY(1rem); }\n  to   { opacity: 1; transform: translateY(0); }\n}\n\n.reveal { animation: fade-up 0.4s ease both; }\n\n@keyframes spin { to { transform: rotate(360deg); } }\n.spinner { animation: spin 0.8s linear infinite; }'),
  heading('Good practice'),
  bullets('Animate transform and opacity: the browser can do these smoothly', 'Avoid animating layout properties such as margin and size', 'Keep UI motion short: about 150 to 300 milliseconds', 'Respect users who ask for less motion'),
  code('@media (prefers-reduced-motion: reduce) {\n  *, *::before, *::after {\n    animation-duration: 0.01ms;\n    animation-iteration-count: 1;\n    transition-duration: 0.01ms;\n  }\n}'),
  note('Motion should explain what changed, not decorate. If an animation delays an action, remove it.'),
], [
  predict('e1', 'Which pair of properties is the cheapest to animate?', '', ['width and height', 'transform and opacity', 'margin and padding', 'top and left'], 1, 'transform and opacity usually do not trigger layout, so animations stay smooth.'),
  task('e2', 'Write a fade-in animation of 0.4 seconds for a .toast element: from fully transparent to fully visible.', 'Define @keyframes, then use the animation property.', '@keyframes fade-in {\n  from { opacity: 0; }\n  to { opacity: 1; }\n}\n\n.toast {\n  animation: fade-in 0.4s ease both;\n}'),
]);

const themes = lesson('l3', 'Custom properties, themes and dark mode', 25, [
  text('A custom property (CSS variable) stores a value under a name that starts with two dashes. Read it with var(). It is how design systems keep colours, spacing and radii in one place.'),
  code(':root {\n  --brand: royalblue;\n  --surface: white;\n  --text: midnightblue;\n}\n\n.card {\n  background: var(--surface);\n  color: var(--text);\n  border-left: 4px solid var(--brand);\n}\n\n.card-danger { --brand: crimson; }  /* change it for one component */'),
  text('Custom properties follow the cascade: a value set on an element is inherited by its children. var(--x, fallback) uses a fallback when the variable is missing.'),
  heading('Dark mode'),
  text('Change the variables, not the components. Follow the system setting with a media query, and let users choose with a data attribute.'),
  code(':root { color-scheme: light dark; }\n\n@media (prefers-color-scheme: dark) {\n  :root {\n    --surface: midnightblue;\n    --text: ghostwhite;\n  }\n}\n\n[data-theme="dark"] {\n  --surface: midnightblue;\n  --text: ghostwhite;\n}'),
  note('Dark mode is not just inverted colours. Check text contrast again and avoid harsh pure white on pure black.'),
], [
  predict('e1', 'A rule sets --brand: crimson on .card-danger. Which elements see the new value?', '', ['The whole page', '.card-danger and the elements inside it', 'Only elements after it in the file', 'Nothing, variables cannot be overridden'], 1, 'Custom properties are inherited, so the element and its descendants use the new value.'),
  task('e2', 'Add a dark theme chosen by data-theme="dark" on the html element that changes --surface to midnightblue and --text to ghostwhite.', 'Use an attribute selector.', '[data-theme="dark"] {\n  --surface: midnightblue;\n  --text: ghostwhite;\n}'),
]);

const modernCss = lesson('l4', 'Modern CSS', 30, [
  text('CSS has gained powerful features. These are supported by current browsers, and they remove a lot of JavaScript and extra classes.'),
  heading('Nesting'),
  code('.card {\n  padding: 1rem;\n\n  &:hover { box-shadow: var(--shadow-2); }\n  .title { font-weight: 700; }\n}'),
  heading(':has(), the parent selector'),
  code('/* A card that contains an image has no padding */\n.card:has(img) { padding: 0; }\n\n/* A field whose input is invalid shows a red border */\n.field:has(input:invalid) { border-color: crimson; }'),
  heading('Container queries'),
  text('A media query looks at the screen. A container query looks at the space of the component itself, so the same card adapts in a sidebar and in a wide grid.'),
  code('.card-wrap { container-type: inline-size; }\n\n@container (width >= 30em) {\n  .card { display: grid; grid-template-columns: 10rem 1fr; }\n}'),
  heading('More'),
  bullets('clamp(min, preferred, max) for fluid sizes', 'Logical properties (margin-inline, padding-block, inset, inline-size) that work in every writing direction', 'aspect-ratio for images and video boxes', '@layer to control which group of rules wins, regardless of specificity'),
  code('@layer reset, base, components, utilities;\n\n@layer components {\n  .btn { padding: 0.5rem 1rem; }\n}'),
  note('Check support on caniuse.com for the browsers your users have before you depend on a new feature, and provide a sensible fallback.'),
], [
  predict('e1', 'What does .card:has(img) select?', '', ['Images inside cards', 'Cards that contain an img', 'The card after an image', 'Every element with an alt text'], 1, ':has() matches the element on the left when something inside it matches the selector in the brackets.'),
  task('e2', 'Use :has() to give a .field a crimson border when it contains an invalid input.', 'Combine .field with :has(input:invalid).', '.field:has(input:invalid) {\n  border-color: crimson;\n}'),
]);

export const polishModule = courseModule('a1', 'advanced', 'Polish and modern CSS', [scrollbars, motion, themes, modernCss]);
