import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './reset-password.html',
})
export class ResetPassword implements OnInit {
  token = '';
  password = '';
  confirmPassword = '';
  loading = false;
  success = false;
  error = '';
  tokenMissing = false;

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    if (!this.token) this.tokenMissing = true;
  }

  submit() {
    this.error = '';
    if (!this.password || !this.confirmPassword) { this.error = 'Please fill in both fields.'; return; }
    if (this.password.length < 6) { this.error = 'Password must be at least 6 characters.'; return; }
    if (this.password !== this.confirmPassword) { this.error = 'Passwords do not match.'; return; }
    this.loading = true;
    this.http.post('http://localhost:3000/api/reset-password', { token: this.token, password: this.password }).subscribe({
      next: () => { this.success = true; this.loading = false; },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Something went wrong. Please try again.';
      }
    });
  }
}
