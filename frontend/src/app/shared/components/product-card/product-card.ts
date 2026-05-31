import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WishlistService } from '../../../core/services/wishlist.service';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink],
  standalone: true,
  templateUrl: './product-card.html',
})
export class ProductCard {
  @Input() product!: Product;
  @Input() square: boolean = false;

  constructor(public wishlistService: WishlistService) {}

  toggleWishlist(event: Event) {
    event.stopPropagation();
    this.wishlistService.toggle(this.product);
  }
}