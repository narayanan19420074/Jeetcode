import { bullets, code, courseModule, heading, lesson, note, predict, task, text } from '../contentBlocks';

const whatIsCss = lesson('l1', 'What is CSS and how to add it', 15, [
  text('HTML gives a page its structure: headings, paragraphs, buttons, lists. CSS (Cascading Style Sheets) gives it its looks: colour, spacing, fonts and layout. The same HTML can look completely different with different CSS.'),
  heading('Anatomy of a rule'),
  code('p {\n  color: navy;\n  font-size: 1.125rem;\n}'),
  bullets('p is the selector: which elements to style', 'color and font-size are properties: what to change', 'navy and 1.125rem are values: what to change it to', 'One property with its value is a declaration, and a selector with its declarations is a rule'),
  heading('Three ways to add CSS'),
  bullets('Inline: a style attribute on one element (hard to maintain, avoid)', 'Internal: a style element in the page head (fine for a tiny demo)', 'External: a separate .css file linked from the page (the normal choice)'),
  code('<head>\n  <link rel="stylesheet" href="styles.css" />\n</head>'),
  note('Use external stylesheets. One file styles every page, the browser caches it, and the HTML stays clean.'),
], [
  predict('e1', 'Which way of adding CSS is recommended for a real website?', '', ['An inline style attribute on every element', 'An external .css file linked from the page', 'A style element copied into every page', 'JavaScript only'], 1, 'An external stylesheet is shared by all pages, cached by the browser and easy to maintain.'),
  task('e2', 'Write a rule that makes every h1 navy and centred.', 'Use the properties color and text-align.', 'h1 {\n  color: navy;\n  text-align: center;\n}'),
]);

const selectors = lesson('l2', 'Selectors and specificity', 20, [
  text('A selector chooses which elements a rule applies to. Learn these and you can style anything.'),
  code('p { }                    /* element: every paragraph */\n.card { }                /* class: elements with class="card" */\n#main { }                /* id: the one element with id="main" */\nnav a { }                /* descendant: links anywhere inside a nav */\nul > li { }              /* child: li directly inside ul */\nh1, h2 { }               /* group: both */\ninput[type="email"] { }  /* attribute */\na:hover { }              /* pseudo-class: a state */\np::first-line { }        /* pseudo-element: a part of an element */'),
  heading('Specificity: who wins?'),
  text('When two rules style the same property of the same element, the more specific selector wins. From weakest to strongest: element, then class, attribute and pseudo-class, then id, then an inline style. When specificity is equal, the rule that comes later wins. That is the "cascade".'),
  note('Style with classes. Ids are too strong to override later, and long chains of selectors are hard to change.'),
], [
  predict('e1', 'A button has class="btn". Which colour does its text get?', '.btn { color: red; }\nbutton { color: blue; }', ['Red', 'Blue', 'Purple', 'The browser default'], 0, 'A class selector is more specific than an element selector, so red wins even though the blue rule comes later.'),
  task('e2', 'Style only the links inside the nav element, giving them no underline.', 'Use a descendant selector: nav a.', 'nav a {\n  text-decoration: none;\n}'),
]);

const boxModel = lesson('l3', 'The box model', 20, [
  text('Every element is a rectangular box made of four layers, from the inside out: content, padding (space inside the border), border and margin (space outside).'),
  code('.box {\n  padding: 1rem;\n  border: 2px solid var(--border-color);\n  margin: 1.5rem auto;\n}'),
  heading('box-sizing'),
  text('By default the size you set applies to the content only, so padding and border are added on top and boxes become larger than you planned. Setting box-sizing to border-box makes the size include padding and border. Almost every project starts with this reset:'),
  code('*,\n*::before,\n*::after {\n  box-sizing: border-box;\n}'),
  heading('Handy shorthands'),
  bullets('padding: 1rem 2rem means 1rem top and bottom, 2rem left and right', 'margin-inline: auto centres a block that has a set width', 'gap adds space between items in flex and grid layouts, so you need fewer margins'),
  note('Vertical margins of neighbouring blocks collapse into the larger one. Flex and grid containers do not collapse margins.'),
], [
  predict('e1', 'With the default box-sizing, a box has a content width of 200px, 20px padding and a 5px border on each side. How wide is it in total?', '', ['200px', '230px', '250px', '260px'], 2, '200 + 2 x 20 + 2 x 5 = 250px. With border-box the total would stay 200px.'),
  task('e2', 'Write the standard reset that makes every element, and its ::before and ::after, use border-box sizing.', 'Select everything with *.', '*,\n*::before,\n*::after {\n  box-sizing: border-box;\n}'),
]);

