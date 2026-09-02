// Run with: node src/scripts/promoteToAdmin.js you@example.com
// Sets that user's role to 'admin'. Prints the before/after role so you
// can confirm the change happened.
import mongoose from 'mongoose';
import 'dotenv/config';
import { User } from '../models/User.js';

const email = process.argv[2];
if (!email) {
  console.error('Usage: node src/scripts/promoteToAdmin.js <email>');
  process.exit(1);
}

await mongoose.connect(process.env.MONGODB_URI);

const before = await User.findOne({ email: email.toLowerCase() }).select('name email role').lean();
if (!before) {
  console.error(`No user found with email: ${email}`);
  await mongoose.disconnect();
  process.exit(1);
}
console.log('Before:', before);

const updated = await User.findOneAndUpdate(
  { email: email.toLowerCase() },
  { $set: { role: 'admin' } },
  { new: true }
).select('name email role').lean();
console.log('After: ', updated);

await mongoose.disconnect();
console.log('\nDone. Log out and log back in on the site — the JWT still carries the OLD role until you get a fresh one.');
