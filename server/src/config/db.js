import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

mongoose.set('strictQuery', true);

export async function connectDB() {
  try {
    await mongoose.connect(env.MONGODB_URI, {
      // Pool sizing: default is 100 per Mongoose process. At 10L users we'll
      // run multiple horizontally-scaled server instances behind a load
      // balancer rather than one instance with a huge pool — keep this
      // moderate per-instance and scale out, not up.
      maxPoolSize: 50,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 10000,
    });
    logger.info(`MongoDB connected: ${mongoose.connection.host}`);
  } catch (err) {
    logger.error('MongoDB connection failed', err);
    // Fail fast — an API server with no DB should not accept traffic.
    process.exit(1);
  }

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });
  mongoose.connection.on('error', (err) => {
    logger.error('MongoDB connection error', err);
  });
}

export async function disconnectDB() {
  await mongoose.disconnect();
}
