import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CompareService } from '../../core/services/compare.service';
import { Product } from '../../core/models/product.model';

interface Row { label: string; key: keyof Product; format?: 'currency' | 'array' | 'stock'; }

const ROWS: Row[] = [
  { label: 'Price',       key: 'price',       format: 'currency' },
  { label: 'Category',    key: 'category' },
  { label: 'Subcategory', key: 'subcategory' },
  { label: 'Colors',      key: 'colors',      format: 'array' },
  { label: 'Collections', key: 'collections', format: 'array' },
  { label: 'Stock',       key: 'stock',       format: 'stock' },
  { label: 'Tags',        key: 'tags',        format: 'array' },
];

@Component({
  selector: 'app-compare',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './compare.html',
})
export class ComparePage implements OnInit {
  items: Product[] = [];
  rows = ROWS;

  constructor(public compareService: CompareService) {}

  ngOnInit() {
    this.compareService.items$.subscribe(items => this.items = items);
  }

  cellValue(product: Product, row: Row): string {
    const val = product[row.key];
    if (val == null || val === '') return '—';
    if (row.format === 'array') {
      const arr = Array.isArray(val) ? val : [val];
      return arr.length ? arr.join(', ') : '—';
    }
    if (row.format === 'stock') {
      const n = Number(val);
      return n > 0 ? String(n) : 'Out of stock';
    }
    return String(val);
  }

  stockClass(product: Product): string {
    return (product.stock ?? 0) > 0 ? 'text-green-600' : 'text-red-500';
  }
}
