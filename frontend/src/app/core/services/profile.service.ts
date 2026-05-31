import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

export interface AddressPayload {
  type: 'home' | 'office' | 'other';
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly apiUrl = 'http://localhost:3000/api/profile';

  constructor(private http: HttpClient) {}

  getProfile(): Observable<any> {
    return this.http.get<{ user: any }>(this.apiUrl).pipe(map((res) => res.user));
  }

  updateProfile(payload: { name?: string; phone?: string }): Observable<any> {
    return this.http.patch<{ user: any }>(this.apiUrl, payload).pipe(map((res) => res.user));
  }

  getAddresses(): Observable<any[]> {
    return this.http.get<{ addresses: any[] }>(`${this.apiUrl}/addresses`).pipe(
      map((res) => res.addresses || [])
    );
  }

  addAddress(payload: AddressPayload): Observable<any> {
    return this.http.post<{ address: any }>(`${this.apiUrl}/addresses`, payload).pipe(
      map((res) => res.address)
    );
  }

  updateAddress(id: string, payload: AddressPayload): Observable<any> {
    return this.http.patch<{ address: any }>(`${this.apiUrl}/addresses/${id}`, payload).pipe(
      map((res) => res.address)
    );
  }

  deleteAddress(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/addresses/${id}`);
  }

  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/password`, { currentPassword, newPassword });
  }
}
