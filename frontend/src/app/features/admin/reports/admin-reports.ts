import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-reports.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminReports implements OnInit {
  loading = true;
  error = '';
  monthlyRevenue: any[] = [];
  ordersByStatus: any[] = [];
  topProducts: any[] = [];
  monthlyUsers: any[] = [];

  constructor(private adminService: AdminService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.adminService.getReports().subscribe({
      next: (data) => {
        this.monthlyRevenue = (data.monthlyRevenue || []).map((m: any) => ({
          label: `${MONTH_NAMES[m._id.month - 1]} ${m._id.year}`,
          revenue: m.revenue,
          count: m.count
        }));
        this.ordersByStatus = data.ordersByStatus || [];
        this.topProducts = data.topProducts || [];
        this.monthlyUsers = (data.monthlyUsers || []).map((m: any) => ({
          label: `${MONTH_NAMES[m._id.month - 1]} ${m._id.year}`,
          count: m.count
        }));
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load reports.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  get maxRevenue(): number {
    return Math.max(...this.monthlyRevenue.map(m => m.revenue), 1);
  }

  get maxUsers(): number {
    return Math.max(...this.monthlyUsers.map(m => m.count), 1);
  }

  get totalOrders(): number {
    return this.ordersByStatus.reduce((s, o) => s + o.count, 0);
  }

  statusColor(status: string): string {
    const map: Record<string, string> = {
      pending: 'bg-orange-400',
      processing: 'bg-yellow-400',
      shipped: 'bg-blue-400',
      delivered: 'bg-green-400',
      cancelled: 'bg-gray-400'
    };
    return map[status] || 'bg-gray-300';
  }

  getMonthName(m: any): string {
    return `${MONTH_NAMES[m._id.month - 1]} ${m._id.year}`;
  }
}
