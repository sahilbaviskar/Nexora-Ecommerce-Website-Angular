import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models/product.model';
import { ProductCard } from '../products/product-card/product-card';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [RouterLink, ProductCard],
  templateUrl: './search.html',
})
export class SearchPage implements OnInit {
  query = '';
  results: Product[] = [];
  filtered: Product[] = [];
  activeCategory = 'All';
  categories: string[] = [];
  loading = true;

  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.route.queryParamMap.subscribe((params) => {
      this.query = params.get('q')?.trim() ?? '';
      this.run();
    });
  }

  private run() {
    this.loading = true;
    this.activeCategory = 'All';
    this.productService.getProducts().subscribe((products) => {
      const q = this.query.toLowerCase();
      this.results = q.length < 2
        ? []
        : products.filter(
            (p) =>
              p.title.toLowerCase().includes(q) ||
              p.category.toLowerCase().includes(q) ||
              p.subcategory.toLowerCase().includes(q) ||
              (p.tags || []).some((t) => t.toLowerCase().includes(q))
          );
      const seen = new Set<string>();
      this.categories = ['All'];
      this.results.forEach((p) => {
        if (!seen.has(p.category)) { seen.add(p.category); this.categories.push(p.category); }
      });
      this.applyFilter();
      this.loading = false;
      this.cdr.markForCheck();
    });
  }

  selectCategory(cat: string) {
    this.activeCategory = cat;
    this.applyFilter();
    this.cdr.markForCheck();
  }

  private applyFilter() {
    this.filtered = this.activeCategory === 'All'
      ? this.results
      : this.results.filter((p) => p.category === this.activeCategory);
  }
}
