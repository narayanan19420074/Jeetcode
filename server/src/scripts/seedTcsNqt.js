// Run with: npm run seed:tcs-nqt  (add this script to package.json — see
// WIRING_INSTRUCTIONS.md). Follows the same pattern as seedProblems.js:
// connect, upsert content, disconnect.
import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { PrepSection } from '../models/PrepSection.js';
import { PrepCompany } from '../models/PrepCompany.js';

const ADMIN_USER_ID = process.env.SEED_ADMIN_USER_ID;

// Weights sum to 100 across the 6 sections, split roughly by how much
// each stage actually matters for clearing TCS NQT (coding weighted
// heaviest since it's the harder bar to clear, not just a smaller
// section split evenly).
const SECTIONS = [
  {
    name: 'Numerical Ability',
    slug: 'numerical-ability',
    description: 'Speed math, percentages, ratios — the fastest section to lose easy marks on if unpracticed.',
    contentType: 'external-only',
    externalResources: [
      { label: 'IndiaBix — Quantitative Aptitude', url: 'https://www.indiabix.com/aptitude/questions-and-answers/' },
    ],
  },
  {
    name: 'Reasoning Ability',
    slug: 'reasoning-ability',
    description: 'Logical sequences, blood relations, syllogisms, coding-decoding.',
    contentType: 'external-only',
    externalResources: [
      { label: 'IndiaBix — Logical Reasoning', url: 'https://www.indiabix.com/logical-reasoning/questions-and-answers/' },
    ],
  },
  {
    name: 'Verbal Ability',
    slug: 'verbal-ability',
    description: 'Reading comprehension, grammar, sentence correction, vocabulary.',
    contentType: 'external-only',
    externalResources: [
      { label: 'GeeksforGeeks — Verbal Ability', url: 'https://www.geeksforgeeks.org/verbal-ability-questions-and-answers/' },
    ],
  },
  {
    name: 'Quantitative Aptitude Patterns',
    slug: 'quant-aptitude-patterns',
    description: 'The 20-pattern internal Aptitude practice set — aim for 600+ solved across patterns.',
    contentType: 'aptitude-pattern',
    aptitudePatternSlug: null, // links to the whole /aptitude section, not one pattern
    recommendedTarget: 600,
  },
  {
    name: 'Advanced Coding I',
    slug: 'advanced-coding-1',
    description: 'Company-tagged TCS problems — the first coding round.',
    contentType: 'problem-filter',
    problemFilter: { companies: ['TCS'] },
    recommendedTarget: 300,
  },
  {
    name: 'Advanced Coding II',
    slug: 'advanced-coding-2',
    description: 'Harder company-tagged TCS problems — the second, tougher coding round.',
    contentType: 'problem-filter',
    problemFilter: { companies: ['TCS'], difficulty: 'Hard' },
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

  const company = await PrepCompany.findOneAndUpdate(
    { slug: 'tcs-nqt' },
    {
      $set: {
        name: 'TCS NQT',
        slug: 'tcs-nqt',
        examDurationMinutes: 220,
        description: 'TCS National Qualifier Test — Numerical, Reasoning, Verbal, Aptitude, and two Advanced Coding rounds.',
        createdBy: ADMIN_USER_ID,
        isPublished: true,
        sections: [
          { section: sectionIdBySlug['numerical-ability'], order: 1, minutes: 20, questionCount: 20, weight: 15 },
          { section: sectionIdBySlug['reasoning-ability'], order: 2, minutes: 20, questionCount: 20, weight: 15 },
          { section: sectionIdBySlug['verbal-ability'], order: 3, minutes: 20, questionCount: 20, weight: 15 },
          { section: sectionIdBySlug['quant-aptitude-patterns'], order: 4, minutes: 15, questionCount: 15, weight: 15 },
          { section: sectionIdBySlug['advanced-coding-1'], order: 5, minutes: 45, questionCount: 1, weight: 20 },
          { section: sectionIdBySlug['advanced-coding-2'], order: 6, minutes: 45, questionCount: 1, weight: 20 },
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
