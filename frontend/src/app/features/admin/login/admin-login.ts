import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './admin-login.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminLogin implements OnInit {
  email = '';
  password = '';
  loading = false;
  error = '';

  constructor(private auth: AuthService, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    // Already an admin? Go straight to dashboard.
    if (this.auth.isLoggedIn() && this.auth.isAdmin()) {
      this.router.navigate(['/admin/dashboard']);
    }
  }

  login() {
    if (this.loading) return;
    this.error = '';
    this.loading = true;

    this.auth.loginRaw(this.email, this.password).subscribe({
      next: () => {
        if (this.auth.isAdmin()) {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.error = 'This account does not have admin access.';
          this.auth.clearToken();
          this.loading = false;
          this.cdr.markForCheck();
        }
      },
      error: (err: any) => {
        this.error = err?.error?.message || 'Invalid email or password.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }
}
