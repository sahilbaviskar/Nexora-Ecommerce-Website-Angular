import 'dotenv/config';
import path from 'path';
import fs from 'fs';

import { connectDatabase } from '../config/database';
import Product from '../models/Product';

async function seedProducts(): Promise<void> {
  await connectDatabase();

  const productsPath = path.join(__dirname, '..', '..', 'frontend', 'public', 'data', 'products.json');
  const raw = fs.readFileSync(productsPath, 'utf-8');
  const products = JSON.parse(raw);

  let inserted = 0;
  let updated = 0;

  for (const item of products) {
    const payload = {
      productId: item.id,
      title: item.title,
      price: item.price,
      image: item.image,
      images: item.images || [],
      category: String(item.category || '').toLowerCase(),
      subcategory: String(item.subcategory || '').toLowerCase(),
      colors: (item.colors || []).map((v: any) => String(v).toLowerCase()),
      collections: (item.collections || []).map((v: any) => String(v).toLowerCase()),
      tags: (item.tags || []).map((v: any) => String(v).toLowerCase()),
      description: item.description || '',
      stock: 100
    };

    const exists = await Product.findOne({ productId: item.id });

    if (exists) {
      await Product.updateOne({ productId: item.id }, payload);
      updated += 1;
    } else {
      await Product.create(payload);
      inserted += 1;
    }
  }

  console.log(`Seed complete. Inserted: ${inserted}, Updated: ${updated}`);
  process.exit(0);
}

seedProducts().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
