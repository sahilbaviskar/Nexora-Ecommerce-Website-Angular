import 'dotenv/config';
import path from 'path';
import mongoose from 'mongoose';
import Product from '../models/Product';

function slugify(title: string, productId: number): string {
  const base = String(title)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  return `${base}-${productId}`;
}

async function migrateSlug(): Promise<void> {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce');
    console.log('Connected to MongoDB');

    const products = await Product.find({ slug: { $exists: false } });
    console.log(`Found ${products.length} products without slugs`);

    for (const product of products) {
      const slug = slugify(product.title, product.productId);
      await Product.updateOne({ _id: product._id }, { $set: { slug } });
    }

    console.log('Migration complete');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrateSlug();
