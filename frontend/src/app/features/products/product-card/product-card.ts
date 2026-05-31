import { Component, Input } from '@angular/core';
import { RouterLink } from "@angular/router";
import { WishlistService } from '../../../core/services/wishlist.service';
import { CompareService } from '../../../core/services/compare.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  templateUrl: './product-card.html',
  imports: [RouterLink],
})
export class ProductCard {
  @Input() product: any;

  compareFull = false;
  compareAdded = false;

  constructor(public wishlistService: WishlistService, public compareService: CompareService) {}

  toggleWishlist(event: Event) {
    event.stopPropagation();
    this.wishlistService.toggle(this.product);
  }

  toggleCompare(event: Event) {
    event.stopPropagation();
    const result = this.compareService.toggle(this.product);
    this.compareFull = result.full;
    if (result.full) setTimeout(() => this.compareFull = false, 2000);
  }
}