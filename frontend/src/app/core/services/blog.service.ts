import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Blog, BlogsResponse } from '../models/blog.model';

@Injectable({ providedIn: 'root' })
export class BlogService {
  private readonly apiUrl = 'http://localhost:3000/api/blogs';

  constructor(private http: HttpClient) {}

  getBlogs(options: { category?: string; page?: number; limit?: number } = {}): Observable<BlogsResponse> {
    let params = new HttpParams();
    if (options.category) params = params.set('category', options.category);
    if (options.page) params = params.set('page', String(options.page));
    if (options.limit) params = params.set('limit', String(options.limit));
    return this.http.get<BlogsResponse>(this.apiUrl, { params });
  }

  getBlogBySlug(slug: string): Observable<{ blog: Blog }> {
    return this.http.get<{ blog: Blog }>(`${this.apiUrl}/${slug}`);
  }

  getCategories(): Observable<{ categories: string[] }> {
    return this.http.get<{ categories: string[] }>(`${this.apiUrl}/categories`);
  }
}
