import { bullets, code, courseModule, heading, lesson, note, predict, task, text } from '../contentBlocks';

const flexbox = lesson('l1', 'Display and flexbox', 25, [
  text('The display property decides how an element takes part in the layout. block elements start on a new line and fill the row, inline elements flow inside text, and none removes the element completely.'),
  heading('Flexbox: one-dimensional layout'),
  text('Set display: flex on a parent and its children line up in a row (or a column). Flexbox is the tool for navbars, button groups, toolbars and anything that sits in one line.'),
  code('.toolbar {\n  display: flex;\n  justify-content: space-between;  /* along the main axis */\n  align-items: center;             /* across it */\n  gap: 1rem;\n  flex-wrap: wrap;\n}\n\n.toolbar .grow { flex: 1; }       /* take the free space */'),
  bullets('justify-content: start, center, end, space-between, space-around', 'align-items: stretch (default), start, center, end', 'flex-direction: row (default) or column', 'flex: 1 lets an item grow to fill free space'),
  heading('Centre anything'),
  code('.center {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-block-size: 100dvh;\n}'),
  note('min-block-size is the logical name for min-height. In a horizontal writing mode they behave the same.'),
], [
  predict('e1', 'A flex container holds three items and has justify-content: space-between. Where are the items?', '', ['All bunched at the start', 'All centred together', 'The first at the start, the last at the end, the middle one between them', 'Stacked vertically'], 2, 'space-between pushes the first and last items to the edges and spreads the rest evenly.'),
  task('e2', 'Centre a card both horizontally and vertically inside a full-screen wrapper using flexbox.', 'Use justify-content and align-items on the wrapper, and give it a minimum height of one screen.', '.wrapper {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-block-size: 100dvh;\n}'),
]);

const grid = lesson('l2', 'CSS Grid', 25, [
  text('Grid is a two-dimensional layout system: rows and columns at the same time. Use it for page layouts, card galleries and dashboards. Flexbox for one line, Grid for a whole area.'),
  code('.gallery {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);  /* three equal columns */\n  gap: 1rem;\n}'),
  heading('A responsive grid with no media query'),
  code('.cards {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));\n  gap: 1.5rem;\n}'),
  text('Each column is at least 16rem wide, and the browser fits as many as it can, so a phone gets one column and a wide screen gets four.'),
  heading('Named areas'),
  code('.page {\n  display: grid;\n  grid-template-areas:\n    "header header"\n    "sidebar content"\n    "footer footer";\n  grid-template-columns: 14rem 1fr;\n}\n.page > header { grid-area: header; }\n.page > aside  { grid-area: sidebar; }\n.page > main   { grid-area: content; }\n.page > footer { grid-area: footer; }'),
  note('fr means "a fraction of the free space". 1fr 2fr gives the second column twice the room of the first.'),
], [
  predict('e1', 'What does grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr)) do?', '', ['Creates exactly 16 columns', 'Fits as many columns of at least 16rem as the row allows and shares the rest', 'Makes every column 1rem wide', 'Hides columns that do not fit'], 1, 'auto-fit adds columns while each can stay at least 16rem wide, then stretches them to fill the row.'),
  task('e2', 'Make a gallery with three equal columns and a 1rem gap.', 'Use repeat(3, 1fr).', '.gallery {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 1rem;\n}'),
]);

const positioning = lesson('l3', 'Positioning and stacking', 25, [
  text('The position property lets an element leave the normal flow or stay attached to something.'),
  bullets('static: the default, normal flow', 'relative: stays in flow, and becomes the reference point for absolute children', 'absolute: removed from flow and placed relative to the nearest positioned ancestor', 'fixed: attached to the viewport, stays put while scrolling (floating buttons, top bars)', 'sticky: scrolls normally, then sticks when it reaches the offset you set'),
  code('.card { position: relative; }\n\n.badge {\n  position: absolute;\n  top: 0.75rem;\n  right: 0.75rem;\n}\n\n.header {\n  position: sticky;\n  top: 0;\n  z-index: 100;\n}'),
  heading('z-index'),
  text('z-index controls which positioned element is in front. A higher number is in front, but only inside the same stacking context. Keep a short list of layers (header, dropdown, modal) in variables instead of using random big numbers.'),
  note('A sticky element does nothing when you forget the top value, or when a parent has overflow set to hidden or auto.', 'warning'),
], [
  predict('e1', 'An absolutely positioned badge is placed relative to which element?', '', ['The body, always', 'The nearest ancestor that is positioned (not static)', 'Its previous sibling', 'The viewport'], 1, 'That is why a card gets position: relative: the badge then sits in the card corner.'),
  task('e2', 'Put a "New" badge in the top-right corner of a card.', 'The card needs position: relative; the badge needs absolute with top and right.', '.card {\n  position: relative;\n}\n\n.badge {\n  position: absolute;\n  top: 0.75rem;\n  right: 0.75rem;\n}'),
]);

const responsive = lesson('l1', 'Responsive design and mobile first', 25, [
  text('People open your page on phones, tablets and wide monitors. A responsive design adapts to all of them with one stylesheet. Start with the small-screen layout and add rules as the screen grows (mobile first).'),
  code('<meta name="viewport" content="width=device-width, initial-scale=1" />'),
  heading('Media queries'),
  code('.cards {\n  display: grid;\n  grid-template-columns: 1fr;\n  gap: 1rem;\n}\n\n@media (width >= 40em) {\n  .cards { grid-template-columns: repeat(2, 1fr); }\n}\n\n@media (width >= 64em) {\n  .cards { grid-template-columns: repeat(3, 1fr); }\n}'),
  text('The em unit in a media query follows the user font size, so it adapts to people who enlarge their text. 40em is 640px and 64em is 1024px at the default size.'),
  heading('Fluid pieces'),
  bullets('Images: max-inline-size: 100% and block-size: auto stop them overflowing', 'Text: clamp(min, preferred, max) scales smoothly between two sizes', 'Layouts: grid with auto-fit, flex with wrap, percentages and fr units'),
  code('img {\n  max-inline-size: 100%;\n  block-size: auto;\n}\n\nh1 { font-size: clamp(1.75rem, 1.2rem + 2vw, 2.5rem); }'),
  note('Test by dragging the browser window narrow and by using the device toolbar in the developer tools.'),
], [
  predict('e1', 'In a mobile-first stylesheet, which kind of media query adds rules for larger screens?', '', ['(width <= 40em)', '(width >= 40em)', '(orientation: none)', '(print)'], 1, 'Base styles are for small screens, and min-width style queries (width >= ...) add changes as space grows.'),
  task('e2', 'Write a mobile-first grid that has 1 column by default, 2 columns from 40em and 3 columns from 64em.', 'Base rule first, then two media queries with (width >= ...).', '.cards {\n  display: grid;\n  grid-template-columns: 1fr;\n  gap: 1rem;\n}\n\n@media (width >= 40em) {\n  .cards { grid-template-columns: repeat(2, 1fr); }\n}\n\n@media (width >= 64em) {\n  .cards { grid-template-columns: repeat(3, 1fr); }\n}'),
]);

export const layoutModule = courseModule('i1', 'intermediate', 'Layout', [flexbox, grid, positioning]);
export const responsiveModule = courseModule('i3', 'intermediate', 'Responsive design', [responsive]);
