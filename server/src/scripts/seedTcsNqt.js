// Run with: npm run seed:tcs-nqt  (add this script to package.json — see
// WIRING_INSTRUCTIONS.md). Follows the same pattern as seedProblems.js:
// connect, upsert content, disconnect.
import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { PrepSection } from '../models/PrepSection.js';
import { PrepCompany } from '../models/PrepCompany.js';

const ADMIN_USER_ID = process.env.SEED_ADMIN_USER_ID;

// TCS NQT 2026 pattern (190 min): Part A Foundation 75 min, Part B Advanced 115 min.
// Source: TCS's published pattern as summarised by FACE Prep / PrepInsta / Naukri Campus. Sources
// differ a little (Verbal 24-26 questions, Advanced Coding 2 or 3 problems), so check tcs.com or
// TCS iON before you trust a number. Weights sum to 100; coding is weighted heaviest because the
// Advanced section decides Digital / Prime.
const QUANT_PATTERNS = [
  'percentages', 'profit-and-loss', 'ratio-and-proportion', 'averages', 'simple-and-compound-interest',
  'time-and-work', 'pipes-and-cisterns', 'speed-time-and-distance', 'problems-on-trains', 'boats-and-streams',
  'races-and-circular-tracks', 'mixtures-and-alligations', 'partnership', 'problems-on-ages', 'chain-rule',
  'number-system', 'hcf-and-lcm', 'simplification-and-approximation', 'algebra', 'permutation-and-combination',
  'probability', 'geometry', 'mensuration', 'trigonometry', 'calendar-and-clock', 'stocks-and-shares',
  'true-and-bankers-discount',
];
const REASONING_PATTERNS = ['blood-relations', 'coding-decoding', 'direction-sense', 'letter-and-alphabet-series', 'number-series'];
const ADVANCED_QUANT_PATTERNS = [
  'algebra', 'permutation-and-combination', 'probability', 'number-system', 'simplification-and-approximation',
  'mixtures-and-alligations', 'time-and-work', 'profit-and-loss', 'simple-and-compound-interest', 'geometry',
];

const SECTIONS = [
  {
    name: 'Numerical Ability',
    slug: 'numerical-ability',
    description: 'Percentages, ratios, time and work, number system and more. All quantitative patterns, learn then practise each one.',
    contentType: 'aptitude-pattern',
    aptitudePatternSlug: null,
    aptitudePatternSlugs: QUANT_PATTERNS,
    aptitudeDifficulty: null,
    recommendedTarget: 300,
    externalResources: [{ label: 'IndiaBix: Quantitative Aptitude', url: 'https://www.indiabix.com/aptitude/questions-and-answers/' }],
  },
  {
    name: 'Verbal Ability',
    slug: 'verbal-ability',
    description: 'Reading comprehension, grammar, sentence correction, vocabulary. The biggest Foundation section by question count.',
    contentType: 'external-only',
    aptitudePatternSlugs: [],
    externalResources: [{ label: 'GeeksforGeeks: Verbal Ability', url: 'https://www.geeksforgeeks.org/verbal-ability-questions-and-answers/' }],
  },
  {
    name: 'Reasoning Ability',
    slug: 'reasoning-ability',
    description: 'Blood relations, coding-decoding, direction sense, series. Mostly formulaic once you can name the question type.',
    contentType: 'aptitude-pattern',
    aptitudePatternSlug: null,
    aptitudePatternSlugs: REASONING_PATTERNS,
    aptitudeDifficulty: null,
    recommendedTarget: 150,
    externalResources: [{ label: 'IndiaBix: Logical Reasoning', url: 'https://www.indiabix.com/logical-reasoning/questions-and-answers/' }],
  },
  {
    name: 'Advanced Quantitative Ability',
    slug: 'advanced-quantitative',
    description: 'Harder versions of the quant topics: algebra, permutations, probability, mixtures. Hard questions only. Shares one 25-minute block with Advanced Reasoning.',
    contentType: 'aptitude-pattern',
    aptitudePatternSlug: null,
    aptitudePatternSlugs: ADVANCED_QUANT_PATTERNS,
    aptitudeDifficulty: 'hard',
    recommendedTarget: 100,
  },
  {
    name: 'Advanced Reasoning Ability',
    slug: 'advanced-reasoning',
    description: 'Multi-step reasoning puzzles and series. Hard questions only, from the same block as Advanced Quantitative.',
    contentType: 'aptitude-pattern',
    aptitudePatternSlug: null,
    aptitudePatternSlugs: REASONING_PATTERNS,
    aptitudeDifficulty: 'hard',
    recommendedTarget: 60,
  },
  {
    name: 'Advanced Coding',
    slug: 'advanced-coding',
    description: 'The 90-minute coding round (2-3 problems, C / C++ / Java / Python). Practise the Striver SDE sheet problems.',
    contentType: 'problem-filter',
    problemFilter: { sheet: 'striver-sde' },
    recommendedTarget: 100,
  },
];

async function run() {
  if (!ADMIN_USER_ID) {
    console.error('SEED_ADMIN_USER_ID is not set in .env — cannot set createdBy on seeded docs.');
    process.exit(1);
  }

  await connectDB();

  const sectionIdBySlug = {};
  for (const s of SECTIONS) {
    const doc = await PrepSection.findOneAndUpdate(
      { slug: s.slug },
      { $set: { ...s, createdBy: ADMIN_USER_ID } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    sectionIdBySlug[s.slug] = doc._id;
    console.log(`Upserted PrepSection: ${doc.name}`);
  }

  const FOUNDATION = 'Part A · Foundation · 75 min';
  const ADVANCED = 'Part B · Advanced · 115 min';
  const company = await PrepCompany.findOneAndUpdate(
    { slug: 'tcs-nqt' },
    {
      $set: {
        name: 'TCS NQT',
        slug: 'tcs-nqt',
        examDurationMinutes: 190,
        // Next sitting. Update this line when TCS announces the next cycle, then run the seed again.
        examDate: new Date('2026-10-19T00:00:00+05:30'),
        description: 'TCS National Qualifier Test: Foundation (Numerical, Verbal, Reasoning) and Advanced (Quantitative and Reasoning, Coding).',
        createdBy: ADMIN_USER_ID,
        isPublished: true,
        sections: [
          { section: sectionIdBySlug['numerical-ability'], order: 1, minutes: 25, questionCount: 20, weight: 15, group: FOUNDATION },
          { section: sectionIdBySlug['verbal-ability'], order: 2, minutes: 25, questionCount: 25, weight: 15, group: FOUNDATION },
          { section: sectionIdBySlug['reasoning-ability'], order: 3, minutes: 25, questionCount: 20, weight: 15, group: FOUNDATION },
          { section: sectionIdBySlug['advanced-quantitative'], order: 4, minutes: 25, questionCount: 10, weight: 15, group: ADVANCED },
          { section: sectionIdBySlug['advanced-reasoning'], order: 5, minutes: null, questionCount: 5, weight: 10, group: ADVANCED },
          { section: sectionIdBySlug['advanced-coding'], order: 6, minutes: 90, questionCount: null, weight: 30, group: ADVANCED },
        ],
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log(`Upserted PrepCompany: ${company.name} (${company.sections.length} sections)`);

  await mongoose.disconnect();
  console.log('Done.');
}

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