const coloursUnitsType = lesson('l4', 'Colours, units and typography', 25, [
  heading('Colours'),
  text('CSS accepts named colours such as navy and crimson, hexadecimal codes that start with a hash sign, rgb() and hsl() functions, and the modern oklch(). In a real project keep colours in variables (you will do that in the lesson on custom properties) so one change updates the whole site.'),
  code('body {\n  color: midnightblue;\n  background: ghostwhite;\n}\n\na {\n  color: oklch(0.55 0.2 260);\n}'),
  heading('Units'),
  bullets('px: a fixed pixel; good for thin borders', 'rem: relative to the root font size (16px by default); the best choice for text and spacing because it respects user settings', 'em: relative to the current element font size', '%: relative to the parent', 'vw and dvh: a share of the viewport width or height', 'fr: a share of free space in a grid'),
  heading('Typography'),
  code(':root { --leading: 1.6; }\n\nbody {\n  font-family: var(--font-body);\n  font-size: 1rem;\n  line-height: var(--leading);\n}\n\nh1 {\n  font-size: 2rem;\n  font-weight: 700;\n  letter-spacing: -0.02em;\n}'),
  note('Use a unitless line-height (1.5 to 1.7 for body text) so it scales with the font size.'),
], [
  predict('e1', 'The root font size is 16px. What size is 1.5rem?', '', ['15px', '18px', '24px', '32px'], 2, '1.5 x 16px = 24px.'),
  task('e2', 'Set the body to 1rem text with a line height of 1.6 and make h2 headings 1.5rem and bold.', 'Two rules: one for body and one for h2.', ':root { --leading: 1.6; }\n\nbody {\n  font-size: 1rem;\n  line-height: var(--leading);\n}\n\nh2 {\n  font-size: 1.5rem;\n  font-weight: 700;\n}'),
]);

const borderDesigns = lesson('l1', 'Borders and border-bottom designs', 25, [
  text('A border-bottom is a line drawn under an element. It is one of the most used details in interfaces: under the navbar, under headings, under form inputs, under the active tab and between list rows. Here are the shared variables that the next lessons also use.'),
  code(':root {\n  --brand: royalblue;\n  --text: midnightblue;\n  --surface: white;\n  --border-color: lightgray;\n  --radius: 0.5rem;\n  --radius-pill: 999px;\n  --shadow-1: 0 0.125rem 0.5rem color-mix(in srgb, black 15%, transparent);\n  --shadow-2: 0 0.5rem 1.5rem color-mix(in srgb, black 20%, transparent);\n}'),
  heading('Design names: the border-bottom styles'),
  bullets('Hairline divider: a thin neutral line that separates rows', 'Dashed and dotted: a lighter, informal separator', 'Double line: a formal, classic look', 'Accent bar: a thick brand-coloured line under a section', 'Gradient underline: a line that fades between two colours', 'Animated underline: grows from the left on hover', 'Active tab underline: marks the selected tab or link', 'Text underline: the link underline with thickness and offset', 'Input underline: a form field with only a bottom line'),
  code('/* Hairline divider */\n.hairline { border-bottom: 1px solid var(--border-color); }\n\n/* Dashed and dotted */\n.dashed { border-bottom: 2px dashed var(--border-color); }\n.dotted { border-bottom: 2px dotted var(--brand); }\n\n/* Double line */\n.double { border-bottom: 4px double var(--text); }\n\n/* Accent bar */\n.accent-bar { border-bottom: 4px solid var(--brand); }'),
  code('/* Gradient underline */\n.gradient-line {\n  border-bottom: 4px solid;\n  border-image: linear-gradient(to right, royalblue, hotpink) 1;\n}\n\n/* Text underline with style */\n.fancy-link {\n  text-decoration: underline;\n  text-decoration-thickness: 2px;\n  text-underline-offset: 0.25em;\n}'),
  code('/* Animated underline */\n.link {\n  position: relative;\n  text-decoration: none;\n}\n.link::after {\n  content: "";\n  position: absolute;\n  inset-inline: 0;\n  bottom: 0;\n  border-bottom: 2px solid var(--brand);\n  transform: scaleX(0);\n  transform-origin: left;\n  transition: transform 0.3s ease;\n}\n.link:hover::after { transform: scaleX(1); }'),
  code('/* Active tab underline */\n.tab { border-bottom: 3px solid transparent; }\n.tab[aria-selected="true"] { border-bottom-color: var(--brand); }\n\n/* Input underline */\n.field {\n  border: 0;\n  border-bottom: 2px solid var(--border-color);\n  background: transparent;\n}\n.field:focus-visible { border-bottom-color: var(--brand); }'),
  note('Give inactive tabs a transparent border of the same thickness. Then the active tab does not push the layout down when its border appears.'),
], [
  predict('e1', 'Why do inactive tabs have border-bottom: 3px solid transparent?', '', ['It hides the tab', 'It reserves the space so the layout does not jump when a tab becomes active', 'It makes the tab load faster', 'It is required by HTML'], 1, 'The transparent border takes the same space as the coloured one, so nothing shifts.'),
  task('e2', 'In a navbar, give every link a 3px transparent bottom border and give the current page link (aria-current="page") a brand-coloured one.', 'Set the border on .nav a, then override only the colour for the current link.', '.nav a {\n  border-bottom: 3px solid transparent;\n}\n\n.nav a[aria-current="page"] {\n  border-bottom-color: var(--brand);\n}'),
]);

