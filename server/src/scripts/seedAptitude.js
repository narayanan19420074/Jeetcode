import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

// server/src/scripts/seedAptitude.js
//
// Seeds AptitudePattern + AptitudeQuestion (+ AptitudeSet) from
// content/aptitude/*.json. Same philosophy as the 302-problem content
// pipeline: validate everything through a real schema before it touches the
// DB, never trust the raw file.
//
// Usage (from server/):
//   node scripts/seedAptitude.js                # seed all topic files in content/aptitude/
//   node scripts/seedAptitude.js percentages    # seed only content/aptitude/percentages.json
//
// Idempotent AND progress-preserving: re-running upserts the pattern by slug
// and syncs its questions *in place* (matched by a hash of the question text),
// so learners' practice progress / bookmarks survive a re-seed. Questions that
// disappeared from the file are removed together with their progress rows.

import crypto from 'node:crypto';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { z } from 'zod';

import { AptitudePattern } from '../models/AptitudePattern.js';
import { AptitudeQuestion } from '../models/AptitudeQuestion.js';
import { AptitudeQuestionProgress } from '../models/AptitudeQuestionProgress.js';
import { AptitudeSet } from '../models/AptitudeSet.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = path.join(__dirname, '..', '..', 'content', 'aptitude');

// --- Validation schemas -----------------------------------------------

const optionSchema = z.object({
  text: z.string().min(1),
});

const slugRe = /^[a-z0-9-]+$/;

const questionSchema = z.object({
  questionText: z.string().min(1),
  options: z.array(optionSchema).length(4, 'A question needs exactly 4 options'),
  correctOptionIndex: z.number().int().min(0).max(3),
  explanation: z.string().default(''),
  order: z.number().int(),
  shortcut: z.string().default(''),
  subPattern: z.string().regex(slugRe).default(''),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  examStyles: z.array(z.string()).default([]),
  setId: z.string().nullish().transform((v) => v ?? null),
});

const subPatternSchema = z.object({
  slug: z.string().regex(slugRe),
  title: z.string().min(1),
});

const patternSchema = z.object({
  title: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(slugRe, 'slug must be lowercase-kebab-case'),
  description: z.string().default(''),
  category: z.string().default(''),
  order: z.number().int(),
  passPercentage: z.number().min(0).max(100).default(70),
  timeLimitMinutes: z.number().min(1).default(20),
  testQuestionCount: z.number().int().min(1).default(25),
  subPatterns: z.array(subPatternSchema).default([]),
});

const setSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['text', 'table', 'bar', 'line', 'pie']),
  title: z.string().default(''),
  text: z.string().default(''),
  table: z.object({ columns: z.array(z.any()), rows: z.array(z.array(z.any())) }).nullish(),
  chart: z.any().nullish(),
});

const fileSchema = z.object({
  pattern: patternSchema,
  sets: z.array(setSchema).default([]),
  questions: z.array(questionSchema).min(1),
});

// --- Helpers -------------------------------------------------------------

const contentKey = (text) =>
  crypto.createHash('sha1').update(String(text).replace(/\s+/g, ' ').trim().toLowerCase()).digest('hex');

function loadFiles(filterName) {
  // Files starting with "_" are working files (taxonomy, brief, chunks).
  const allFiles = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.json') && !f.startsWith('_'));
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
  const { questions, pattern, sets } = parsed.data;

  // order values should be unique within the pattern (not required by DB,
  // but a duplicate almost always means a copy-paste mistake).
  const orders = questions.map((q) => q.order);
  const dupOrders = orders.filter((o, i) => orders.indexOf(o) !== i);
  if (dupOrders.length > 0) {
    throw new Error(`${fileName}: duplicate question order values: ${[...new Set(dupOrders)].join(', ')}`);
  }

  // exact duplicate questionText within the same pattern is almost always
  // an accidental double-paste from bulk generation (and would collide on
  // the content key that keeps learner progress attached).
  const texts = questions.map((q) => q.questionText.trim());
  const dupTexts = texts.filter((t, i) => texts.indexOf(t) !== i);
  if (dupTexts.length > 0) {
    throw new Error(`${fileName}: duplicate questionText found (first 60 chars): "${dupTexts[0].slice(0, 60)}..."`);
  }

  // Every sub-pattern / set a question points at must exist.
  const subSlugs = new Set(pattern.subPatterns.map((s) => s.slug));
  if (subSlugs.size > 0) {
    const bad = questions.find((q) => q.subPattern && !subSlugs.has(q.subPattern));
    if (bad) throw new Error(`${fileName}: unknown subPattern "${bad.subPattern}"`);
  }
  const setIds = new Set(sets.map((s) => s.id));
  const badSet = questions.find((q) => q.setId && !setIds.has(q.setId));
  if (badSet) throw new Error(`${fileName}: question references unknown setId "${badSet.setId}"`);

  return parsed.data;
}

