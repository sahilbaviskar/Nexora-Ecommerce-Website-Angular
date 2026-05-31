import { Component, inject, signal, computed, ElementRef, ViewChild, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProductService } from '../../../../core/services/product.service';
import { Product } from '../../../../core/models/product.model';
import { ProductCard } from '../../../../shared/components/product-card/product-card';

@Component({
  selector: 'app-explore-colors',
  imports: [ProductCard],
  templateUrl: './explore-colors.html',
  styleUrl: './explore-colors.css',
})
export class ExploreColors implements AfterViewInit, OnDestroy {
  private productService = inject(ProductService);
  private allProducts = toSignal(this.productService.getProducts(), { initialValue: [] as Product[] });

  private cdr = inject(ChangeDetectorRef);

  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;
  private scrollListener: (() => void) | null = null;

  colors = [
    { name: 'RED PASTEL', value: 'red', bg: 'bg-red-400' },
    { name: 'LIME GREEN', value: 'lime-green', bg: 'bg-lime-400' },
    { name: 'NAVY BLUE', value: 'navy-blue', bg: 'bg-blue-900' },
    { name: 'CLEAN WHITE', value: 'white', bg: 'bg-gray-200 border' },
    { name: 'BLUE SKY', value: 'sky-blue', bg: 'bg-sky-400' },
    { name: 'PURPLE', value: 'purple', bg: 'bg-purple-500' },
    { name: 'PINK', value: 'pink', bg: 'bg-pink-500' },
    { name: 'YELLOW', value: 'yellow', bg: 'bg-yellow-400' },
    { name: 'DARK GREEN', value: 'dark-green', bg: 'bg-green-600' },
  ];

  activeColor = signal('white');

  filteredProducts = computed(() => {
    return this.allProducts()
      .filter(p => p.colors.includes(this.activeColor()))
      .slice(0, 10);
  });

  selectColor(value: string) {
    this.activeColor.set(value);
    this.cdr.detectChanges();
    requestAnimationFrame(() => {
      this.centerScroll();
      this.updateScales();
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.centerScroll();
      this.updateScales();
    }, 200);
  }

  ngOnDestroy() {
    if (this.scrollListener && this.scrollContainer?.nativeElement) {
      this.scrollContainer.nativeElement.removeEventListener('scroll', this.scrollListener);
    }
  }

  onScrollInit(el: HTMLDivElement) {
    if (!this.scrollListener) {
      this.scrollListener = () => {
        this.updateScales();
        this.handleInfiniteScroll();
      };
      el.addEventListener('scroll', this.scrollListener, { passive: true });
    }
  }

  private centerScroll() {
    const container = this.scrollContainer?.nativeElement;
    if (!container) return;
    const scrollWidth = container.scrollWidth;
    container.scrollLeft = (scrollWidth - container.clientWidth) / 2;
  }

  private handleInfiniteScroll() {
    const container = this.scrollContainer?.nativeElement;
    if (!container) return;
    const third = container.scrollWidth / 3;

    if (container.scrollLeft <= 0) {
      container.scrollLeft += third;
    } else if (container.scrollLeft >= third * 2) {
      container.scrollLeft -= third;
    }
  }

  get tripleProducts() {
    const products = this.filteredProducts();
    return [...products, ...products, ...products];
  }

  updateScales() {
    const container = this.scrollContainer?.nativeElement;
    if (!container) return;
    const cards = container.querySelectorAll<HTMLElement>('.color-card-inner');
    const containerRect = container.getBoundingClientRect();
    const containerCenter = containerRect.left + containerRect.width / 2;
    const wrappers = container.querySelectorAll<HTMLElement>('.color-card');

    wrappers.forEach((wrapper, i) => {
      const card = cards[i];
      const wrapperRect = wrapper.getBoundingClientRect();
      const cardCenter = wrapperRect.left + wrapperRect.width / 2;
      const distance = Math.abs(cardCenter - containerCenter);
      const cardWidth = 280;

      // 0 = center, 1 = one card away, 2 = two cards away...
      const normalizedDist = distance / cardWidth;

      let scale: number, opacity: number;
      if (normalizedDist < 0.5) {
        // Center card
        scale = 1;
        opacity = 1;
      } else if (normalizedDist < 1.5) {
        // Adjacent cards
        scale = 0.82;
        opacity = 0.85;
      } else {
        // Edge cards
        scale = 0.68;
        opacity = 0.55;
      }

      card.style.transform = `scale(${scale})`;
      card.style.opacity = `${opacity}`;
    });
  }
}
