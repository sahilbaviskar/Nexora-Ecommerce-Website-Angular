import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User';

const EMAIL = 'sahil@gmail.com';

mongoose.connect(process.env.MONGODB_URI as string).then(async () => {
  const result = await User.updateOne({ email: EMAIL }, { $set: { role: 'admin' } });
  if (result.matchedCount === 0) {
    console.log(`No user found with email: ${EMAIL}`);
  } else {
    console.log(`Done! "${EMAIL}" is now an admin.`);
  }
  process.exit(0);
}).catch((err: Error) => {
  console.error('Connection failed:', err.message);
  process.exit(1);
});
