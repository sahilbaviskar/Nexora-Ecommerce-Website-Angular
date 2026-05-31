import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from '../models/product.model';

const COMPARE_KEY = 'nexora_compare_v1';
const MAX = 3;

@Injectable({ providedIn: 'root' })
export class CompareService {
  private _items$ = new BehaviorSubject<Product[]>(this.loadStorage());

  readonly items$ = this._items$.asObservable();

  get items(): Product[] { return this._items$.value; }
  get count(): number { return this._items$.value.length; }

  isAdded(productId: number): boolean {
    return this._items$.value.some(p => p.productId === productId);
  }

  toggle(product: Product): { added: boolean; full: boolean } {
    if (this.isAdded(product.productId)) {
      this.save(this._items$.value.filter(p => p.productId !== product.productId));
      return { added: false, full: false };
    }
    if (this._items$.value.length >= MAX) {
      return { added: false, full: true };
    }
    this.save([...this._items$.value, product]);
    return { added: true, full: false };
  }

  remove(productId: number) {
    this.save(this._items$.value.filter(p => p.productId !== productId));
  }

  clear() { this.save([]); }

  private save(items: Product[]) {
    this._items$.next(items);
    localStorage.setItem(COMPARE_KEY, JSON.stringify(items));
  }

  private loadStorage(): Product[] {
    try { return JSON.parse(localStorage.getItem(COMPARE_KEY) || '[]'); }
    catch { return []; }
  }
}
