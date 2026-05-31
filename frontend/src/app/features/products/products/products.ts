import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { combineLatest, Subscription, switchMap, map } from 'rxjs';
// import productsData from '../../../../../data/products.json';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models/product.model';
import { ProductCard } from '../product-card/product-card';

@Component({
  selector: 'app-products',
  standalone: true,
  templateUrl: './products.html',
  imports: [CommonModule, ProductCard, RouterLink, FormsModule],
})
export class Products implements OnInit, OnDestroy {
  private sub?: Subscription;
  gender = '';
  category: string | null = null;

  allProducts: Product[] = [];
  products: Product[] = []; // all products
  paginatedProducts: Product[] = [];

  categories: string[] = [];
  colors: string[] = [];
  tags: string[] = [];

  selectedCategories: string[] = [];
  selectedColors: string[] = [];
  selectedTags: string[] = [];

  sortOption = 'featured';
  showSortDropdown = false;

  colorMap: Record<string, string> = {
    'white': '#ffffff',
    'black': '#000000',
    'red': '#ef4444',
    'blue': '#3b82f6',
    'navy-blue': '#1e3a5f',
    'lime-green': '#84cc16',
    'green': '#22c55e',
    'yellow': '#eab308',
    'orange': '#f97316',
    'pink': '#ec4899',
    'purple': '#a855f7',
    'gray': '#6b7280',
    'grey': '#6b7280',
    'brown': '#92400e',
    'beige': '#d4b896',
    'cream': '#fffdd0',
    'maroon': '#800000',
    'teal': '#14b8a6',
    'coral': '#ff7f50',
    'olive': '#808000',
    'sky-blue': '#38bdf8',
    'dark-green': '#166534',
    'light-gray': '#d1d5db',
    'charcoal': '#374151',
    'dark-blue': '#1e40af',
    'brinjal': '#6b21a8',
    'emerald': '#50c878',
    'multicolor': 'linear-gradient(45deg, #ef4444, #3b82f6, #22c55e, #eab308, #ec4899, #a855f7)',
  };

  getColorHex(color: string): string {
    return this.colorMap[color] || color;
  }

