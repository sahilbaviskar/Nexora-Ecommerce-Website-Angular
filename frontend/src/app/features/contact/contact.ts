import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './contact.html',
})
export class Contact {
  private cdr = inject(ChangeDetectorRef);

  form = { name: '', email: '', subject: '', message: '' };
  submitted = false;
  sending = false;

  send() {
    if (!this.form.name || !this.form.email || !this.form.message) return;
    this.sending = true;
    this.cdr.markForCheck();
    setTimeout(() => {
      this.submitted = true;
      this.sending = false;
      this.form = { name: '', email: '', subject: '', message: '' };
      this.cdr.markForCheck();
    }, 1200);
  }
}
