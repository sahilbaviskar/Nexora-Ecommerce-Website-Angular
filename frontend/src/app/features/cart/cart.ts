import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService, CartItem } from '../../core/services/cart.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cart',
  imports: [RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart implements OnInit, OnDestroy {
  items: CartItem[] = [];
  private sub!: Subscription;

  constructor(public cartService: CartService) {}

  ngOnInit() {
    this.cartService.syncCart();
    this.sub = this.cartService.cart$.subscribe(items => this.items = items);
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  increment(item: CartItem) {
    const stock = item.product.stock;
    if (stock !== undefined && item.quantity >= stock) return;
    this.cartService.updateQuantity(item.product.id, item.size, item.quantity + 1);
  }

  decrement(item: CartItem) {
    if (item.quantity > 1) {
      this.cartService.updateQuantity(item.product.id, item.size, item.quantity - 1);
    }
  }

  remove(item: CartItem) {
    this.cartService.removeFromCart(item.product.id, item.size);
  }

  get total(): number {
    return this.cartService.getTotal();
  }
}
