import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Problem } from '../models/Problem.js';
import { slugify } from '../utils/slugify.js';
import { logger } from '../utils/logger.js';
import { authoredProblemSchema } from '../validators/problemAuthoring.validator.js';
import { applyHarnessGeneration, argsToStdin, valueToExpectedOutput } from '../services/harnessGenerator.service.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Default: server/content/problems/*.json (one file per problem, or a
// single file containing a JSON array — both are supported). Override with:
//   node src/scripts/importProblems.js path/to/other/folder
const CONTENT_DIR = process.argv[2] || path.join(__dirname, '../../content/problems');

function loadProblemSpecs(dir) {
  if (!fs.existsSync(dir)) {
    logger.error(`Content directory not found: ${dir}`);
    process.exit(1);
  }
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
  const specs = [];
  for (const file of files) {
    const raw = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf-8'));
    if (Array.isArray(raw)) {
      raw.forEach((item, i) => specs.push({ source: `${file}[${i}]`, data: item }));
    } else {
      specs.push({ source: file, data: raw });
    }
  }
  return specs;
}

// Converts the human-friendly {args, expected} test cases into the
// {stdin, expectedOutput} strings Judge0 actually needs — using exactly
// the same JSON formatting the generated drivers produce, so grading is
// consistent regardless of which language a learner submits in.
function convertTestCases(testCases) {
  return testCases.map((tc) => ({
    stdin: argsToStdin(tc.args),
    expectedOutput: valueToExpectedOutput(tc.expected),
    isSample: tc.isSample ?? false,
  }));
}

async function main() {
  await connectDB();

  const admin = await User.findOne({ role: 'admin' });
  if (!admin) {
    logger.error('No admin user found — run `npm run seed` first (or create an admin manually).');
    process.exit(1);
  }

  const specs = loadProblemSpecs(CONTENT_DIR);
  logger.info(`Found ${specs.length} problem spec(s) in ${CONTENT_DIR}`);

  let created = 0;
  let updated = 0;
  let failed = 0;

  for (const { source, data } of specs) {
    const parsed = authoredProblemSchema.safeParse(data);
    if (!parsed.success) {
      failed++;
      logger.error(`✗ ${source} — validation failed:`, parsed.error.flatten().fieldErrors);
      continue;
    }

    const spec = parsed.data;
    const slug = slugify(spec.title);

    try {
      const payload = applyHarnessGeneration({
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
        testCases: convertTestCases(spec.testCases),
        isPublished: spec.isPublished,
      });

      const existing = await Problem.findOne({ slug });
      if (existing) {
        await Problem.updateOne({ _id: existing._id }, { $set: payload });
        updated++;
        logger.info(`↻ ${source} — updated "${spec.title}"`);
      } else {
        await Problem.create({ ...payload, slug, createdBy: admin._id });
        created++;
        logger.info(`✓ ${source} — created "${spec.title}"`);
      }
    } catch (err) {
      failed++;
      logger.error(`✗ ${source} — ${err.message}`);
    }
  }

  logger.info(`\nDone. Created: ${created}, Updated: ${updated}, Failed: ${failed}, Total: ${specs.length}`);
  await disconnectDB();
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Import failed', err);
  process.exit(1);
});