async function seedOneFile(fileName, adminUserId) {
  const filePath = path.join(CONTENT_DIR, fileName);
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const { pattern: patternData, sets, questions } = validateFile(fileName, raw);

  // Upsert the pattern by slug — safe to re-run.
  const pattern = await AptitudePattern.findOneAndUpdate(
    { slug: patternData.slug },
    { ...patternData, isPublished: true, createdBy: adminUserId },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // Shared stimuli: small, so replace wholesale.
  await AptitudeSet.deleteMany({ pattern: pattern._id });
  if (sets.length > 0) {
    await AptitudeSet.insertMany(
      sets.map((s) => ({
        pattern: pattern._id,
        setId: s.id,
        type: s.type,
        title: s.title,
        text: s.text,
        table: s.table ?? null,
        chart: s.chart ?? null,
      }))
    );
  }

  // Sync questions in place, keyed by content hash.
  const existing = await AptitudeQuestion.find({ pattern: pattern._id }).select('_id questionText contentKey').lean();
  const existingByKey = new Map(existing.map((q) => [q.contentKey || contentKey(q.questionText), q]));
  const keepIds = new Set();
  let inserted = 0;
  let updated = 0;
  const ops = [];

  for (const q of questions) {
    const key = contentKey(q.questionText);
    const fields = { ...q, contentKey: key, pattern: pattern._id, isPublished: true };
    const hit = existingByKey.get(key);
    if (hit) {
      keepIds.add(String(hit._id));
      updated += 1;
      ops.push({ updateOne: { filter: { _id: hit._id }, update: { $set: fields } } });
    } else {
      inserted += 1;
      ops.push({ insertOne: { document: { ...fields, createdBy: adminUserId, attemptsCount: 0, correctCount: 0 } } });
    }
  }
  if (ops.length > 0) await AptitudeQuestion.bulkWrite(ops, { ordered: false });

  const staleIds = existing.filter((q) => !keepIds.has(String(q._id))).map((q) => q._id);
  if (staleIds.length > 0) {
    await AptitudeQuestion.deleteMany({ _id: { $in: staleIds } });
    await AptitudeQuestionProgress.deleteMany({ question: { $in: staleIds } });
  }

  await AptitudePattern.findByIdAndUpdate(pattern._id, { totalQuestions: questions.length });

  return {
    slug: pattern.slug,
    title: pattern.title,
    questionsInserted: inserted,
    questionsUpdated: updated,
    questionsRemoved: staleIds.length,
    sets: sets.length,
  };
}

// --- Main ------------------------------------------------------------

async function main() {
  const filterName = process.argv[2]; // optional: node seedAptitude.js percentages

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
  console.log('Connected to MongoDB');

  const files = loadFiles(filterName);
  console.log(`Seeding ${files.length} file(s): ${files.join(', ')}`);

  const results = [];
  for (const fileName of files) {
    try {
      const result = await seedOneFile(fileName, process.env.SEED_ADMIN_USER_ID);
      results.push(result);
      console.log(
        `  ✓ ${fileName} → "${result.title}" (${result.slug}): +${result.questionsInserted} new, ` +
          `${result.questionsUpdated} updated, ${result.questionsRemoved} removed, ${result.sets} sets`
      );
    } catch (err) {
      console.error(`  ✗ ${fileName} FAILED: ${err.message}`);
      process.exitCode = 1;
    }
  }

  const totalQuestions = results.reduce((sum, r) => sum + r.questionsInserted + r.questionsUpdated, 0);
  console.log(`\nDone. ${results.length} pattern(s), ${totalQuestions} question(s) in sync.`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Seed script crashed:', err);
  process.exit(1);
});
