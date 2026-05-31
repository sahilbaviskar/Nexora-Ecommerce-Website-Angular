import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css'
})
export class AdminLayout {
  sidebarOpen = false;

  constructor(private auth: AuthService) {}

  get adminName(): string {
    return this.auth.getUser()?.name || 'Admin';
  }

  logout() {
    this.auth.logout();
  }
}
