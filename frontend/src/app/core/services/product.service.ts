import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:3000/api/products';
  private products$: Observable<Product[]>;

  constructor(private http: HttpClient) {
    this.products$ = this.http.get<{ items: any[] }>(`${this.apiUrl}?page=1&limit=1000`).pipe(
      map((res) => (res.items || []).map((item) => this.mapProduct(item))),
      shareReplay(1)
    );
  }

  private mapProduct(item: any): Product {
    return {
      id: item.productId,
      productId: item.productId ?? item.id,
      title: item.title,
      price: item.price,
      image: item.image,
      images: item.images || [],
      category: item.category,
      subcategory: item.subcategory,
      colors: item.colors || [],
      collections: item.collections || [],
      tags: item.tags || [],
      description: item.description || '',
      stock: item.stock,
      slug: item.slug || ''
    };
  }

  // all products (cached)
  getProducts(): Observable<Product[]> {
    return this.products$;
  }

  // fetch single product by slug — returns product + its reviews in one call
  getProductBySlug(slug: string): Observable<{ product: Product; reviews: any[] }> {
    return this.http.get<{ product: any; reviews: any[] }>(`${this.apiUrl}/${slug}`).pipe(
      map(res => ({
        product: this.mapProduct(res.product),
        reviews: res.reviews || []
      }))
    );
  }

  // single product — uses cached list to avoid extra HTTP round-trip
  getProductById(id: number): Observable<Product | undefined> {
    return this.getProducts().pipe(
      map(products => products.find(p => p.id === id))
    );
  }

  // by gender
  getProductsByGender(gender: string): Observable<Product[]> {
    return this.getProducts().pipe(
      map(products =>
        products.filter(p => p.category === gender)
      )
    );
  }

  // by category
  getProductsByCategory(
    gender: string,
    category: string
  ): Observable<Product[]> {

    return this.getProducts().pipe(
      map(products =>
        products.filter(p =>
          p.category === gender &&
          p.subcategory === category
        )
      )
    );
  }
}