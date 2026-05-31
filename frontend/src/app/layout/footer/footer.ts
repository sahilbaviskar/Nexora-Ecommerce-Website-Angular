import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-footer',
  standalone:true,
  imports: [RouterLink, FormsModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  subscribeEmail = '';
  subscribeMessage = '';

  subscribe() {
    if (!this.subscribeEmail || !this.subscribeEmail.includes('@')) {
      this.subscribeMessage = '';
      return;
    }
    this.subscribeMessage = 'You successfully subscribed to our community platform!';
    this.subscribeEmail = '';
    setTimeout(() => this.subscribeMessage = '', 5000);
  }
}
