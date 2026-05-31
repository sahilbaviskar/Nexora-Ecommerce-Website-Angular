import mongoose from 'mongoose';

import logger from '../utils/logger';

export async function connectDatabase(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('MONGODB_URI is not set in environment variables');
  }

  await mongoose.connect(mongoUri);
  logger.info('MongoDB connected successfully');
}
