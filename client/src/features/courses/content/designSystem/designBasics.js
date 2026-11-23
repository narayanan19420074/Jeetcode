import { bullets, code, courseModule, heading, lesson, note, predict, task, text } from '../contentBlocks';

const whatIsADesignSystem = lesson('l1', 'What is a design system?', 15, [
  text('A design system is the shared set of decisions, parts and rules that a team uses to build a consistent product. It is more than a UI kit: it joins design, code and documentation so everyone builds from the same source.'),
  heading('The four layers'),
  bullets('Principles: the values behind decisions, such as "clear before clever"', 'Foundations: colour, type, spacing, icons and motion, usually stored as design tokens', 'Components: buttons, inputs, dialogs and the patterns built from them', 'Guidelines: when to use each part, how it behaves and how to contribute'),
  heading('Why teams build one'),
  bullets('Consistency: the same action looks and works the same on every screen', 'Speed: designers and developers reuse parts instead of redrawing and rewriting them', 'Quality: accessibility and bug fixes made once reach every product', 'Shared language: "primary button" means one thing to everybody'),
  note('Well-known public systems to study are Material Design (Google), Carbon (IBM), Polaris (Shopify), Atlassian Design System and GOV.UK Design System.'),
], [
  predict('e1', 'Which item belongs to the foundations layer of a design system?', '', ['A date-picker component', 'The colour palette and type scale', 'A rule for when to use a modal', 'A checkout page'], 1, 'Foundations are the basic visual decisions (colour, type, spacing). Components and patterns are built from them.'),
  task('e2', 'List three problems a product has when it ships without a design system.', 'Think about what happens when ten people each design a button.', 'Inconsistent look and behaviour between screens.\nSlow work, because parts are redrawn and rebuilt every time.\nAccessibility fixes and bug fixes must be repeated in many places.'),
]);

const hierarchyAndLayout = lesson('l2', 'Visual hierarchy and layout', 20, [
  text('Hierarchy tells the eye what to read first. You create it with size, weight, colour, contrast and space. If everything is emphasised, nothing is.'),
  bullets('Size and weight: the page title is the largest and boldest text', 'Contrast: the primary action is the most visible control on the screen', 'Proximity: related items sit close together, unrelated items sit apart', 'Alignment: a shared edge makes a layout look ordered'),
  heading('Layout grids'),
  text('A grid divides the page into columns with gutters. Most web systems use 12 columns because 12 divides evenly by 2, 3, 4 and 6. On phones the layout usually collapses to 4 columns.'),
  note('Use space to group before you add lines and boxes. Extra borders add noise; extra margin adds clarity.'),
], [
  predict('e1', 'A form has a Save and a Cancel button. Which treatment follows good hierarchy?', '', ['Both buttons filled with the brand colour', 'Save filled, Cancel as a text or outlined button', 'Cancel filled, Save as a text button', 'Both buttons as plain text'], 1, 'One primary action should stand out. Secondary actions use a quieter style.'),
  task('e2', 'Describe how you would show that a group of three fields (street, city, postcode) belongs together, without drawing any border.', 'Use space and alignment.', 'Place the three fields close together with a small gap, add a larger gap above and below the group, align them on the same left edge and give the group one short label.'),
]);

const colourBasics = lesson('l3', 'Colour and contrast', 20, [
  text('Colour carries brand, meaning and emphasis. A system picks a small palette and gives each colour a job, instead of choosing colours screen by screen.'),
  bullets('Brand colour: identity and the primary action', 'Neutrals: text, backgrounds and borders (most of the interface)', 'Semantic colours: success (green), warning (amber), error (red) and info (blue)'),
  heading('Contrast'),
  text('Contrast is the brightness difference between text and its background, written as a ratio from 1:1 to 21:1. The Web Content Accessibility Guidelines (WCAG) AA level asks for at least 4.5:1 for normal text and 3:1 for large text and for interface parts such as input borders.'),
  code('color: dimgray;   /* on white: about 5.5:1, passes AA */\ncolor: silver;    /* on white: about 1.8:1, fails AA */'),
  note('Never use colour as the only signal. An error needs an icon or text as well, because some users cannot tell red from green.', 'warning'),
], [
  predict('e1', 'What is the minimum WCAG AA contrast ratio for normal body text?', '', ['2:1', '3:1', '4.5:1', '21:1'], 2, 'AA requires 4.5:1 for normal text. Large text and UI components need 3:1.'),
  task('e2', 'A form field turns its border red on error. Add two more cues so that colour is not the only signal.', 'Think of text and an icon.', 'Show an error icon next to the field and an error message under it, such as "Enter a valid email address".'),
]);