const buttonDesigns = lesson('l2', 'Button designs', 30, [
  text('A button is a control that makes something happen: save, send, delete. Use the button element for actions and the a element for links that go to another page. Start from one base style and add a class for each design.'),
  code('.btn {\n  display: inline-flex;\n  align-items: center;\n  gap: 0.5rem;\n  padding: 0.625rem 1.25rem;\n  border: 2px solid transparent;\n  border-radius: var(--radius);\n  font: inherit;\n  font-weight: 600;\n  cursor: pointer;\n  transition: background-color 0.2s, transform 0.1s;\n}'),
  heading('Design names'),
  bullets('Solid (filled or primary): the main action', 'Outline (secondary): a border and no fill', 'Ghost (text): no border and no fill, for low-priority actions', 'Soft (tonal): a light tint of the brand colour', 'Pill: fully rounded ends', 'Icon button: round, holds only an icon', 'Gradient: a colour blend for hero actions', '3D (raised): a solid edge that presses down on click', 'Glass: translucent, used over images', 'Destructive: red, for delete'),
  code('.btn-solid { background: var(--brand); color: white; }\n.btn-solid:hover { background: color-mix(in srgb, var(--brand) 85%, black); }\n\n.btn-outline { background: transparent; color: var(--brand); border-color: var(--brand); }\n.btn-outline:hover { background: color-mix(in srgb, var(--brand) 10%, transparent); }\n\n.btn-ghost { background: transparent; color: var(--brand); }\n.btn-ghost:hover { background: color-mix(in srgb, var(--brand) 10%, transparent); }\n\n.btn-soft { background: color-mix(in srgb, var(--brand) 15%, white); color: var(--brand); }'),
  code('.btn-pill { border-radius: var(--radius-pill); }\n\n.btn-icon { padding: 0.625rem; border-radius: 50%; aspect-ratio: 1; }\n\n.btn-gradient { background: linear-gradient(135deg, royalblue, rebeccapurple); color: white; }\n\n.btn-3d {\n  background: var(--brand);\n  color: white;\n  box-shadow: 0 0.25rem 0 color-mix(in srgb, var(--brand) 60%, black);\n}\n.btn-3d:active { transform: translateY(0.25rem); box-shadow: none; }\n\n.btn-glass {\n  color: white;\n  background: color-mix(in srgb, white 25%, transparent);\n  border-color: color-mix(in srgb, white 40%, transparent);\n  backdrop-filter: blur(8px);\n}\n\n.btn-danger { background: crimson; color: white; }'),
  heading('States'),
  code('.btn:focus-visible { outline: 3px solid var(--brand); outline-offset: 3px; }\n.btn:disabled { opacity: 0.5; cursor: not-allowed; }'),
  note('Keep a visible focus style and a touch target of at least 44 pixels. Never remove the outline without a replacement.', 'warning'),
], [
  predict('e1', 'Which declaration gives a button fully rounded ends (a pill) when --radius-pill is a very large value?', '', ['border-radius: 0', 'border-radius: var(--radius-pill)', 'border-radius: var(--brand)', 'border: pill'], 1, 'A radius larger than half the button height rounds the ends completely.'),
  task('e2', 'Write a .btn-ghost class: transparent background, brand-coloured text, and a soft brand tint on hover.', 'Use color-mix for the tint.', '.btn-ghost {\n  background: transparent;\n  color: var(--brand);\n}\n\n.btn-ghost:hover {\n  background: color-mix(in srgb, var(--brand) 10%, transparent);\n}'),
]);

