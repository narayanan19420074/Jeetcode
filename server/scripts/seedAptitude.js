// server/scripts/seedAptitude.js
//
// Seeds AptitudePattern + AptitudeQuestion from content/aptitude/*.json.
// Same philosophy as the 302-problem content pipeline: validate everything
// through a real schema before it touches the DB, never trust the raw file.
//
// Usage (from server/):
//   node scripts/seedAptitude.js                # seed all files in content/aptitude/
//   node scripts/seedAptitude.js averages        # seed only content/aptitude/averages.json
//
// Idempotent: re-running upserts the pattern by slug and replaces that
// pattern's questions cleanly (delete + re-insert), so you can safely
// re-run after fixing a typo in a JSON file.

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { z } from 'zod';

import { AptitudePattern } from '../src/models/AptitudePattern.js';
import { AptitudeQuestion } from '../src/models/AptitudeQuestion.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = path.join(__dirname, '..', 'content', 'aptitude');

// --- Validation schemas -----------------------------------------------

const optionSchema = z.object({
  text: z.string().min(1),
});

const questionSchema = z.object({
  questionText: z.string().min(1),
  options: z.array(optionSchema).length(4, 'A question needs exactly 4 options'),
  correctOptionIndex: z.number().int().min(0).max(3),
  explanation: z.string().default(''),
  order: z.number().int(),
});

const patternSchema = z.object({
  title: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, 'slug must be lowercase-kebab-case'),
  description: z.string().default(''),
  order: z.number().int(),
  passPercentage: z.number().min(0).max(100).default(70),
  timeLimitMinutes: z.number().min(1).default(20),
});

const fileSchema = z.object({
  pattern: patternSchema,
  questions: z.array(questionSchema).min(1),
});

// --- Helpers -------------------------------------------------------------

function loadFiles(filterName) {
  const allFiles = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.json'));
  const files = filterName
    ? allFiles.filter((f) => path.basename(f, '.json') === filterName)
    : allFiles;

  if (files.length === 0) {
    throw new Error(
      filterName
        ? `No file found for "${filterName}" in ${CONTENT_DIR}`
        : `No .json files found in ${CONTENT_DIR}`
    );
  }
  return files;
}

function validateFile(fileName, raw) {
  const parsed = fileSchema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`${fileName} failed validation:\n${issues}`);
  }

  // Extra cross-field checks the zod shape alone can't express:
  const { questions } = parsed.data;

  // order values should be unique within the pattern (not required by DB,
  // but a duplicate almost always means a copy-paste mistake).
  const orders = questions.map((q) => q.order);
  const dupOrders = orders.filter((o, i) => orders.indexOf(o) !== i);
  if (dupOrders.length > 0) {
    throw new Error(`${fileName}: duplicate question order values: ${[...new Set(dupOrders)].join(', ')}`);
  }

  // exact duplicate questionText within the same pattern is almost always
  // an accidental double-paste from bulk generation.
  const texts = questions.map((q) => q.questionText.trim());
  const dupTexts = texts.filter((t, i) => texts.indexOf(t) !== i);
  if (dupTexts.length > 0) {
    throw new Error(`${fileName}: duplicate questionText found (first 60 chars): "${dupTexts[0].slice(0, 60)}..."`);
  }

  return parsed.data;
}

async function seedOneFile(fileName, adminUserId) {
  const filePath = path.join(CONTENT_DIR, fileName);
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const { pattern: patternData, questions } = validateFile(fileName, raw);

  // Upsert the pattern by slug — safe to re-run.
  const pattern = await AptitudePattern.findOneAndUpdate(
    { slug: patternData.slug },
    { ...patternData, isPublished: true, createdBy: adminUserId },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // Replace this pattern's questions cleanly rather than trying to diff —
  // simpler and matches "re-run after fixing a typo" as the expected flow.
  const deleted = await AptitudeQuestion.deleteMany({ pattern: pattern._id });

  const docs = questions.map((q) => ({
    ...q,
    pattern: pattern._id,
    isPublished: true,
    createdBy: adminUserId,
  }));
  const inserted = await AptitudeQuestion.insertMany(docs);

  await AptitudePattern.findByIdAndUpdate(pattern._id, { totalQuestions: inserted.length });

  return {
    slug: pattern.slug,
    title: pattern.title,
    questionsInserted: inserted.length,
    questionsReplaced: deleted.deletedCount,
  };
}

// --- Main ------------------------------------------------------------

async function main() {
  const filterName = process.argv[2]; // optional: node seedAptitude.js averages

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI not set — check your .env (not .env.example)');
  }
  if (!process.env.SEED_ADMIN_USER_ID) {
    throw new Error(
      'SEED_ADMIN_USER_ID not set in .env — put an existing admin user\'s ObjectId here.\n' +
        '(createdBy is required on both AptitudePattern and AptitudeQuestion.)'
    );
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log(`Connected: ${process.env.MONGODB_URI}`);

  const files = loadFiles(filterName);
  console.log(`Seeding ${files.length} file(s): ${files.join(', ')}`);

  const results = [];
  for (const fileName of files) {
    try {
      const result = await seedOneFile(fileName, process.env.SEED_ADMIN_USER_ID);
      results.push(result);
      console.log(`  ✓ ${fileName} → pattern "${result.title}" (${result.slug}): ${result.questionsInserted} questions`);
    } catch (err) {
      console.error(`  ✗ ${fileName} FAILED: ${err.message}`);
      process.exitCode = 1;
    }
  }

  const totalPatterns = results.length;
  const totalQuestions = results.reduce((sum, r) => sum + r.questionsInserted, 0);
  console.log(`\nDone. ${totalPatterns} pattern(s), ${totalQuestions} question(s) seeded.`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Seed script crashed:', err);
  process.exit(1);
});
