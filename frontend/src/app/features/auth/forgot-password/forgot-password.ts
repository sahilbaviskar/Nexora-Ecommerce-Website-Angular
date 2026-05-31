import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './forgot-password.html',
})
export class ForgotPassword {
  email = '';
  loading = false;
  success = false;
  error = '';

  constructor(private http: HttpClient, private router: Router) {}

  submit() {
    this.error = '';
    if (!this.email.trim()) { this.error = 'Please enter your email address.'; return; }
    this.loading = true;
    this.http.post<{ message: string; devResetUrl?: string }>(
      'http://localhost:3000/api/forgot-password',
      { email: this.email.trim() }
    ).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.devResetUrl) {
          // Dev mode: backend returned the token directly — redirect immediately
          const url = new URL(res.devResetUrl);
          this.router.navigate(['/reset-password'], { queryParams: { token: url.searchParams.get('token') } });
        } else {
          this.success = true;
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Something went wrong. Please try again.';
      }
    });
  }
}
