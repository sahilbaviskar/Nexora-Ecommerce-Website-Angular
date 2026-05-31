import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-signup',
  imports: [RouterLink, FormsModule],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  error = '';

  constructor(private authService: AuthService) {}

  onSubmit() {
    if (!this.name.trim() || !this.email.trim() || !this.password) {
      this.error = 'Please fill in all required fields';
      setTimeout(() => (this.error = ''), 4000);
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match';
      setTimeout(() => (this.error = ''), 4000);
      return;
    }
    this.authService.signup(this.name.trim(), this.email.trim(), this.password).subscribe({
      next: () => { this.error = ''; },
      error: (err) => {
        this.error = err.error?.message || 'Signup failed';
        setTimeout(() => (this.error = ''), 4000);
      },
    });
  }
}
