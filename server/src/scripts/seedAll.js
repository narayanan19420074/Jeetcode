// One entry point that seeds ALL content: coding problems, the Striver sheet tags, the aptitude
// question bank and the TCS NQT prep track.
//
//   npm run seed:all                 # seed only if content changed since the last successful run
//   npm run seed:all -- --force      # seed again no matter what
//   npm run seed:all -- --check      # validate every content file, touch nothing (no DB needed)
//
// The server also calls runSeedAll() a few seconds after it starts (see server.js), so on a host
// without a shell (Render free) every deploy that changes server/content/ seeds itself.
// Every step is idempotent, so running it twice is harmless.
import 'dotenv/config';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { logger } from '../utils/logger.js';

const SERVER_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const CONTENT = path.join(SERVER_DIR, 'content');
const SEED_VERSION = 'v1'; // bump to force one re-seed on the next deploy

// fatal: false = a failure is logged but the remaining steps still run.
const STEPS = [
  { name: 'base problems', file: 'src/scripts/seedProblems.js', fatal: false },
  { name: 'coding problems', file: 'src/scripts/importProblems.js', fatal: false },
  { name: 'aptitude questions', file: 'scripts/seedAptitude.js', fatal: true },
  { name: 'Striver sheet tags', file: 'src/scripts/tagProblemSheet.js', args: ['striver-sde'], fatal: false },
  { name: 'TCS NQT prep track', file: 'src/scripts/seedTcsNqt.js', fatal: true },
];

// Fingerprint of everything the seeds read. Working files (_chunks, _taxonomy) are skipped.
function contentHash() {
  const h = crypto.createHash('sha1').update(SEED_VERSION);
  const add = (dir, filter) => {
    if (!fs.existsSync(dir)) return;
    for (const f of fs.readdirSync(dir).sort()) {
      if (!filter(f)) continue;
      const p = path.join(dir, f);
      if (fs.statSync(p).isFile()) h.update(f).update(fs.readFileSync(p));
    }
  };
  add(path.join(CONTENT, 'problems'), (f) => f.endsWith('.json'));
  add(path.join(CONTENT, 'aptitude'), (f) => f.endsWith('.json') && !f.startsWith('_'));
  add(path.join(CONTENT, 'sheets'), (f) => f.endsWith('.txt'));
  for (const s of STEPS) h.update(fs.readFileSync(path.join(SERVER_DIR, s.file)));
  return h.digest('hex');
}

function runStep(step, env) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [step.file, ...(step.args || [])], { cwd: SERVER_DIR, env, stdio: 'inherit' });
    child.on('error', (err) => {
      logger.error(`seed step "${step.name}" could not start: ${err.message}`);
      resolve(false);
    });
    child.on('close', (code) => resolve(code === 0));
  });
}

// Assumes mongoose is already connected. Returns { ran, ok }.
export async function runSeedAll({ force = false } = {}) {
  const meta = mongoose.connection.db.collection('seed_meta');
  const hash = contentHash();
  const last = await meta.findOne({ _id: 'content' });
  if (!force && last?.hash === hash) {
    logger.info('Seed: content unchanged since the last successful seed, skipping.');
    return { ran: false, ok: true };
  }

  // Seeding needs an existing admin (createdBy). Never create a default-password admin on a live server.
  const admin = process.env.SEED_ADMIN_USER_ID
    ? { _id: process.env.SEED_ADMIN_USER_ID }
    : await User.findOne({ role: 'admin' }).sort({ createdAt: 1 }).select('_id').lean();
  if (!admin) {
    logger.warn('Seed: no admin user yet. Sign in once, promote yourself to admin, then restart. Skipping.');
    return { ran: false, ok: false };
  }

  logger.info('Seed: content changed, seeding now. This takes a minute or two.');
  const env = { ...process.env, SEED_ADMIN_USER_ID: String(admin._id) };
  let ok = true;
  for (const step of STEPS) {
    logger.info(`Seed: ${step.name}...`);
    const passed = await runStep(step, env);
    if (!passed) {
      logger.error(`Seed: "${step.name}" had errors.`);
      if (step.fatal) ok = false;
    }
  }

  if (ok) await meta.updateOne({ _id: 'content' }, { $set: { hash, seededAt: new Date() } }, { upsert: true });
  logger.info(ok ? 'Seed: finished.' : 'Seed: finished with errors, will retry on the next start.');
  return { ran: true, ok };
}

// Server hook: runs in the background after the server is listening.
export function autoSeedOnBoot() {
  const flag = String(process.env.AUTO_SEED ?? '').toLowerCase();
  const enabled = flag ? flag === 'true' || flag === '1' : process.env.NODE_ENV === 'production';
  if (!enabled) return;
  setTimeout(() => {
    runSeedAll().catch((err) => logger.error(`Seed failed: ${err.message}`));
  }, 15000).unref();
}

// CLI
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { connectDB, disconnectDB } = await import('../config/db.js');
  await connectDB();
  const { ok } = await runSeedAll({ force: process.argv.includes('--force') });
  await disconnectDB();
  process.exit(ok ? 0 : 1);
}
