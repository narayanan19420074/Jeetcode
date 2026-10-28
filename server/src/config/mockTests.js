// Mock-test blueprints. One place to tune a paper: change a number here and
// the hub, the exam screen and the grader all follow.
//
// Patterns follow the publicly reported 2026 formats (TCS NQT, Infosys,
// Cognizant GenC). Companies change patterns between drives, so the hub shows
// "based on the reported pattern" and links to the official site.
//
// section.slugs  = AptitudePattern slugs the questions are drawn from.
// section.minutes = SECTIONAL timer (real TCS iON / Infosys papers lock a
//                   section when its clock ends; unused time does not carry).
// No negative marking: TCS and Infosys both publish none.
//
// Verbal / Data Interpretation / pseudo-code content does not exist yet, so
// those sections are listed under `comingSoon` and are NOT part of the paper.

export const MOCK_MIX = { easy: 0.3, hard: 0.2 }; // medium = remainder
export const MOCK_FREE_ATTEMPTS_PER_PAPER = 1; // non-Pro users

const QUANT_CORE = [
  'percentages', 'profit-and-loss', 'ratio-and-proportion', 'time-and-work',
  'speed-time-and-distance', 'averages', 'number-system', 'simple-and-compound-interest',
  'probability', 'permutation-and-combination', 'problems-on-ages', 'mixtures-and-alligations',
];
const REASONING_CORE = ['number-series', 'letter-and-alphabet-series', 'coding-decoding', 'blood-relations', 'direction-sense'];

export const MOCK_PAPERS = [
  {
    id: 'tcs-nqt-foundation',
    company: 'TCS',
    title: 'TCS NQT · Foundation',
    short: 'Numerical + Reasoning',
    blurb: 'Part A of the NQT, the part Ninja shortlisting leans on. Two timed sections, no negative marking.',
    reported: 'Reported: 65 questions in 75 min (Numerical, Verbal, Reasoning)',
    officialUrl: 'https://www.tcsion.com/hub/national-qualifier-test',
    sections: [
      { key: 'numerical', title: 'Numerical Ability', questions: 20, minutes: 25, slugs: QUANT_CORE },
      { key: 'reasoning', title: 'Reasoning Ability', questions: 20, minutes: 25, slugs: REASONING_CORE },
    ],
    comingSoon: ['Verbal Ability'],
  },
  {
    id: 'infosys-aptitude',
    company: 'Infosys',
    title: 'Infosys · Aptitude',
    short: 'Maths + Reasoning',
    blurb: 'Sectional-timer aptitude round for Systems Engineer drives. Speed and elimination decide the score.',
    reported: 'Reported: about 100 min across 5 sections, sectional cut-offs',
    officialUrl: 'https://www.infosys.com/careers/',
    sections: [
      { key: 'maths', title: 'Mathematical Ability', questions: 10, minutes: 35, slugs: QUANT_CORE },
      { key: 'reasoning', title: 'Logical Reasoning', questions: 15, minutes: 25, slugs: REASONING_CORE },
    ],
    comingSoon: ['Verbal Ability', 'Pseudocode', 'Puzzle Solving'],
  },
  {
    id: 'cognizant-genc',
    company: 'Cognizant',
    title: 'Cognizant · GenC Aptitude',
    short: 'One mixed section',
    blurb: 'Short, fast aptitude screen: one clock, quant and reasoning mixed.',
    reported: 'Reported: 25 questions in 35 min',
    officialUrl: 'https://careers.cognizant.com',
    sections: [{ key: 'aptitude', title: 'Aptitude', questions: 25, minutes: 35, slugs: [...QUANT_CORE.slice(0, 8), ...REASONING_CORE] }],
    comingSoon: [],
  },
  {
    id: 'quant-sprint',
    company: 'Practice',
    title: 'Quant Sprint',
    short: '30 questions · 30 min',
    blurb: 'A general quant paper for any hiring test. Take it weekly and watch the weak topics shrink.',
    reported: 'JeetCode practice paper',
    officialUrl: null,
    sections: [{ key: 'quant', title: 'Quantitative Aptitude', questions: 30, minutes: 30, slugs: [...QUANT_CORE, 'mensuration', 'algebra', 'hcf-and-lcm'] }],
    comingSoon: [],
  },
];

export const PAPER_BY_ID = new Map(MOCK_PAPERS.map((p) => [p.id, p]));
export const paperMinutes = (p) => p.sections.reduce((s, x) => s + x.minutes, 0);
export const paperQuestions = (p) => p.sections.reduce((s, x) => s + x.questions, 0);
