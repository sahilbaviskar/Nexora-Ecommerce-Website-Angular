import { Component, signal, OnDestroy } from '@angular/core';
import { RouterLink, Router } from "@angular/router";
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models/product.model';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnDestroy {
  isMenuOpen = false;

  // ── Announcement bar ──────────────────────────────────────────
  announcementVisible = signal(true);
  countdownDisplay = signal('30:00');
  private countdownSeconds = 30 * 60;
  private timerRef: ReturnType<typeof setInterval> | null = null;

  constructor(private readonly router: Router, private readonly productService: ProductService, public authService: AuthService, public cartService: CartService, public wishlistService: WishlistService) {
    this.productService.getProducts().subscribe((products) => {
      this.allProducts = products;
    });
    this.startCountdown();
  }

  private startCountdown() {
    this.timerRef = setInterval(() => {
      this.countdownSeconds = this.countdownSeconds > 0 ? this.countdownSeconds - 1 : 30 * 60;
      const m = Math.floor(this.countdownSeconds / 60).toString().padStart(2, '0');
      const s = (this.countdownSeconds % 60).toString().padStart(2, '0');
      this.countdownDisplay.set(`${m}:${s}`);
    }, 1000);
  }

  dismissAnnouncement() {
    this.announcementVisible.set(false);
    if (this.timerRef) { clearInterval(this.timerRef); this.timerRef = null; }
  }

  ngOnDestroy() {
    if (this.timerRef) clearInterval(this.timerRef);
  }
  // ─────────────────────────────────────────────────────────────

  searchQuery = '';
  searchResults: Product[] = [];
  allProducts: Product[] = [];
  isSearchOpen = false;
  isTabletSearchOpen = false;

  onSearch(){
    const q = this.searchQuery.trim().toLowerCase();
    if(q.length<2){
      this.searchResults = [];
      this.isSearchOpen = false;
      return;
    }
    this.searchResults = this.allProducts.filter(p=>
      p.title.toLowerCase().includes(q) || 
      p.category.toLowerCase().includes(q) || 
      p.subcategory.toLowerCase().includes(q)
    ).slice(0,6);
    this.isSearchOpen = this.searchResults.length>0;
  }

  goToSearch() {
    const q = this.searchQuery.trim();
    if (q.length < 2) return;
    this.isSearchOpen = false;
    this.isTabletSearchOpen = false;
    this.router.navigate(['/search'], { queryParams: { q } });
    this.searchQuery = '';
    this.searchResults = [];
  }

  goToProduct(product: any){
    this.searchQuery='';
    this.searchResults = [];
    this.isSearchOpen = false;
    this.isTabletSearchOpen = false;
    this.router.navigate(['/product', product.slug]);
  }

  closeSearch(){
    setTimeout(()=>{
      this.isSearchOpen = false;
    },200);
  }

  toggleTabletSearch() {
    this.isTabletSearchOpen = !this.isTabletSearchOpen;
    if (!this.isTabletSearchOpen) {
      this.searchQuery = '';
      this.searchResults = [];
      this.isSearchOpen = false;
    }
  }

  toogleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
  closeMenu() {
    this.isMenuOpen = false;
  }

  isCategoryOpen = false;
  isGiftCardsOpen = false;
  isSpecialEventsOpen = false;

  toggleCategory() {
    this.isCategoryOpen = !this.isCategoryOpen;
  }

  toggleGiftCards() {
    this.isGiftCardsOpen = !this.isGiftCardsOpen;
  }

  toggleSpecialEvents() {
    this.isSpecialEventsOpen = !this.isSpecialEventsOpen;
  }

 

  toggleCategoryMenu() {
    this.isCategoryOpen = !this.isCategoryOpen;
  }


}