const cardDesigns = lesson('l3', 'Card designs', 30, [
  text('A card is a container that groups related content, such as an image, a title, some text and an action, into one clear unit. Cards are the building block of feeds, dashboards and product lists.'),
  code('.card {\n  padding: 1.25rem;\n  background: var(--surface);\n  border-radius: var(--radius);\n}'),
  heading('Design names'),
  bullets('Bordered (outlined): a thin line, flat and calm', 'Elevated: a soft shadow lifts it off the page', 'Flat (tonal): a tinted background, no border or shadow', 'Hover lift: rises when the pointer is over it', 'Image top (media card): picture first, text below', 'Horizontal: image on the side', 'Accent bar: a coloured line on one edge', 'Glass: translucent over an image or gradient', 'Gradient border: a colourful outline', 'Stat card: a big number with a label, used in dashboards'),
  code('.card-bordered { border: 1px solid var(--border-color); }\n\n.card-elevated { box-shadow: var(--shadow-1); }\n\n.card-flat { background: color-mix(in srgb, var(--brand) 8%, white); }\n\n.card-lift { transition: transform 0.2s, box-shadow 0.2s; }\n.card-lift:hover { transform: translateY(-0.25rem); box-shadow: var(--shadow-2); }\n\n.card-accent { border-top: 4px solid var(--brand); }'),
  code('/* Image top */\n.card-media { padding: 0; overflow: hidden; }\n.card-media img {\n  display: block;\n  inline-size: 100%;\n  aspect-ratio: 16 / 9;\n  object-fit: cover;\n}\n.card-media .card-body { padding: 1.25rem; }\n\n/* Horizontal */\n.card-horizontal {\n  display: grid;\n  grid-template-columns: 10rem 1fr;\n  gap: 1rem;\n}'),
  code('/* Glass */\n.card-glass {\n  background: color-mix(in srgb, white 20%, transparent);\n  border: 1px solid color-mix(in srgb, white 35%, transparent);\n  backdrop-filter: blur(12px);\n}\n\n/* Gradient border */\n.card-gradient-border {\n  border: 2px solid transparent;\n  background:\n    linear-gradient(white, white) padding-box,\n    linear-gradient(135deg, royalblue, hotpink) border-box;\n}\n\n/* Stat card */\n.stat-value { font-size: 2rem; font-weight: 700; }\n.stat-label { color: gray; }'),
  note('Make the whole card clickable with one real link inside it, rather than wrapping everything in a link. Screen readers then announce a single clear link.'),
], [
  predict('e1', 'Which property clips an image so its corners follow the rounded corners of the card?', '', ['overflow: hidden on the card', 'display: none', 'position: static', 'object-fit: fill'], 0, 'overflow: hidden cuts off anything that sticks out of the rounded box.'),
  task('e2', 'Write a .card-lift design: a smooth transition, and on hover it moves up a little and gets a bigger shadow.', 'Use transform: translateY() with a negative value.', '.card-lift {\n  transition: transform 0.2s, box-shadow 0.2s;\n}\n\n.card-lift:hover {\n  transform: translateY(-0.25rem);\n  box-shadow: var(--shadow-2);\n}'),
]);

export const cssBasicsModule = courseModule('b1', 'beginner', 'CSS basics', [whatIsCss, selectors, boxModel, coloursUnitsType]);
export const elementsModule = courseModule('b2', 'beginner', 'Styling elements: borders, buttons, cards', [borderDesigns, buttonDesigns, cardDesigns]);
