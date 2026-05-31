import { Injectable, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, from, concatMap, catchError, of } from 'rxjs';
import { Product } from '../models/product.model';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
  cartItemId?: string;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly apiUrl = 'http://localhost:3000/api/cart';
  private readonly cacheKey = 'cart_cache_v1';
  private readonly guestCartKey = 'guest_cart_v1';
  private readonly syncTtlMs = 10000;
  private lastSyncedAt = 0;
  private syncInFlight = false;
  private pendingMutations = 0;
  private cartSubject = new BehaviorSubject<CartItem[]>(this.loadCache());

  cart$ = this.cartSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private toast: ToastService
  ) {
    effect(() => {
      if (this.authService.loggedIn()) {
        this.migrateGuestCartAndSync();
      } else {
        this.setCart(this.loadGuestCart());
        this.lastSyncedAt = 0;
      }
    });
  }

  private loadCache(): CartItem[] {
    try {
      const raw = localStorage.getItem(this.cacheKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private loadGuestCart(): CartItem[] {
    try {
      const raw = localStorage.getItem(this.guestCartKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private migrateGuestCartAndSync() {
    const guestItems = this.loadGuestCart();
    if (guestItems.length === 0) {
      this.syncCart(true);
      return;
    }
    localStorage.removeItem(this.guestCartKey);
    from(guestItems).pipe(
      concatMap(item =>
        this.http.post(this.apiUrl, {
          productId: item.product.id,
          quantity: item.quantity,
          size: item.size
        }).pipe(catchError(() => of(null)))
      )
    ).subscribe({ complete: () => this.syncCart(true) });
  }

  private setCart(items: CartItem[]): void {
    this.cartSubject.next(items);
    localStorage.setItem(this.cacheKey, JSON.stringify(items));
  }

  private beginMutation() {
    this.pendingMutations += 1;
  }

  private endMutation() {
    this.pendingMutations = Math.max(0, this.pendingMutations - 1);
  }

  private slugify(title: string, productId: number): string {
    const base = title.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, '-');
    return `${base}-${productId}`;
  }

  private mapProduct(item: any): Product {
    return {
      id: item.productId,
      productId: item.productId,
      title: item.title,
      price: item.price,
      image: item.image,
      images: [item.image],
      category: '',
      subcategory: '',
      colors: [],
      collections: [],
      tags: [],
      description: '',
      stock: item.stock,
      slug: item.slug || this.slugify(item.title, item.productId)
    };
  }

  private mapCartItems(items: any[]): CartItem[] {
    return (items || []).map((item) => ({
      product: this.mapProduct(item),
      quantity: item.quantity,
      size: item.size,
      cartItemId: item._id
    }));
  }

  syncCart(force: boolean = false): void {
    if (!this.authService.isLoggedIn()) {
      this.setCart([]);
      return;
    }

    if (this.syncInFlight) {
      return;
    }

    if (!force && this.pendingMutations > 0) {
      return;
    }

    if (!force && Date.now() - this.lastSyncedAt < this.syncTtlMs) {
      return;
    }

    this.syncInFlight = true;

    this.http.get<{ cart: { items: any[] } }>(this.apiUrl).subscribe({
      next: (res) => {
        this.setCart(this.mapCartItems(res.cart?.items || []));
        this.lastSyncedAt = Date.now();
        this.syncInFlight = false;
      },
      error: () => {
        this.syncInFlight = false;
      }
    });
  }

  private findItem(productId: number, size: string): CartItem | undefined {
    return this.cartSubject.value.find((i) => i.product.id === productId && i.size === size);
  }

  addToCart(product: Product, size: string = 'M', quantity: number = 1): void {
    const prev = this.cartSubject.value;
    const next = [...prev];
    const existing = next.find((i) => i.product.id === product.id && i.size === size);

    if (existing) {
      existing.quantity += quantity;
    } else {
      next.push({ product, quantity, size, cartItemId: `temp-${Date.now()}-${product.id}` });
    }

    this.setCart(next);

    if (!this.authService.isLoggedIn()) {
      localStorage.setItem(this.guestCartKey, JSON.stringify(next));
      this.toast.success(`${product.title} added to cart`, 3500, product.image);
      return;
    }

    this.beginMutation();

    this.http
      .post<{ cart: { items: any[] } }>(this.apiUrl, {
        productId: product.id,
        quantity,
        size
      })
      .subscribe({
        next: (res) => {
          this.setCart(this.mapCartItems(res.cart?.items || []));
          this.lastSyncedAt = Date.now();
          this.endMutation();
          this.toast.success(`${product.title} added to cart`, 3500, product.image);
        },
        error: () => {
          this.setCart(prev);
          this.endMutation();
          this.toast.error('Could not add to cart. Try again.');
        }
      });
  }

  setInCart(product: Product, size: string = 'M', quantity: number = 1): void {
    const existing = this.findItem(product.id, size);

    const prev = this.cartSubject.value;
    const optimistic = existing
      ? prev.map((item) => {
          if (item.product.id === product.id && item.size === size) {
            return { ...item, quantity };
          }
          return item;
        })
      : [...prev, { product, quantity, size, cartItemId: `temp-${Date.now()}-${product.id}` }];
    this.setCart(optimistic);

    if (!this.authService.isLoggedIn()) {
      localStorage.setItem(this.guestCartKey, JSON.stringify(optimistic));
      if (!existing) {
        this.toast.success(`${product.title} added to cart`, 3500, product.image);
      }
      return;
    }

    this.beginMutation();

    if (existing?.cartItemId) {
      this.http
        .put<{ cart: { items: any[] } }>(`${this.apiUrl}/${existing.cartItemId}`, { quantity })
        .subscribe({
          next: (res) => {
            this.setCart(this.mapCartItems(res.cart?.items || []));
            this.lastSyncedAt = Date.now();
            this.endMutation();
          },
          error: () => {
            this.setCart(prev);
            this.endMutation();
          }
        });
    } else {
      this.http
        .post<{ cart: { items: any[] } }>(this.apiUrl, {
          productId: product.id,
          quantity,
          size
        })
        .subscribe({
          next: (res) => {
            this.setCart(this.mapCartItems(res.cart?.items || []));
            this.lastSyncedAt = Date.now();
            this.endMutation();
            this.toast.success(`${product.title} added to cart`, 3500, product.image);
          },
          error: () => {
            this.setCart(prev);
            this.endMutation();
          }
        });
    }
  }

  removeFromCart(productId: number, size: string): void {
    const prev = this.cartSubject.value;
    const newCart = prev.filter((i) => !(i.product.id === productId && i.size === size));
    this.setCart(newCart);

    if (!this.authService.isLoggedIn()) {
      localStorage.setItem(this.guestCartKey, JSON.stringify(newCart));
      this.toast.info('Item removed from cart');
      return;
    }

    const item = prev.find((i) => i.product.id === productId && i.size === size);
    if (!item?.cartItemId) {
      this.syncCart(true);
      return;
    }

    this.beginMutation();

    this.http.delete<{ cart: { items: any[] } }>(`${this.apiUrl}/${item.cartItemId}`).subscribe({
      next: (res) => {
        this.setCart(this.mapCartItems(res.cart?.items || []));
        this.lastSyncedAt = Date.now();
        this.endMutation();
        this.toast.info('Item removed from cart');
      },
      error: () => {
        this.setCart(prev);
        this.endMutation();
        this.toast.error('Could not remove item. Try again.');
      }
    });
  }

  updateQuantity(productId: number, size: string, quantity: number): void {
    const safeQty = Math.max(1, quantity);
    const prev = this.cartSubject.value;
    const updated = prev.map((entry) => {
      if (entry.product.id === productId && entry.size === size) {
        return { ...entry, quantity: safeQty };
      }
      return entry;
    });
    this.setCart(updated);

    if (!this.authService.isLoggedIn()) {
      localStorage.setItem(this.guestCartKey, JSON.stringify(updated));
      return;
    }

    const item = prev.find((i) => i.product.id === productId && i.size === size);
    if (item?.cartItemId) {
      this.beginMutation();
      this.http
        .put<{ cart: { items: any[] } }>(`${this.apiUrl}/${item.cartItemId}`, {
          quantity: safeQty
        })
        .subscribe({
          next: (res) => {
            this.setCart(this.mapCartItems(res.cart?.items || []));
            this.lastSyncedAt = Date.now();
            this.endMutation();
          },
          error: () => {
            this.setCart(prev);
            this.endMutation();
          }
        });
    }
  }

  getTotal(): number {
    return this.cartSubject.value.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  }

  getCount(): number {
    return this.cartSubject.value.reduce((sum, i) => sum + i.quantity, 0);
  }

  isInCart(productId: number, size: string): boolean {
    return this.cartSubject.value.some(i => i.product.id === productId && i.size === size);
  }

  clearCart(): void {
    const prev = this.cartSubject.value;
    this.setCart([]);
    if (!this.authService.isLoggedIn()) {
      localStorage.removeItem(this.guestCartKey);
      return;
    }

    this.beginMutation();
    this.http.delete<{ cart: { items: any[] } }>(this.apiUrl).subscribe({
      next: (res) => {
        this.setCart(this.mapCartItems(res.cart?.items || []));
        this.lastSyncedAt = Date.now();
        this.endMutation();
      },
      error: () => {
        this.setCart(prev);
        this.endMutation();
      }
    });
  }
}
