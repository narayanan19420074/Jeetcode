import { COLOR_PALETTE } from '../../../../app/design/designTokens';
import { bigOFoundations } from './bigOFoundations';
import { bigOReadingCode } from './bigOReadingCode';
import { bigOAnalysis } from './bigOAnalysis';
import { bigODataStructures } from './bigODataStructures';
import { bigOSorting } from './bigOSorting';
import { bigOAdvanced } from './bigOAdvanced';
import { bigOPractice } from './bigOPractice';

// Lesson order follows how algorithm analysis is taught in university courses and in the standard references
// (CLRS, Sedgewick and the MIT 6.006 notes): growth rates and counting first, then the cost of common data structures and
// sorting, then amortized analysis, recurrences and practical optimisation. All text is original to JeetCode.
export const BIG_O_COURSE = {
  slug: 'big-o-notation',
  name: 'Big O Notation',
  section: 'computer-science',
  accent: COLOR_PALETTE.teal[600],
  level: 'Beginner to Advanced',
  blurb: 'Time and space complexity, from counting loops to the Master theorem.',
  desc: 'Learn how to measure and compare algorithms. Start with growth rates and simple loops, move on to the cost of lists, dictionaries, trees and sorting, then finish with amortized analysis, recurrences and ways to make slow code fast. Topics are grouped into Beginner, Intermediate and Advanced, with exercises beside every lesson. Your progress is saved on this device.',
  modules: [
    bigOFoundations, bigOReadingCode,
    bigOAnalysis, bigODataStructures, bigOSorting,
    bigOAdvanced, bigOPractice,
  ],
};
