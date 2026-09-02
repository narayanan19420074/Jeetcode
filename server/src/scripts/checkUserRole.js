// Run with: node src/scripts/checkUserRole.js you@example.com
import mongoose from 'mongoose';
import 'dotenv/config';
import { User } from '../models/User.js';

const email = process.argv[2];
if (!email) {
  console.error('Usage: node src/scripts/checkUserRole.js <email>');
  process.exit(1);
}

await mongoose.connect(process.env.MONGODB_URI);
const user = await User.findOne({ email: email.toLowerCase() }).select('name email handle role').lean();
console.log(user || 'No user found with that email');
await mongoose.disconnect();
