import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './admin-users.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminUsers implements OnInit {
  users: any[] = [];
  filtered: any[] = [];
  loading = true;
  error = '';
  search = '';

  constructor(private adminService: AdminService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.adminService.getUsers().subscribe({
      next: (res) => {
        this.users = res.users || [];
        this.filtered = [...this.users];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load users';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  applyFilter() {
    const q = this.search.toLowerCase().trim();
    this.filtered = q
      ? this.users.filter(u =>
          u.name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q)
        )
      : [...this.users];
  }
}
