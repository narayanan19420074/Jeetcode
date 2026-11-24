import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

// Run with: node src/scripts/cleanupOldSeed.js            (dry run: only counts)
//           node src/scripts/cleanupOldSeed.js --delete   (really deletes)
// Removes the old templated 4000-problem seed (titles listed in content/cleanup/old-seed-titles.json, function name
// ending in a number) together with their submissions and the solved/bookmark references. Hand-made problems stay.
import mongoose from 'mongoose';
import 'dotenv/config';
import { cleanupOldSeed } from '../services/cleanupOldSeed.service.js';

process.env.CLEANUP_OLD_SEED = process.argv.includes('--delete') ? 'true' : 'dry';
await mongoose.connect(process.env.MONGODB_URI);
console.log(`Mode: ${process.env.CLEANUP_OLD_SEED}`);
await cleanupOldSeed();
const left = await mongoose.connection.collection('problems').countDocuments();
console.log(`Problems now in DB: ${left}`);
await mongoose.disconnect();
