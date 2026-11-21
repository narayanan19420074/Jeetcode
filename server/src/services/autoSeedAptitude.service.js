import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { logger } from '../utils/logger.js';

const SERVER_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const CONTENT_DIR = path.join(SERVER_DIR, 'content', 'aptitude');
const SEED_SCRIPT = path.join(SERVER_DIR, 'scripts', 'seedAptitude.js');
const SEED_VERSION = 'v1'; // bump to force one re-seed on the next deploy

// Fingerprint of everything the aptitude seed reads (working files starting with "_" are skipped).
export function aptitudeContentHash() {
  const h = crypto.createHash('sha1').update(SEED_VERSION).update(fs.readFileSync(SEED_SCRIPT));
  for (const f of fs.readdirSync(CONTENT_DIR).filter((n) => n.endsWith('.json') && !n.startsWith('_')).sort()) {
    h.update(f).update(fs.readFileSync(path.join(CONTENT_DIR, f)));
  }
  return h.digest('hex');
}

function runSeedScript(adminId) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [SEED_SCRIPT], {
      cwd: SERVER_DIR,
      env: { ...process.env, SEED_ADMIN_USER_ID: String(adminId) },
      stdio: 'inherit',
    });
    child.on('error', (err) => {
      logger.error(`Aptitude seed could not start: ${err.message}`);
      resolve(false);
    });
    child.on('close', (code) => resolve(code === 0));
  });
}

// Seeds server/content/aptitude/*.json into the DB, but only when those files changed since the
// last successful run. The seed runs in a child process, so a failure cannot take the API down.
// Idempotent and progress-preserving (see scripts/seedAptitude.js). Disable with AUTO_SEED=false.
export async function autoSeedAptitude() {
  const flag = String(process.env.AUTO_SEED ?? '').toLowerCase();
  const enabled = flag ? flag === 'true' || flag === '1' : process.env.NODE_ENV === 'production';
  if (!enabled || !fs.existsSync(CONTENT_DIR)) return;

  const meta = mongoose.connection.db.collection('seed_meta');
  const hash = aptitudeContentHash();
  const last = await meta.findOne({ _id: 'aptitude' });
  if (last?.hash === hash) {
    logger.info('Aptitude seed: content unchanged since the last successful seed, skipping.');
    return;
  }

  const admin = await User.findOne({ role: 'admin' }).sort({ createdAt: 1 }).select('_id').lean();
  if (!admin) {
    logger.warn('Aptitude seed skipped: no admin user yet. Promote yourself to admin, then restart.');
    return;
  }

  logger.info('Aptitude seed: content changed, seeding now. This takes a minute or two.');
  const ok = await runSeedScript(admin._id);
  if (ok) await meta.updateOne({ _id: 'aptitude' }, { $set: { hash, seededAt: new Date() } }, { upsert: true });
  logger.info(ok ? 'Aptitude seed: finished.' : 'Aptitude seed: finished with errors, will retry on the next start.');
}
