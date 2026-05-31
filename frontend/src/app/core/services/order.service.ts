import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

export interface PlaceOrderPayload {
  paymentMethod: 'COD' | 'CARD' | 'UPI';
  shippingAddress: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly apiUrl = 'http://localhost:3000/api/orders';

  constructor(private http: HttpClient) {}

  placeOrder(payload: PlaceOrderPayload): Observable<any> {
    return this.http.post<any>(this.apiUrl, payload);
  }

  getMyOrders(): Observable<any[]> {
    return this.http.get<{ orders: any[] }>(this.apiUrl).pipe(
      map((res) => res.orders || [])
    );
  }
}
