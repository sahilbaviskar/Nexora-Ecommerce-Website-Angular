import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private api = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // Dashboard
  getDashboard(): Observable<any> {
    return this.http.get(`${this.api}/admin/dashboard`);
  }

  // Users
  getUsers(): Observable<any> {
    return this.http.get(`${this.api}/admin/users`);
  }

  // All orders (admin view)
  getAllOrders(): Observable<any> {
    return this.http.get(`${this.api}/admin/orders`);
  }

  updateOrderStatus(id: string, status: string, paymentStatus?: string): Observable<any> {
    const body: any = { status };
    if (paymentStatus) body.paymentStatus = paymentStatus;
    return this.http.patch(`${this.api}/orders/${id}/status`, body);
  }

  // Products
  getProducts(page = 1, limit = 50): Observable<any> {
    return this.http.get(`${this.api}/products?page=${page}&limit=${limit}`);
  }

  createProduct(data: any): Observable<any> {
    return this.http.post(`${this.api}/products`, data);
  }

  updateProduct(productId: number, data: any): Observable<any> {
    return this.http.put(`${this.api}/products/${productId}`, data);
  }

  deleteProduct(productId: number): Observable<any> {
    return this.http.delete(`${this.api}/products/${productId}`);
  }

  // Reports
  getReports(): Observable<any> {
    return this.http.get(`${this.api}/admin/reports`);
  }

  // Bulk actions
  bulkDeleteProducts(productIds: number[]): Observable<any> {
    return this.http.delete(`${this.api}/products/bulk`, { body: { ids: productIds } });
  }

  bulkUpdateOrderStatus(ids: string[], status: string): Observable<any> {
    return this.http.patch(`${this.api}/orders/bulk-status`, { ids, status });
  }
}
