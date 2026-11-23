import { COLOR_PALETTE } from '../../../../app/design/designTokens';
import { gettingStarted } from './beginnerStart';
import { makingDecisions, repeatingCode } from './beginnerFlow';
import { collectionsModule, functionsModule } from './beginnerBuild';
import { modulesAndFiles, robustCode } from './intermediateCore';
import { idiomaticPython, textPatterns } from './intermediateIdioms';
import { objectOrientedPython } from './advancedObjects';
import { advancedFunctions, professionalPython } from './advancedTools';

// Lesson order follows the path that the most popular beginner courses share (Harvard CS50P, the official Python
// Tutorial and freeCodeCamp): syntax and control flow, then functions and collections, then files, testing and
// libraries, then object-oriented programming and the advanced language features. All text is original to JeetCode.
export const PYTHON_COURSE = {
  slug: 'python',
  name: 'Python Programming',
  section: 'programming',
  accent: COLOR_PALETTE.blue[600],
  level: 'Beginner to Advanced',
  blurb: 'From your first line of code to decorators and asyncio.',
  desc: 'A complete Python course in the order most learners need it. Read each lesson, then solve its exercises in the side panel. Topics are grouped into Beginner, Intermediate and Advanced, and your progress is saved on this device.',
  modules: [
    gettingStarted, makingDecisions, repeatingCode, functionsModule, collectionsModule,
    robustCode, modulesAndFiles, idiomaticPython, textPatterns,
    objectOrientedPython, advancedFunctions, professionalPython,
  ],
};
