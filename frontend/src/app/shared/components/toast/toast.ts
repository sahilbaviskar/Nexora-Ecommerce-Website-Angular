import { Component, inject } from '@angular/core';
import { ToastService, Toast } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [],
  templateUrl: './toast.html',
})
export class ToastComponent {
  toastService = inject(ToastService);

  icon(type: Toast['type']): string {
    return {
      success: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>',
      error:   '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
      warning: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M1 21h22L12 2zm12-3h-2v-2h2zm0-4h-2v-4h2z"/></svg>',
      info:    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M11 17h2v-6h-2zm1-15C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8M11 9h2V7h-2z"/></svg>',
    }[type];
  }

  colors(type: Toast['type']): string {
    return {
      success: 'bg-white border-l-4 border-green-500 text-gray-800',
      error:   'bg-white border-l-4 border-red-500 text-gray-800',
      warning: 'bg-white border-l-4 border-orange-400 text-gray-800',
      info:    'bg-white border-l-4 border-blue-500 text-gray-800',
    }[type];
  }

  iconColor(type: Toast['type']): string {
    return {
      success: 'text-green-500',
      error:   'text-red-500',
      warning: 'text-orange-400',
      info:    'text-blue-500',
    }[type];
  }

  trackById(_: number, toast: Toast) { return toast.id; }
}
