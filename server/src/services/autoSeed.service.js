import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { User } from '../models/User.js';
import { Problem } from '../models/Problem.js';
import { slugify } from '../utils/slugify.js';
import { logger } from '../utils/logger.js';
import { authoredProblemSchema } from '../validators/problemAuthoring.validator.js';
import { applyHarnessGeneration, argsToStdin, valueToExpectedOutput } from './harnessGenerator.service.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Every *.json in this folder (array or single object) is auto-seeded on boot.
const SEED_DIR = path.join(__dirname, '../../content/problems');
const BATCH = 200;

const tick = () => new Promise((resolve) => setImmediate(resolve));

function loadSpecs() {
  const specs = [];
  for (const file of fs.readdirSync(SEED_DIR).filter((f) => f.endsWith('.json'))) {
    const raw = JSON.parse(fs.readFileSync(path.join(SEED_DIR, file), 'utf-8'));
    (Array.isArray(raw) ? raw : [raw]).forEach((data, i) => specs.push({ source: `${file}[${i}]`, data }));
  }
  return specs;
}

// Insert-only + idempotent: problems whose slug already exists are skipped,
// so redeploys are fast (one slug query) and never overwrite live edits.
// Disable with AUTO_SEED_PROBLEMS=false in Render env.
export async function autoSeedProblems() {
  if (process.env.AUTO_SEED_PROBLEMS === 'false') return;
  if (!fs.existsSync(SEED_DIR)) return;

  const admin = await User.findOne({ role: 'admin' }).select('_id').lean();
  if (!admin) {
    logger.warn('Auto-seed skipped: no admin user yet (run `npm run seed` once, then redeploy).');
    return;
  }

  const specs = loadSpecs();
  const existing = new Set((await Problem.find({}, 'slug').lean()).map((p) => p.slug));
  const pending = [];
  let invalid = 0;

  for (const { source, data } of specs) {
    const parsed = authoredProblemSchema.safeParse(data);
    if (!parsed.success) {
      invalid++;
      logger.error(`Auto-seed: ${source} invalid`, parsed.error.flatten().fieldErrors);
      continue;
    }
    const spec = parsed.data;
    const slug = slugify(spec.title);
    if (existing.has(slug)) continue;
    existing.add(slug);
    pending.push({ spec, slug });
  }

  if (!pending.length) {
    logger.info(`Auto-seed: nothing new (${specs.length} specs already in DB).`);
    return;
  }
  logger.info(`Auto-seed: inserting ${pending.length} new problems...`);

  let inserted = 0;
  for (let i = 0; i < pending.length; i += BATCH) {
    const docs = pending.slice(i, i + BATCH).map(({ spec, slug }) => ({
      ...applyHarnessGeneration({
        title: spec.title,
        difficulty: spec.difficulty,
        tags: spec.tags,
        companies: spec.companies,
        description: spec.description,
        examples: spec.examples,
        constraints: spec.constraints,
        functionName: spec.functionName,
        params: spec.params,
        returnType: spec.returnType,
        starterCode: spec.starterCode,
        driverCode: spec.driverCode,
        testCases: spec.testCases.map((tc) => ({
          stdin: argsToStdin(tc.args),
          expectedOutput: valueToExpectedOutput(tc.expected),
          isSample: tc.isSample ?? false,
        })),
        isPublished: spec.isPublished,
      }),
      slug,
      createdBy: admin._id,
    }));
    try {
      const res = await Problem.insertMany(docs, { ordered: false });
      inserted += res.length;
    } catch (err) {
      inserted += err.insertedDocs?.length ?? 0;
      logger.error(`Auto-seed batch failed: ${err.message}`);
    }
    await tick(); // keep the API responsive while seeding
  }
  logger.info(`Auto-seed done. Inserted ${inserted}, invalid ${invalid}.`);
}
