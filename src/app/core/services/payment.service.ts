import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Payment, PaymentCreate, PaymentUpdate } from '../models/payment.model';

interface ApiResponse<T> {
  status: boolean;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = 'http://localhost:8083/api/v1/payments';
  private userApiUrl = 'https://vg-ms-users-authentication-production.up.railway.app/api/v1/users/all';
  private organizationApiUrl = 'https://vg-ms-organizations-production.up.railway.app/api/organizations';

  constructor(private http: HttpClient) {}

  getAllPayments(): Observable<Payment[]> {
    return this.http.get<ApiResponse<Payment[]>>(this.apiUrl).pipe(
      map(response => response.data)
    );
  }

  getById(id: string): Observable<Payment> {
    return this.http.get<ApiResponse<Payment>>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.data)
    );
  }

  create(payment: PaymentCreate): Observable<any> {
    return this.http.post<ApiResponse<PaymentCreate>>(this.apiUrl, payment).pipe(
      map(response => response.data)
    );
  }

  update(id: string, payment: PaymentUpdate): Observable<any> {
    return this.http.put<ApiResponse<Payment>>(`${this.apiUrl}/${id}`, payment).pipe(
      map(response => response.data)
    );
  }


  getUserById(userId: string): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.userApiUrl}/${userId}`).pipe(
      map(response => response.data)
    );
  }

  getAllUsers(): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.userApiUrl}`).pipe(
      map(response => response.data)
    );
  }

  getOrganizationById(id: string): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.organizationApiUrl}/${id}`);
  }

}