  tempCategories: string[] = [];
  tempColors: string[] = [];
  tempTags: string[] = [];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly productService: ProductService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  updateURL() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        category: this.selectedCategories,
        color: this.selectedColors,
        tags: this.selectedTags,
      },
      queryParamsHandling: 'merge',
    });
  }

  generateFilters() {
    const categorySet = new Set<string>();
    const colorSet = new Set<string>();
    const tagSet = new Set<string>();

    this.products.forEach((p) => {
      categorySet.add(p.subcategory);

      p.colors?.forEach((c: string) => colorSet.add(c));
      p.tags?.forEach((t: string) => tagSet.add(t));
    });

    this.categories = Array.from(categorySet);
    this.colors = Array.from(colorSet);
    this.tags = Array.from(tagSet);
  }

  filterProducts() {
    if (this.category) {
      this.products = this.allProducts.filter(
        (p) => p.category === this.gender && p.subcategory === this.category,
      );
    } else {
      this.products = this.allProducts.filter((p) => p.category === this.gender);
    }

    this.generateFilters();
  }

  runFiltering() {
    let baseFiltered = this.allProducts.filter(p => p.category === this.gender);

    if (this.category) {
      baseFiltered = baseFiltered.filter(p => p.subcategory === this.category);
    }

    // Generate filter options from the base set (before user filters)
    this.generateFiltersFrom(baseFiltered);

    let filtered = baseFiltered;

    if (this.selectedCategories.length) {
      filtered = filtered.filter(p =>
        this.selectedCategories.includes(p.subcategory)
      );
    }

    if (this.selectedColors.length) {
      filtered = filtered.filter(p =>
        p.colors?.some((c: string) => this.selectedColors.includes(c))
      );
    }

    if (this.selectedTags.length) {
      filtered = filtered.filter(p =>
        p.tags?.some((t: string) => this.selectedTags.includes(t))
      );
    }

    this.products = filtered;
    this.currentPage = 1;
    this.updatePagination();
  }

  generateFiltersFrom(products: Product[]) {
    const categorySet = new Set<string>();
    const colorSet = new Set<string>();
    const tagSet = new Set<string>();

    products.forEach((p) => {
      categorySet.add(p.subcategory);
      p.colors?.forEach((c: string) => colorSet.add(c));
      p.tags?.forEach((t: string) => tagSet.add(t));
    });

    this.categories = Array.from(categorySet);
    this.colors = Array.from(colorSet);
    this.tags = Array.from(tagSet);
  }

  applyFilters() {

  this.selectedCategories = [...this.tempCategories];
  this.selectedColors = [...this.tempColors];
  this.selectedTags = [...this.tempTags];

  // 🔥 CASE 1: Single category → clean route
  if (this.selectedCategories.length === 1) {

    this.router.navigate(
      [`/products/${this.gender}/${this.selectedCategories[0]}`],
      {
        queryParams: {
          color: this.selectedColors.length ? this.selectedColors : null,
          tag: this.selectedTags.length ? this.selectedTags : null
        }
      }
    );

  }

  // 🔥 CASE 2: No category → gender only
  else if (this.selectedCategories.length === 0) {

    this.router.navigate(
      [`/products/${this.gender}`],
      {
        queryParams: {
          color: this.selectedColors.length ? this.selectedColors : null,
          tag: this.selectedTags.length ? this.selectedTags : null
        }
      }
    );

  }

  else {

    this.router.navigate(
      [`/products/${this.gender}`],
      {
        queryParams: {
          category: this.selectedCategories,
          color: this.selectedColors,
          tag: this.selectedTags
        }
      }
    );

  }
}

  clearFilters() {
    this.tempCategories = [];
    this.tempColors = [];
    this.tempTags = [];

    this.selectedCategories = [];
    this.selectedColors = [];
    this.selectedTags = [];

    this.router.navigate([`/products/${this.gender}`]);
  }
  resetAllFilters() {
    this.selectedCategories = [];
    this.selectedColors = [];
    this.selectedTags = [];

    this.tempCategories = [];
    this.tempColors = [];
    this.tempTags = [];
  }

  //category toggle
  toggleCategory(cat: string) {
    if (this.tempCategories.includes(cat)) {
      this.tempCategories = this.tempCategories.filter((c) => c !== cat);
    } else {
      this.tempCategories.push(cat);
    }
  }

  toggleColor(color: string) {
    if (this.tempColors.includes(color)) {
      this.tempColors = this.tempColors.filter((c) => c !== color);
    } else {
      this.tempColors.push(color);
    }
  }

  toggleTag(tag: string) {
    if (this.tempTags.includes(tag)) {
      this.tempTags = this.tempTags.filter((t) => t !== tag);
    } else {
      this.tempTags.push(tag);
    }
  }

  currentPage = 1;
  itemsPerPage = 9;
  totalPages = 1;
  totalPagesArray: number[] = [];
  showMobileFilters = false;

  prevGender = '';

  ngOnInit() {
    this.sub = this.route.paramMap.pipe(
      switchMap(paramMap => {
        return this.productService.getProducts().pipe(
          map(products => ({ paramMap, products }))
        );
      })
    ).subscribe(({ paramMap, products }) => {
      const newGender = paramMap.get('gender') || '';
      const category = paramMap.get('category') || null;

      if (this.prevGender && this.prevGender !== newGender) {
        this.resetAllFilters();
      }

      this.gender = newGender;
      this.prevGender = newGender;
      this.category = category;

      // Read query params from snapshot (they don't change without navigation)
      const q = this.route.snapshot.queryParams;
      const toArray = (val: any) => val ? [].concat(val) : [];

      this.selectedCategories = toArray(q['category']);
      this.selectedColors = toArray(q['color']);
      this.selectedTags = toArray(q['tag']);

      this.tempCategories = [...this.selectedCategories];
      this.tempColors = [...this.selectedColors];
      this.tempTags = [...this.selectedTags];

      this.allProducts = products;
      this.runFiltering();
      this.cdr.markForCheck();
    });

    // Also react to query param changes
    this.route.queryParams.subscribe(q => {
      if (!this.allProducts.length) return;
      const toArray = (val: any) => val ? [].concat(val) : [];

      this.selectedCategories = toArray(q['category']);
      this.selectedColors = toArray(q['color']);
      this.selectedTags = toArray(q['tag']);

      this.tempCategories = [...this.selectedCategories];
      this.tempColors = [...this.selectedColors];
      this.tempTags = [...this.selectedTags];

      this.runFiltering();
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  sortProducts() {
    if (this.sortOption === 'low-high') {
      this.products.sort((a, b) => a.price - b.price);
    } else if (this.sortOption === 'high-low') {
      this.products.sort((a, b) => b.price - a.price);
    }
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.products.length / this.itemsPerPage);

    this.totalPagesArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);

    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;

    this.paginatedProducts = this.products.slice(start, end);
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.updatePagination();
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }
}
