import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

// Run with: node src/scripts/seedCommunityPosts.js [authorEmail] [--clean]
// Inserts the sample posts from content/community/seed-posts.json for UI testing.
// Author defaults to the first admin user. Safe to re-run: posts with an existing
// title by the same author are skipped. `--clean` deletes those sample posts instead.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import 'dotenv/config';
import { User } from '../models/User.js';
import { CommunityPost } from '../models/CommunityPost.js';
import { CommunityImage } from '../models/CommunityImage.js';
import { IMAGE_REFERENCE } from '../config/communityImages.js';
import { makeExcerpt } from '../services/community.service.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const clean = args.includes('--clean');
const email = args.find((a) => !a.startsWith('--'));

const posts = JSON.parse(fs.readFileSync(path.join(__dirname, '../../content/community/seed-posts.json'), 'utf-8'));

await mongoose.connect(process.env.MONGODB_URI);

const author = email
  ? await User.findOne({ email: email.toLowerCase() })
  : await User.findOne({ role: 'admin' });
if (!author) {
  console.error('No author found. Pass an email: node src/scripts/seedCommunityPosts.js you@example.com');
  await mongoose.disconnect();
  process.exit(1);
}

const IMAGE_DIR = path.join(__dirname, '../../content/community/images');

if (clean) {
  const old = await CommunityPost.find({ author: author._id, title: { $in: posts.map((p) => p.title) } }).select('body').lean();
  const imageIds = old.flatMap((p) => [...p.body.matchAll(IMAGE_REFERENCE)].map((m) => m[1]));
  if (imageIds.length) await CommunityImage.deleteMany({ _id: { $in: imageIds }, owner: author._id });
  const res = await CommunityPost.deleteMany({ author: author._id, title: { $in: posts.map((p) => p.title) } });
  console.log(`Deleted ${res.deletedCount} sample post(s) of ${author.email}`);
  await mongoose.disconnect();
  process.exit(0);
}

const DAY = 24 * 60 * 60 * 1000;
let created = 0;
let skipped = 0;
for (const [i, p] of posts.entries()) {
  if (await CommunityPost.exists({ author: author._id, title: p.title })) { skipped++; continue; }
  // Spread posts over the last ~10 days so ordering and "time ago" labels look real.
  const when = new Date(Date.now() - Math.round((i + 1) * 0.5 * DAY) - i * 37 * 60 * 1000);
  // Optional picture: stored like a normal upload, then referenced on its own line after the first paragraph.
  let body = p.body;
  let coverImage = '';
  if (p.image) {
    const bytes = fs.readFileSync(path.join(IMAGE_DIR, p.image));
    const img = await CommunityImage.create({ owner: author._id, contentType: 'image/png', data: bytes, size: bytes.length, attached: true });
    coverImage = String(img._id);
    const [first, ...rest] = body.split('\n\n');
    body = [first, `![${p.imageAlt || ''}](community-image:${coverImage})`, ...rest].join('\n\n');
  }
  const doc = new CommunityPost({
    author: author._id,
    isAnonymous: p.isAnonymous,
    category: p.category,
    title: p.title,
    body,
    excerpt: makeExcerpt(body),
    coverImage,
    score: p.score,
    viewCount: p.viewCount,
    createdAt: when,
    updatedAt: when,
    lastActivityAt: when,
  });
  await doc.save({ timestamps: false });
  created++;
}
console.log(`Author: ${author.email} | Created: ${created}, Skipped: ${skipped}`);
await mongoose.disconnect();
