import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WishlistService } from '../../core/services/wishlist.service';
import { Product } from '../../core/models/product.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-wishlist',
  imports: [RouterLink],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.css',
})
export class Wishlist implements OnInit, OnDestroy {
  items: Product[] = [];
  private sub!: Subscription;

  constructor(private wishlistService: WishlistService) {}

  ngOnInit() {
    this.wishlistService.syncWishlist();
    this.sub = this.wishlistService.wishlist$.subscribe(
      (items) => (this.items = items)
    );
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  remove(product: Product) {
    this.wishlistService.toggle(product);
  }
}