const typography = lesson('l4', 'Typography', 20, [
  text('Type makes up most of an interface. A system chooses a small set of fonts and a type scale: a fixed list of sizes used for every heading and paragraph.'),
  bullets('Use one or two font families, such as a sans-serif for the interface and a monospace for code', 'Body text is 16px (1rem) on the web by default and should not go much smaller', 'A line of text reads best at about 45 to 75 characters', 'Line height of 1.4 to 1.6 for body text keeps lines easy to follow'),
  heading('A simple scale'),
  code('--text-sm: 0.875rem;   /* 14px */\n--text-md: 1rem;       /* 16px */\n--text-lg: 1.25rem;    /* 20px */\n--text-xl: 1.5rem;     /* 24px */\n--text-2xl: 2rem;      /* 32px */'),
  note('Use rem, not px, for font sizes. Users who change their browser text size then get larger text in your product too.'),
], [
  predict('e1', 'Why are font sizes written in rem instead of px in most systems?', '', ['rem renders faster', 'rem follows the user text-size setting', 'px is not valid CSS', 'rem is always 16px'], 1, 'rem is relative to the root font size, so it scales when users enlarge their text.'),
  task('e2', 'Write a five-step type scale in rem for headings from small to extra large, with the pixel size in a comment.', 'Pick sizes that grow by a steady ratio, such as 1.25.', '--text-sm: 0.875rem;  /* 14px */\n--text-md: 1rem;      /* 16px */\n--text-lg: 1.25rem;   /* 20px */\n--text-xl: 1.5rem;    /* 24px */\n--text-2xl: 2rem;     /* 32px */'),
]);

const spacingAndSizing = lesson('l1', 'Spacing and sizing scales', 15, [
  text('Random spacing values make a product look unfinished. A spacing scale limits the choices to a short list, and most systems build it on a 4px or 8px base unit.'),
  code('--space-1: 4px;\n--space-2: 8px;\n--space-3: 12px;\n--space-4: 16px;\n--space-6: 24px;\n--space-8: 32px;'),
  bullets('Small gaps (4 to 8px) join an icon and its label', 'Medium gaps (16px) separate fields in a form', 'Large gaps (32px and more) separate page sections'),
  heading('Touch targets'),
  text('Controls must be easy to hit. Material Design recommends 48 by 48 density-independent pixels, and WCAG 2.2 sets 24 by 24 CSS pixels as the minimum. Small icons can have a larger invisible hit area.'),
], [
  predict('e1', 'Which spacing value fits an 8px-based scale?', '', ['13px', '18px', '24px', '27px'], 2, '24px is 3 times 8. The other values do not fall on the grid.'),
  task('e2', 'An icon button has a 20px icon. How would you make its touch target at least 44px?', 'Add padding around the icon.', 'Add 12px padding on every side: 20 + 12 + 12 = 44px.'),
]);

const surfacesAndIcons = lesson('l2', 'Radius, elevation and icons', 15, [
  text('Small shared choices give a product its character. Pick a few values for each and reuse them.'),
  bullets('Border radius: for example 4px for tags, 8px for controls and 12px for cards, plus a full round value for pills', 'Elevation: a short list of shadows that suggest layers, such as card, menu and dialog', 'Icons: one family, one stroke style and a few fixed sizes (16, 20 and 24px)'),
  heading('Icons need labels'),
  text('An icon alone is often ambiguous. Pair it with text, or give icon-only buttons an accessible name and a tooltip.'),
  code('<button aria-label="Delete comment">\n  <TrashIcon />\n</button>'),
  note('More elevation is not better. Use shadows to show real layers, such as a menu over a page, and avoid them on flat content.'),
], [
  predict('e1', 'What does an icon-only button need so a screen reader can announce it?', '', ['A bigger icon', 'An aria-label or visible text', 'A red colour', 'A border'], 1, 'The accessible name comes from text, aria-label or aria-labelledby. Visual size does not help.'),
  task('e2', 'Define three radius tokens named radius-sm, radius-md and radius-lg and say where each is used.', 'Match small radius to small parts and large radius to large surfaces.', '--radius-sm: 4px;   /* tags, badges */\n--radius-md: 8px;   /* buttons, inputs */\n--radius-lg: 12px;  /* cards, dialogs */'),
]);

const basicComponents = lesson('l3', 'Buttons and inputs', 20, [
  text('Buttons and inputs are the first components of every system. Define them well and the rest follow the same rules.'),
  heading('Buttons'),
  bullets('Primary: the main action on a screen (usually one)', 'Secondary: other actions, outlined or tonal', 'Tertiary or text: low-emphasis actions such as Cancel', 'Destructive: actions that delete data; ask for confirmation first'),
  heading('Inputs'),
  bullets('Always show a visible label above the field, not only a placeholder', 'Show helper text and error text under the field', 'Mark optional fields, not required ones, when most fields are required', 'Use the correct input type (email, tel, number) so phones show the right keyboard'),
  code('<label for="email">Email address</label>\n<input id="email" type="email" autocomplete="email" />\n<p id="email-help">We only use this to sign you in.</p>'),
], [
  predict('e1', 'Why is a placeholder alone a poor label?', '', ['It is not allowed in HTML', 'It disappears when the user types and often has low contrast', 'It slows down the page', 'It cannot hold text'], 1, 'The hint vanishes while typing and is easy to miss. A visible label stays on screen.'),
  task('e2', 'Write the HTML for a password field with a visible label and helper text "At least 8 characters".', 'Connect the label with for/id and the helper text with aria-describedby.', '<label for="password">Password</label>\n<input id="password" type="password" autocomplete="new-password" aria-describedby="password-help" />\n<p id="password-help">At least 8 characters</p>'),
]);

export const designFoundations = courseModule('b1', 'beginner', 'Design foundations', [whatIsADesignSystem, hierarchyAndLayout, colourBasics, typography]);
export const buildingBlocks = courseModule('b2', 'beginner', 'Core building blocks', [spacingAndSizing, surfacesAndIcons, basicComponents]);
