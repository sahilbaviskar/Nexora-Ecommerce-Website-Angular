import 'dotenv/config';
import fs from 'fs';
import path from 'path';

import { connectDatabase } from '../config/database';
import User from '../models/User';

async function migrateUsers(): Promise<void> {
  await connectDatabase();

  const usersPath = path.join(__dirname, '..', 'users.json');
  if (!fs.existsSync(usersPath)) {
    console.log('users.json not found. Nothing to migrate.');
    process.exit(0);
  }

  const users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));

  let created = 0;
  let skipped = 0;

  for (const user of users) {
    const exists = await User.findOne({ email: user.email });
    if (exists) {
      skipped += 1;
      continue;
    }

    await User.updateOne(
      { email: user.email },
      {
        $setOnInsert: {
          name: user.name,
          email: user.email,
          password: user.password,
          role: 'user'
        }
      },
      { upsert: true }
    );

    created += 1;
  }

  console.log(`Migration complete. Created: ${created}, Skipped: ${skipped}`);
  process.exit(0);
}

migrateUsers().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
