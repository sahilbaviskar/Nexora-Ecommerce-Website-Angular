import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { ProfileService } from '../../core/services/profile.service';
import { OrderService } from '../../core/services/order.service';

@Component({
  selector: 'app-profile',
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private readonly profileCacheKey = 'profile_cache_v1';
  private readonly addressCacheKey = 'profile_addresses_cache_v1';
  private readonly ordersCacheKey = 'profile_orders_cache_v1';

  user: { name: string; email: string } | null = null;

  activeTab: 'overview' | 'orders' | 'addresses' | 'settings' = 'overview';

  // Settings form
  editName = '';
  editEmail = '';
  editPhone = '';

  // Address
  addresses: Address[] = [];
  showAddressForm = false;
  newAddress: Address = { id: '', label: 'Home', name: '', street: '', city: '', state: '', zip: '', phone: '', isDefault: false };

  // Orders (mock)
  orders: Order[] = [];

  totalOrders = 0;
  totalWishlist = 0;
  totalCart = 0;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private profileService: ProfileService,
    private orderService: OrderService
  ) {}

  ngOnInit() {
        const tab = this.route.snapshot.queryParamMap.get('tab');
        if (tab === 'orders' || tab === 'addresses' || tab === 'settings' || tab === 'overview') {
          this.activeTab = tab;
        }

    this.user = this.authService.getUser();
    if (!this.user) {
      this.router.navigate(['/login']);
      return;
    }

    this.editName = this.user.name;
    this.editEmail = this.user.email;
    this.editPhone = '';

    this.loadCachedState();

    this.profileService.getProfile().subscribe({
      next: (profile) => {
        this.user = { name: profile.name, email: profile.email };
        this.editName = profile.name;
        this.editEmail = profile.email;
        this.editPhone = profile.phone || '';

        localStorage.setItem(this.profileCacheKey, JSON.stringify({
          user: this.user,
          editPhone: this.editPhone
        }));
      }
    });

    this.loadAddresses();
    this.loadOrders();

    this.cartService.syncCart();
    this.wishlistService.syncWishlist();

    this.cartService.cart$.subscribe(items => {
      this.totalCart = items.length;
    });

    this.wishlistService.wishlist$.subscribe(items => {
      this.totalWishlist = items.length;
    });

    this.totalCart = this.cartService.getCount();
    this.totalWishlist = this.wishlistService.getCount();
  }

  private loadCachedState() {
    try {
      const profileRaw = localStorage.getItem(this.profileCacheKey);
      if (profileRaw) {
        const profileCache = JSON.parse(profileRaw);
        if (profileCache?.user?.name && profileCache?.user?.email) {
          this.user = profileCache.user;
          this.editName = profileCache.user.name;
          this.editEmail = profileCache.user.email;
        }
        if (typeof profileCache?.editPhone === 'string') {
          this.editPhone = profileCache.editPhone;
        }
      }

      const addressesRaw = localStorage.getItem(this.addressCacheKey);
      if (addressesRaw) {
        const addresses = JSON.parse(addressesRaw);
        if (Array.isArray(addresses)) {
          this.addresses = addresses;
        }
      }

      const ordersRaw = localStorage.getItem(this.ordersCacheKey);
      if (ordersRaw) {
        const orders = JSON.parse(ordersRaw);
        if (Array.isArray(orders)) {
          this.orders = orders;
          this.totalOrders = orders.length;
        }
      }
    } catch {
      // Ignore invalid cache values and let API refresh state.
    }
  }

  logout() {
    this.authService.logout();
  }

  // Addresses
  loadAddresses() {
    this.profileService.getAddresses().subscribe({
      next: (addresses) => {
        this.addresses = addresses.map((address: any) => ({
          id: address._id,
          label: address.type === 'office' ? 'Work' : address.type === 'other' ? 'Other' : 'Home',
          name: address.fullName,
          street: address.addressLine1,
          city: address.city,
          state: address.state,
          zip: address.postalCode,
          phone: address.phone,
          isDefault: address.isDefault
        }));

        localStorage.setItem(this.addressCacheKey, JSON.stringify(this.addresses));
      }
    });
  }

  addAddress() {
    const type = this.newAddress.label === 'Work' ? 'office' : this.newAddress.label === 'Other' ? 'other' : 'home';

    this.profileService.addAddress({
      type,
      fullName: this.newAddress.name,
      phone: this.newAddress.phone,
      addressLine1: this.newAddress.street,
      addressLine2: '',
      city: this.newAddress.city,
      state: this.newAddress.state,
      postalCode: this.newAddress.zip,
      country: 'India',
      isDefault: this.addresses.length === 0
    }).subscribe({
      next: () => {
        this.loadAddresses();
        this.showAddressForm = false;
        this.newAddress = { id: '', label: 'Home', name: '', street: '', city: '', state: '', zip: '', phone: '', isDefault: false };
      }
    });
  }

  removeAddress(id: string) {
    this.profileService.deleteAddress(id).subscribe({
      next: () => this.loadAddresses()
    });
  }

  setDefaultAddress(id: string) {
    const target = this.addresses.find((a) => a.id === id);
    if (!target) {
      return;
    }

    const type = target.label === 'Work' ? 'office' : target.label === 'Other' ? 'other' : 'home';

    this.profileService.updateAddress(id, {
      type,
      fullName: target.name,
      phone: target.phone,
      addressLine1: target.street,
      addressLine2: '',
      city: target.city,
      state: target.state,
      postalCode: target.zip,
      country: 'India',
      isDefault: true
    }).subscribe({
      next: () => this.loadAddresses()
    });
  }

  loadOrders() {
    this.orderService.getMyOrders().subscribe({
      next: (orders) => {
        this.orders = orders.map((order: any) => ({
          id: order._id,
          date: new Date(order.createdAt).toLocaleString(),
          total: order.totalAmount,
          status: order.status,
          items: (order.items || []).map((item: any) => ({
            title: item.title,
            image: item.image,
            price: item.price,
            quantity: item.quantity
          }))
        }));
        this.totalOrders = this.orders.length;

        localStorage.setItem(this.ordersCacheKey, JSON.stringify(this.orders));
      }
    });
  }

  // Settings
  saveSettings() {
    this.profileService.updateProfile({ phone: this.editPhone }).subscribe({
      next: () => alert('Profile updated successfully!')
    });
  }

  getInitials(): string {
    if (!this.user?.name) return '?';
    return this.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getMemberSince(): string {
    const stored = localStorage.getItem('member_since');
    if (stored) return stored;
    const date = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    localStorage.setItem('member_since', date);
    return date;
  }
}

interface Address {
  id: string;
  label: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  isDefault: boolean;
}

interface Order {
  id: string;
  date: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: { title: string; image: string; price: number; quantity: number }[];
}
