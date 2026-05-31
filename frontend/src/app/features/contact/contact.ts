import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './contact.html',
})
export class Contact {
  private http = inject(HttpClient);

  form = { name: '', email: '', subject: '', message: '' };
  submitted = false;
  sending = false;
  errorMsg = '';

  send() {
    if (!this.form.name || !this.form.email || !this.form.message) return;
    this.sending = true;
    this.errorMsg = '';
    this.http.post('http://localhost:3000/api/contact', this.form).subscribe({
      next: () => {
        this.submitted = true;
        this.sending = false;
        this.form = { name: '', email: '', subject: '', message: '' };
      },
      error: (err) => {
        this.sending = false;
        this.errorMsg = err.error?.message || 'Failed to send message. Please try again.';
      }
    });
  }
}
