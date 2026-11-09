// Averages — comprehensive placement-prep lesson set.
// 16 lessons covering every question archetype asked in campus placement
// and competitive exams. Each lesson: pattern → formula → worked examples
// → common trap → 2 checks (quick + challenge). Visual is a math-focused
// SVG (number line, bar chart, timeline) driven by step advance.
//
// The sections and practice banks live in ./averages (one file per section)
// so this entry stays small; the exported shape is unchanged for importers.
import { foundationsSection } from './averages/foundationsSection';
import { seriesTricksSection } from './averages/seriesTricksSection';
import { groupChangesSection } from './averages/groupChangesSection';
import { specialTopicsSection } from './averages/specialTopicsSection';
import { examPatternsSection } from './averages/examPatternsSection';
import { practiceQuestions, practiceBank } from './averages/practice';

export const averagesTopic = {
  slug: 'averages',
  title: 'Averages',
  tagline:
    '3 to 5 questions from Averages appear in every placement paper. This module covers all 16 question archetypes exam setters use — with formulas, worked examples, traps, and challenge questions built in.',

  // Order matters: it is the order lessons are taught to the learner.
  sections: [
    foundationsSection,
    seriesTricksSection,
    groupChangesSection,
    specialTopicsSection,
    examPatternsSection,
  ],

  // Practice contract for AptitudePracticePage/AptitudeTestPage — unchanged.
  practiceQuestions,
  practiceBank,
};
