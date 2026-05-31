import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { ProfileService } from '../../core/services/profile.service';
import { OrderService } from '../../core/services/order.service';
import { jsPDF } from 'jspdf';

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

  // Password change
  currentPassword = '';
  newPassword = '';
  confirmNewPassword = '';
  passwordError = '';

  // Order cancellation
  cancelConfirmOrderId: string | null = null;
  cancelError = '';

  // Order tracking
  trackingOrderId: string | null = null;

  readonly trackingSteps = [
    { key: 'pending',    label: 'Order Placed',  icon: '📦' },
    { key: 'processing', label: 'Processing',    icon: '⚙️' },
    { key: 'shipped',    label: 'Shipped',       icon: '🚚' },
    { key: 'delivered',  label: 'Delivered',     icon: '✅' },
  ];

  stepState(stepKey: string, orderStatus: string): 'done' | 'active' | 'upcoming' {
    const order = ['pending', 'processing', 'shipped', 'delivered'];
    const stepIdx = order.indexOf(stepKey);
    const statusIdx = order.indexOf(orderStatus);
    if (orderStatus === 'cancelled') return stepIdx === 0 ? 'done' : 'upcoming';
    if (stepIdx < statusIdx) return 'done';
    if (stepIdx === statusIdx) return 'active';
    return 'upcoming';
  }

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

  changePassword() {
    this.passwordError = '';
    if (!this.currentPassword || !this.newPassword || !this.confirmNewPassword) {
      this.passwordError = 'Please fill in all password fields.';
      return;
    }
    if (this.newPassword.length < 6) {
      this.passwordError = 'New password must be at least 6 characters.';
      return;
    }
    if (this.newPassword !== this.confirmNewPassword) {
      this.passwordError = 'New passwords do not match.';
      return;
    }
    this.profileService.changePassword(this.currentPassword, this.newPassword).subscribe({
      next: () => {
        alert('Password changed successfully!');
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmNewPassword = '';
      },
      error: (err) => {
        this.passwordError = err.error?.message || 'Failed to change password.';
      }
    });
  }

  cancelOrder(orderId: string) {
    this.cancelConfirmOrderId = orderId;
    this.cancelError = '';
  }

  confirmCancel(orderId: string) {
    this.orderService.cancelOrder(orderId).subscribe({
      next: () => {
        this.cancelConfirmOrderId = null;
        this.loadOrders();
      },
      error: (err) => {
        this.cancelError = err.error?.message || 'Failed to cancel order.';
        this.cancelConfirmOrderId = null;
      }
    });
  }

  dismissCancel() {
    this.cancelConfirmOrderId = null;
    this.cancelError = '';
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

  downloadInvoice(order: Order) {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const W = doc.internal.pageSize.getWidth();
    let y = 50;

    // Header
    doc.setFontSize(22); doc.setFont('helvetica', 'bold');
    doc.text('NEXORA', 50, y);
    doc.setFontSize(10); doc.setFont('helvetica', 'normal');
    doc.setTextColor(120);
    doc.text('nexora.com', 50, y + 16);
    doc.setTextColor(0);

    doc.setFontSize(18); doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', W - 50, y, { align: 'right' });
    doc.setFontSize(10); doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(`Order #${order.id}`, W - 50, y + 16, { align: 'right' });
    doc.text(`Date: ${order.date}`, W - 50, y + 30, { align: 'right' });
    doc.setTextColor(0);

    y += 60;
    doc.setDrawColor(220); doc.setLineWidth(0.5);
    doc.line(50, y, W - 50, y);

    // Bill to
    y += 20;
    doc.setFontSize(9); doc.setFont('helvetica', 'bold');
    doc.text('BILLED TO', 50, y);
    doc.setFont('helvetica', 'normal');
    doc.text(this.user?.name || '', 50, y + 14);
    doc.text(this.user?.email || '', 50, y + 28);

    // Status
    doc.setFont('helvetica', 'bold');
    doc.text('STATUS', W - 150, y);
    doc.setFont('helvetica', 'normal');
    doc.text(order.status.toUpperCase(), W - 150, y + 14);

    y += 60;
    doc.line(50, y, W - 50, y);

    // Table header
    y += 20;
    doc.setFillColor(245, 245, 245);
    doc.rect(50, y - 12, W - 100, 22, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
    doc.text('ITEM', 60, y);
    doc.text('QTY', W - 160, y, { align: 'right' });
    doc.text('PRICE', W - 100, y, { align: 'right' });
    doc.text('TOTAL', W - 50, y, { align: 'right' });

    y += 20;
    doc.setFont('helvetica', 'normal');
    for (const item of order.items) {
      doc.text(item.title.substring(0, 50), 60, y);
      doc.text(String(item.quantity), W - 160, y, { align: 'right' });
      doc.text(`Rs.${item.price}`, W - 100, y, { align: 'right' });
      doc.text(`Rs.${item.price * item.quantity}`, W - 50, y, { align: 'right' });
      y += 18;
      if (y > 750) { doc.addPage(); y = 50; }
    }

    // Total
    y += 10;
    doc.line(50, y, W - 50, y);
    y += 20;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
    doc.text('TOTAL', W - 160, y);
    doc.text(`Rs.${order.total}`, W - 50, y, { align: 'right' });

    // Footer
    y += 50;
    doc.setFontSize(8); doc.setTextColor(150); doc.setFont('helvetica', 'normal');
    doc.text('Thank you for shopping with Nexora!', W / 2, y, { align: 'center' });

    doc.save(`Nexora-Invoice-${order.id}.pdf`);
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
