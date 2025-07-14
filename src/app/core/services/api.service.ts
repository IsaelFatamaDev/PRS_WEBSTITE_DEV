import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse, ApiError } from '../models/common.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = environment.apiUrl || 'http://localhost:8080/api/v1';

  constructor(private http: HttpClient) { }

  /**
   * Headers comunes para las peticiones
   */
  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const token = localStorage.getItem('token');
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  /**
   * Manejo de errores común
   */
  private handleError(error: any): Observable<never> {
    console.error('API Error:', error);

    if (error.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
    }

    return throwError(() => error);
  }

  /**
   * GET request
   */
  get<T>(endpoint: string, params?: HttpParams): Observable<T> {
    return this.http.get<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, {
      headers: this.getHeaders(),
      params
    }).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  /**
   * POST request
   */
  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, data, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  /**
   * PUT request
   */
  put<T>(endpoint: string, data: any): Observable<T> {
    return this.http.put<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, data, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  /**
   * PATCH request
   */
  patch<T>(endpoint: string, data: any): Observable<T> {
    return this.http.patch<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, data, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  /**
   * DELETE request
   */
  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  /**
   * POST request que devuelve la respuesta completa (para login)
   */
  postWithFullResponse<T>(endpoint: string, data: any): Observable<ApiResponse<T>> {
    return this.http.post<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, data, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * GET request que devuelve la respuesta completa
   */
  getWithFullResponse<T>(endpoint: string, params?: HttpParams): Observable<ApiResponse<T>> {
    return this.http.get<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, {
      headers: this.getHeaders(),
      params
    }).pipe(
      catchError(this.handleError)
    );
  }

    // Methods for infrastructure microservice (direct response without ApiResponse wrapper)
  
  /**
   * GET request with full URL for infrastructure microservice (direct response)
   */
  getInfrastructureDirect<T>(fullUrl: string, params?: HttpParams): Observable<T> {
    return this.http.get<T>(fullUrl, {
      headers: this.getHeaders(),
      params
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * POST request with full URL for infrastructure microservice (direct response)
   */
  postInfrastructureDirect<T>(fullUrl: string, data: any): Observable<T> {
    return this.http.post<T>(fullUrl, data, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * PUT request with full URL for infrastructure microservice (direct response)
   */
  putInfrastructureDirect<T>(fullUrl: string, data: any): Observable<T> {
    return this.http.put<T>(fullUrl, data, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * PATCH request with full URL for infrastructure microservice (direct response)
   */
  patchInfrastructureDirect<T>(fullUrl: string, data: any): Observable<T> {
    return this.http.patch<T>(fullUrl, data, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * DELETE request with full URL for infrastructure microservice (direct response)
   */
  deleteInfrastructureDirect<T>(fullUrl: string): Observable<T> {
    return this.http.delete<T>(fullUrl, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }
}
