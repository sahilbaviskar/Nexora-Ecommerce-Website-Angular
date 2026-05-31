import { Injectable, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product } from '../models/product.model';
import { BehaviorSubject, from, concatMap, catchError, of } from 'rxjs';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private readonly apiUrl = 'http://localhost:3000/api/wishlist';
  private readonly cacheKey = 'wishlist_cache_v1';
  private readonly guestWishlistKey = 'guest_wishlist_v1';
  private readonly syncTtlMs = 10000;
  private lastSyncedAt = 0;
  private syncInFlight = false;
  private pendingIds = new Set<number>();
  private wishlistSubject = new BehaviorSubject<Product[]>(this.loadCache());

  wishlist$ = this.wishlistSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private toast: ToastService
  ) {
    effect(() => {
      if (this.authService.loggedIn()) {
        this.migrateGuestWishlistAndSync();
      } else {
        this.setWishlist(this.loadGuestWishlist());
        this.lastSyncedAt = 0;
      }
    });
  }

  private loadCache(): Product[] {
    try {
      const raw = localStorage.getItem(this.cacheKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private loadGuestWishlist(): Product[] {
    try {
      const raw = localStorage.getItem(this.guestWishlistKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private migrateGuestWishlistAndSync() {
    const guestItems = this.loadGuestWishlist();
    if (guestItems.length === 0) {
      this.syncWishlist(true);
      return;
    }
    localStorage.removeItem(this.guestWishlistKey);
    from(guestItems).pipe(
      concatMap(product =>
        this.http.post(`${this.apiUrl}/${product.id}`, {}).pipe(catchError(() => of(null)))
      )
    ).subscribe({ complete: () => this.syncWishlist(true) });
  }

  private setWishlist(items: Product[]): void {
    this.wishlistSubject.next(items);
    localStorage.setItem(this.cacheKey, JSON.stringify(items));
  }

  private mapProduct(item: any): Product {
    return {
      id: item.productId,
      productId: item.productId ?? item.id,
      title: item.title,
      price: item.price,
      image: item.image,
      images: item.images || [item.image],
      category: item.category || '',
      subcategory: item.subcategory || '',
      colors: item.colors || [],
      collections: item.collections || [],
      tags: item.tags || [],
      description: item.description || '',
      slug: item.slug || ''
    };
  }

  syncWishlist(force: boolean = false): void {
    if (!this.authService.isLoggedIn()) {
      this.setWishlist([]);
      return;
    }

    if (this.syncInFlight) {
      return;
    }

    if (!force && Date.now() - this.lastSyncedAt < this.syncTtlMs) {
      return;
    }

    this.syncInFlight = true;

    this.http.get<{ wishlist: { products: any[] } }>(this.apiUrl).subscribe({
      next: (res) => {
        this.setWishlist((res.wishlist?.products || []).map((p) => this.mapProduct(p)));
        this.lastSyncedAt = Date.now();
        this.syncInFlight = false;
      },
      error: () => {
        this.syncInFlight = false;
      }
    });
  }

  toggle(product: Product): void {
    if (this.pendingIds.has(product.id)) {
      return;
    }

    const prev = this.wishlistSubject.value;
    const exists = prev.some((p) => p.id === product.id);

    if (!this.authService.isLoggedIn()) {
      const updated = exists
        ? prev.filter((p) => p.id !== product.id)
        : [...prev, product];
      this.setWishlist(updated);
      localStorage.setItem(this.guestWishlistKey, JSON.stringify(updated));
      exists
        ? this.toast.info(`${product.title} removed from wishlist`)
        : this.toast.success(`${product.title} added to wishlist`);
      return;
    }

    this.pendingIds.add(product.id);

    if (exists) {
      this.setWishlist(prev.filter((p) => p.id !== product.id));

      this.http.delete<{ wishlist: { products: any[] } }>(`${this.apiUrl}/${product.id}`).subscribe({
        next: (res) => {
          this.setWishlist((res.wishlist?.products || []).map((p) => this.mapProduct(p)));
          this.lastSyncedAt = Date.now();
          this.pendingIds.delete(product.id);
          this.toast.info(`${product.title} removed from wishlist`);
        },
        error: () => {
          this.setWishlist(prev);
          this.pendingIds.delete(product.id);
        }
      });
    } else {
      this.setWishlist([...prev, product]);

      this.http.post<{ wishlist: { products: any[] } }>(`${this.apiUrl}/${product.id}`, {}).subscribe({
        next: (res) => {
          this.setWishlist((res.wishlist?.products || []).map((p) => this.mapProduct(p)));
          this.lastSyncedAt = Date.now();
          this.pendingIds.delete(product.id);
          this.toast.success(`${product.title} added to wishlist`);
        },
        error: () => {
          this.setWishlist(prev);
          this.pendingIds.delete(product.id);
        }
      });
    }
  }

  isInWishlist(productId: number): boolean {
    return this.wishlistSubject.value.some((p) => p.id === productId);
  }

  getCount(): number {
    return this.wishlistSubject.value.length;
  }
}
