export interface Product {
  productId: number;
  id: number;
  title: string;
  price: number;
  image: string;
  images: string[];
  category: string;
  subcategory: string;
  colors: string[];
  collections: string[];
  tags: string[];
  description: string;
  stock?: number;
  slug: string;
}