import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe],
  templateUrl: './admin-orders.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminOrders implements OnInit {
  orders: any[] = [];
  filtered: any[] = [];
  loading = true;
  error = '';
  search = '';
  filterStatus = '';

  updatingId: string | null = null;

  readonly statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  readonly paymentStatuses = ['pending', 'paid', 'failed'];

  constructor(private adminService: AdminService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.loading = true;
    this.adminService.getAllOrders().subscribe({
      next: (res) => {
        this.orders = res.orders || [];
        this.applyFilter();
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load orders';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  applyFilter() {
    let list = [...this.orders];
    if (this.filterStatus) {
      list = list.filter(o => o.status === this.filterStatus);
    }
    const q = this.search.toLowerCase().trim();
    if (q) {
      list = list.filter(o =>
        o._id?.toLowerCase().includes(q) ||
        o.user?.name?.toLowerCase().includes(q) ||
        o.user?.email?.toLowerCase().includes(q)
      );
    }
    this.filtered = list;
  }

  updateStatus(order: any, status: string) {
    if (this.updatingId) return;
    this.updatingId = order._id;
    this.adminService.updateOrderStatus(order._id, status).subscribe({
      next: (res) => {
        order.status = res.order.status;
        order.paymentStatus = res.order.paymentStatus;
        this.updatingId = null;
        this.applyFilter();
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.error = err?.error?.message || 'Update failed';
        this.updatingId = null;
        this.cdr.markForCheck();
      }
    });
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return map[status] ?? 'bg-gray-100 text-gray-700';
  }

  paymentClass(status: string): string {
    const map: Record<string, string> = {
      paid: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      failed: 'bg-red-100 text-red-700'
    };
    return map[status] ?? 'bg-gray-100 text-gray-700';
  }
}
