import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export const ENDPOINT_TOKEN = 'ENDPOINT_TOKEN';

@Injectable({
  providedIn: 'root'
})
export class BaseService<T> {
  protected apiUrl: string;
  protected headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  constructor(
    protected http: HttpClient,
    @Inject(ENDPOINT_TOKEN) protected endpoint: string
  ) {
    this.apiUrl = `${environment.complaintsIncidentsApiUrl}/${endpoint}`;
  }

  getAll(): Observable<T[]> {
    return this.http.get<T[]>(this.apiUrl);
  }

  getById(id: string): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}/${id}`);
  }

  create(item: T): Observable<T> {
    console.log('BaseService.create - URL:', this.apiUrl);
    console.log('BaseService.create - Headers:', this.headers);
    console.log('BaseService.create - Data:', item);
    return this.http.post<T>(this.apiUrl, item, { headers: this.headers });
  }

  update(id: string, item: T): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}/${id}`, item, { headers: this.headers });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
} 