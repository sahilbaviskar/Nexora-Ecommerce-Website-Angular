import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:3000/api';

  /** Signal that increments on every auth state change to trigger reactivity */
  private authVersion = signal(0);

  /** Reactive computed signal for logged-in state */
  loggedIn = computed(() => {
    this.authVersion(); // subscribe to changes
    return this._isLoggedIn();
  });

  /** Reactive computed signal for current user */
  user = computed(() => {
    this.authVersion();
    return this._getUser();
  });

  constructor(private http: HttpClient, private router: Router, private toast: ToastService) {}

  private notifyChange() {
    this.authVersion.update(v => v + 1);
  }

  signup(name: string, email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, { name, email, password }).pipe(
      tap((res: any) => {
        localStorage.setItem('token', res.token);
        this.notifyChange();
        this.toast.success('Account created! Welcome to Nexora.');
        this.router.navigate(['/']);
      })
    );
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((res: any) => {
        localStorage.setItem('token', res.token);
        this.notifyChange();
        this.toast.success('Welcome back!');
        this.router.navigate(['/']);
      })
    );
  }

  /** Login without automatic navigation — caller decides where to go. */
  loginRaw(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((res: any) => {
        localStorage.setItem('token', res.token);
        this.notifyChange();
        this.toast.success('Welcome back!');
      })
    );
  }

  clearToken(): void {
    localStorage.removeItem('token');
    this.notifyChange();
  }

  isLoggedIn(): boolean {
    return this.loggedIn();
  }

  private _isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    if (!token) {
      return false;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      const isExpired = typeof payload.exp === 'number' && payload.exp < now;

      if (isExpired) {
        localStorage.removeItem('token');
        return false;
      }

      return true;
    } catch {
      localStorage.removeItem('token');
      return false;
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('profile_cache_v1');
    localStorage.removeItem('profile_addresses_cache_v1');
    localStorage.removeItem('profile_orders_cache_v1');
    this.notifyChange();
    this.toast.info('You have been logged out.');
    this.router.navigate(['/login']);
  }

  getUser(): { name: string; email: string; role?: string } | null {
    return this.user();
  }

  private _getUser(): { name: string; email: string; role?: string } | null {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return { name: payload.name, email: payload.email, role: payload.role };
    } catch {
      return null;
    }
  }

  isAdmin(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role === 'admin';
    } catch {
      return false;
    }
  }
}
