import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { CartService, CartItem } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { OrderService } from '../../core/services/order.service';
import { ProfileService } from '../../core/services/profile.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  orderItems: CartItem[] = [];
  currentStep = 1;
  orderPlaced = false;
  orderId = '';
  placingOrder = false;
  placeOrderError = '';
  private cartSub?: Subscription;

  // Address form
  address = {
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    landmark: '',
  };

  // Payment
  paymentMethod: 'card' | 'upi' | 'cod' = 'cod';
  card = { number: '', name: '', expiry: '', cvv: '' };
  upiId = '';

  // Saved addresses
  savedAddresses: any[] = [];
  selectedAddressIndex = -1;
  showNewAddressForm = true;

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private orderService: OrderService,
    private profileService: ProfileService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private toast: ToastService
  ) {}

  ngOnDestroy() {
    this.cartSub?.unsubscribe();
  }

  ngOnInit() {
    // Require login before checkout — redirect back after login
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { redirect: '/checkout' } });
      return;
    }

    this.cartService.syncCart();

    // Only update displayed items — redirect logic is handled separately below.
    this.cartSub = this.cartService.cart$.subscribe(items => {
      if (!this.orderPlaced) {
        this.cartItems = items;
      }
      this.cdr.markForCheck();
    });

    // One-time guard: if cart is genuinely empty on load, send user back.
    // We wait until pendingMutations settles (using setTimeout 0 to run after current call stack).
    setTimeout(() => {
      if (this.cartItems.length === 0 && !this.orderPlaced && !this.placingOrder) {
        this.router.navigate(['/cart']);
      }
    }, 0);

    const user = this.authService.getUser();
    if (user) {
      this.address.fullName = user.name;
    }

    this.loadSavedAddresses();
  }

  private loadSavedAddresses() {
    this.profileService.getAddresses().subscribe({
      next: (addresses) => {
        this.savedAddresses = addresses.map((address: any) => ({
          id: address._id,
          fullName: address.fullName,
          phone: address.phone,
          street: address.addressLine1,
          city: address.city,
          state: address.state,
          zip: address.postalCode,
          landmark: address.addressLine2 || '',
          country: address.country,
          isDefault: address.isDefault
        }));

        const defaultIndex = this.savedAddresses.findIndex((a) => a.isDefault);
        if (this.savedAddresses.length > 0) {
          this.showNewAddressForm = false;
          this.selectAddress(defaultIndex > -1 ? defaultIndex : 0);
        }

        this.cdr.markForCheck();
      }
    });
  }

  private toPaymentMethod(): 'COD' | 'CARD' | 'UPI' {
    if (this.paymentMethod === 'card') {
      return 'CARD';
    }
    if (this.paymentMethod === 'upi') {
      return 'UPI';
    }
    return 'COD';
  }

  get subtotal(): number {
    return this.cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }

  get shipping(): number {
    return this.subtotal > 500 ? 0 : 50;
  }

  get tax(): number {
    return Math.round(this.subtotal * 0.18);
  }

  get total(): number {
    return this.subtotal + this.shipping + this.tax;
  }

  get discount(): number {
    return this.subtotal > 1000 ? Math.round(this.subtotal * 0.1) : 0;
  }

  get grandTotal(): number {
    return this.total - this.discount;
  }

  get totalItems(): number {
    return this.cartItems.reduce((sum, i) => sum + i.quantity, 0);
  }

  selectAddress(index: number) {
    this.selectedAddressIndex = index;
    this.address = { ...this.savedAddresses[index] };
    this.showNewAddressForm = false;
  }

  useNewAddress() {
    this.selectedAddressIndex = -1;
    this.showNewAddressForm = true;
    this.address = { fullName: '', phone: '', street: '', city: '', state: '', zip: '', landmark: '' };
    const user = this.authService.getUser();
    if (user) this.address.fullName = user.name;
  }

  isAddressValid(): boolean {
    return !!(this.address.fullName && this.address.phone && this.address.street && this.address.city && this.address.state && this.address.zip);
  }

  isPaymentValid(): boolean {
    if (this.paymentMethod === 'cod') return true;
    if (this.paymentMethod === 'upi') return this.upiId.includes('@');
    if (this.paymentMethod === 'card') {
      return !!(this.card.number.length >= 16 && this.card.name && this.card.expiry && this.card.cvv.length >= 3);
    }
    return false;
  }

  nextStep() {
    if (this.currentStep === 1 && this.isAddressValid()) {
      if (this.showNewAddressForm) {
        this.profileService
          .addAddress({
            type: 'home',
            fullName: this.address.fullName,
            phone: this.address.phone,
            addressLine1: this.address.street,
            addressLine2: this.address.landmark || '',
            city: this.address.city,
            state: this.address.state,
            postalCode: this.address.zip,
            country: 'India',
            isDefault: this.savedAddresses.length === 0
          })
          .subscribe({
            next: () => {
              this.currentStep = 2;
              this.loadSavedAddresses();
            }
          });
        return;
      }

      this.currentStep = 2;
    } else if (this.currentStep === 2 && this.isPaymentValid()) {
      this.currentStep = 3;
    }
  }

  prevStep() {
    if (this.currentStep > 1) this.currentStep--;
  }

  placeOrder() {
    if (this.placingOrder) {
      return;
    }

    this.placingOrder = true;
    this.placeOrderError = '';

    // Snapshot current items now so the success screen can still display them
    // after the cart is cleared.
    this.orderItems = [...this.cartItems];

    this.orderService.placeOrder({
      paymentMethod: this.toPaymentMethod(),
      shippingAddress: {
        fullName: this.address.fullName,
        phone: this.address.phone,
        addressLine1: this.address.street,
        addressLine2: this.address.landmark || '',
        city: this.address.city,
        state: this.address.state,
        postalCode: this.address.zip,
        country: 'India'
      }
    }).subscribe({
      next: (res) => {
        this.orderPlaced = true;
        this.orderId = res.order?._id || 'ORDER_PLACED';
        this.placingOrder = false;
        this.cdr.markForCheck();
        this.toast.success('Order placed successfully! 🎉');
        // Clear cart AFTER orderPlaced is true so subscription never redirects.
        this.cartService.clearCart();
      },
      error: (error) => {
        this.placingOrder = false;
        this.placeOrderError = error?.error?.message || 'Unable to place order. Please try again.';
        this.cdr.markForCheck();
      }
    });
  }

  continueShopping() {
    this.router.navigate(['/']);
  }

  removeItem(productId: number, size: string) {
    this.cartService.removeFromCart(productId, size);
  }

  updateQty(productId: number, size: string, qty: number) {
    this.cartService.updateQuantity(productId, size, qty);
  }
}
