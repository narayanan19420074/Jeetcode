import { COLOR_PALETTE } from '../../../../app/design/designTokens';
import { cssBasicsModule, elementsModule } from './cssBasics';
import { layoutModule, responsiveModule } from './cssLayout';
import { pagePartsModule } from './cssPageParts';
import { polishModule } from './cssPolish';

// Lesson order: how CSS works, then the design names of the everyday elements (borders, buttons, cards), then layout and
// the page parts (navbar, main area, sidebar, footer), then responsive design, scrollbars, motion, themes and modern
// features. It follows the common path of MDN Learn Web Development and the web.dev Learn CSS course. All text is original to JeetCode.
export const CSS_COURSE = {
  slug: 'css',
  name: 'CSS Design Elements',
  section: 'web',
  accent: COLOR_PALETTE.orange[600],
  level: 'Beginner to Advanced',
  blurb: 'Button, card, navbar, sidebar, footer, scrollbar: every design name with its CSS.',
  desc: 'Learn CSS by building the parts of a real interface. For every element (border-bottom, button, card, navbar, main area, sidebar, footer, scrollbar) you get its design names, such as pill, ghost, elevated, sticky or icon rail, with the CSS for each. Topics are grouped into Beginner, Intermediate and Advanced, with exercises beside every lesson. Your progress is saved on this device.',
  modules: [cssBasicsModule, elementsModule, layoutModule, pagePartsModule, responsiveModule, polishModule],
};
