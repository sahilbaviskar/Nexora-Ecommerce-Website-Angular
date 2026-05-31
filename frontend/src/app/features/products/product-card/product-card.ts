import { Component, Input } from '@angular/core';
import { RouterLink } from "@angular/router";
import { WishlistService } from '../../../core/services/wishlist.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  templateUrl: './product-card.html',
  imports: [RouterLink],
})
export class ProductCard {
  @Input() product: any;

  constructor(public wishlistService: WishlistService) {}

  toggleWishlist(event: Event) {
    event.stopPropagation();
    this.wishlistService.toggle(this.product);
  }
}