// Tags problems with a named curated sheet, e.g. the Striver SDE sheet.
//
//   node src/scripts/tagProblemSheet.js striver-sde
//
// Reads content/sheets/<name>.txt (one problem title per line, "A | B" = alternative titles,
// "#" lines are comments), matches titles to the Problem collection (ignoring case and
// punctuation), sets problem.sheets to include <name>, and removes the tag from problems
// that are no longer in the file. Safe to run again. Prints the titles we do not have yet,
// which is the to-do list for authoring the missing problems.
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { Problem } from '../models/Problem.js';

const sheet = process.argv[2];
if (!sheet || !/^[a-z0-9-]+$/.test(sheet)) {
  console.error('Usage: node src/scripts/tagProblemSheet.js <sheet-name>   (e.g. striver-sde)');
  process.exit(1);
}

const file = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'content', 'sheets', `${sheet}.txt`);
if (!fs.existsSync(file)) {
  console.error(`No such sheet file: ${file}`);
  process.exit(1);
}

const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');
const lines = fs
  .readFileSync(file, 'utf8')
  .split('\n')
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith('#'));

async function run() {
  await connectDB();
  const problems = await Problem.find({}).select('_id title').lean();
  const byTitle = new Map(problems.map((p) => [norm(p.title), p]));

  const matched = new Map(); // id -> title
  const missing = [];
  for (const line of lines) {
    const hit = line
      .split('|')
      .map((t) => byTitle.get(norm(t.trim())))
      .find(Boolean);
    if (hit) matched.set(String(hit._id), hit.title);
    else missing.push(line);
  }

  const ids = [...matched.keys()];
  const added = await Problem.updateMany({ _id: { $in: ids } }, { $addToSet: { sheets: sheet } });
  const removed = await Problem.updateMany({ _id: { $nin: ids }, sheets: sheet }, { $pull: { sheets: sheet } });

  console.log(`Sheet "${sheet}": ${lines.length} titles in file, ${ids.length} matched problems (${added.modifiedCount} newly tagged, ${removed.modifiedCount} untagged).`);
  console.log(`\nNot in the database yet (${missing.length}):`);
  missing.forEach((t) => console.log(`  - ${t}`));

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Tagging failed:', err);
  process.exit(1);
});
