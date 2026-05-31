import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
  image?: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private counter = 0;
  readonly toasts = signal<Toast[]>([]);

  show(message: string, type: ToastType = 'success', duration = 3500, image?: string) {
    const id = ++this.counter;
    this.toasts.update((t) => [...t, { id, message, type, image }]);
    setTimeout(() => this.dismiss(id), duration);
  }

  success(message: string, duration?: number, image?: string) { this.show(message, 'success', duration, image); }
  error(message: string)   { this.show(message, 'error'); }
  info(message: string)    { this.show(message, 'info'); }
  warning(message: string) { this.show(message, 'warning'); }

  dismiss(id: number) {
    this.toasts.update((t) => t.filter((toast) => toast.id !== id));
  }
}
