import { COLOR_PALETTE } from '../../../../app/design/designTokens';
import { buildingBlocks, designFoundations } from './designBasics';
import { accessibilityModule, componentsModule, tokensModule } from './designSystemCore';
import { engineeringModule, scalingModule } from './designSystemScale';

// Lesson order follows how design systems are learned and built in practice: visual foundations first, then tokens,
// components and accessibility, then documentation, governance and engineering. It draws on widely used references
// (Atomic Design, Material Design, WCAG 2.2, the Design Tokens Community Group). All text is original to JeetCode.
export const DESIGN_SYSTEM_COURSE = {
  slug: 'design-systems',
  name: 'Design Systems',
  section: 'design',
  accent: COLOR_PALETTE.violet[600],
  level: 'Beginner to Advanced',
  blurb: 'Tokens, components, accessibility and how to scale them.',
  desc: 'Learn how teams design and build a design system, from colour, type and spacing to tokens, accessible components, documentation and code. Topics are grouped into Beginner, Intermediate and Advanced, with exercises beside every lesson. Your progress is saved on this device.',
  modules: [designFoundations, buildingBlocks, tokensModule, componentsModule, accessibilityModule, scalingModule, engineeringModule],
};
