import mongoose from 'mongoose';

const contentBlockSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['heading', 'paragraph', 'quote', 'list'],
      required: true
    },
    text: { type: String, default: '' },
    items: { type: [String], default: [] }
  },
  { _id: false }
);

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    excerpt: { type: String, required: true, trim: true },
    content: { type: [contentBlockSchema], default: [] },
    image: { type: String, default: '/blog/blogImg.png' },
    author: {
      name: { type: String, required: true },
      role: { type: String, default: 'Fashion Writer' }
    },
    tags: { type: [String], default: [] },
    category: { type: String, required: true, trim: true },
    readTime: { type: Number, default: 5, min: 1 },
    publishedAt: { type: Date, default: Date.now },
    featured: { type: Boolean, default: false }
  },
  { timestamps: true }
);

blogSchema.index({ category: 1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ publishedAt: -1 });

export default mongoose.model('Blog', blogSchema);
