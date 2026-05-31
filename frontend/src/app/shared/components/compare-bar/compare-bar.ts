import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CompareService } from '../../../core/services/compare.service';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-compare-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (items.length > 0) {
      <div class="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-xl">
        <div class="max-w-360 mx-auto px-4 py-3 flex items-center gap-4 flex-wrap">
          <span class="text-sm font-semibold text-gray-700 shrink-0">Compare ({{ items.length }}/3):</span>

          <div class="flex items-center gap-3 flex-1 flex-wrap">
            @for (p of items; track p.productId) {
              <div class="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-1.5">
                <img [src]="p.image" [alt]="p.title" class="w-8 h-8 object-cover rounded-lg"/>
                <span class="text-xs font-medium text-gray-700 max-w-28 truncate">{{ p.title }}</span>
                <button (click)="compareService.remove(p.productId)" class="text-gray-400 hover:text-red-500 transition cursor-pointer ml-1">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            }
            @if (items.length < 3) {
              <span class="text-xs text-gray-400 italic">Add {{ 3 - items.length }} more to compare</span>
            }
          </div>

          <div class="flex items-center gap-2 shrink-0">
            @if (items.length >= 2) {
              <button (click)="goCompare()" class="text-sm bg-black text-white rounded-full px-5 py-2 hover:opacity-70 transition cursor-pointer">
                Compare now
              </button>
            }
            <button (click)="compareService.clear()" class="text-xs text-gray-500 hover:text-black transition cursor-pointer">
              Clear all
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class CompareBar implements OnInit {
  items: Product[] = [];

  constructor(public compareService: CompareService, private router: Router) {}

  ngOnInit() {
    this.compareService.items$.subscribe(items => this.items = items);
  }

  goCompare() {
    this.router.navigate(['/compare']);
  }
}
