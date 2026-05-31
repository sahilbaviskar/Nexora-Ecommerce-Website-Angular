export interface ContentBlock {
  type: 'heading' | 'paragraph' | 'quote' | 'list';
  text?: string;
  items?: string[];
}

export interface BlogAuthor {
  name: string;
  role: string;
}

export interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content?: ContentBlock[];
  image: string;
  author: BlogAuthor;
  tags: string[];
  category: string;
  readTime: number;
  publishedAt: string;
  featured: boolean;
}

export interface BlogsResponse {
  blogs: Blog[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
