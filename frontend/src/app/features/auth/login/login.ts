import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [RouterLink, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email = '';
  password = '';
  error = '';
  private errorTimeout: any;

  constructor(private authService: AuthService, private route: ActivatedRoute, private router: Router) {}

  private showError(msg: string, duration = 4000) {
    clearTimeout(this.errorTimeout);
    this.error = msg;
    this.errorTimeout = setTimeout(() => this.error = '', duration);
  }

  onSubmit() {
    const email = this.email.trim();
    const password = this.password.trim();
    if (!email || !password) {
      this.showError('Please fill in all fields');
      return;
    }
    const redirect = this.route.snapshot.queryParams['redirect'] || '/';
    this.authService.loginRaw(email, password).subscribe({
      next: () => {
        this.error = '';
        this.router.navigateByUrl(redirect);
      },
      error: (err) => {
        const duration = err.status === 429 ? 12000 : 4000;
        this.showError(err.error?.message || 'Login failed', duration);
      }
    });
  }
}
