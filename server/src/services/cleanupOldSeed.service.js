import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Problem } from '../models/Problem.js';
import { Submission } from '../models/Submission.js';
import { User } from '../models/User.js';
import { logger } from '../utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TITLES_FILE = path.join(__dirname, '../../content/cleanup/old-seed-titles.json');

// One-time cleanup of the old templated 4000-problem seed.
// Opt-in via Render env CLEANUP_OLD_SEED:
//   "dry"  -> only logs how many would be deleted
//   "true" -> deletes them (plus their submissions / solved / bookmark refs)
// Safety guard: a problem is only removed if its title is in the old list AND
// its functionName ends with a number (all old-seed ones do; hand-made ones don't).
// Remove the env var after the logs show the result.
export async function cleanupOldSeed() {
  const mode = process.env.CLEANUP_OLD_SEED;
  if (mode !== 'dry' && mode !== 'true') return;
  if (!fs.existsSync(TITLES_FILE)) {
    logger.warn('Cleanup skipped: old-seed-titles.json missing.');
    return;
  }

  const titles = JSON.parse(fs.readFileSync(TITLES_FILE, 'utf-8'));
  const docs = await Problem.find({ title: { $in: titles }, functionName: /\d+$/ }).select('_id').lean();
  const ids = docs.map((d) => d._id);
  logger.info(`Cleanup: ${ids.length} old-seed problems found (mode=${mode}).`);
  if (mode === 'dry' || ids.length === 0) return;

  const subs = await Submission.deleteMany({ problem: { $in: ids } });
  const users = await User.updateMany(
    { $or: [{ solvedProblems: { $in: ids } }, { bookmarks: { $in: ids } }] },
    { $pull: { solvedProblems: { $in: ids }, bookmarks: { $in: ids } } }
  );
  const probs = await Problem.deleteMany({ _id: { $in: ids } });
  logger.info(
    `Cleanup done: problems ${probs.deletedCount}, submissions ${subs.deletedCount}, users updated ${users.modifiedCount}. Now remove CLEANUP_OLD_SEED from Render env.`
  );
}
