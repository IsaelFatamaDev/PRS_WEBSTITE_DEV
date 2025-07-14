import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from './base.service';
import { IncidentType } from '../models/complaints-incidents.models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IncidentTypesService extends BaseService<IncidentType> {
  constructor(http: HttpClient) {
    super(http, 'incident-types');
  }

  getActiveTypes(): Observable<IncidentType[]> {
    return this.http.get<IncidentType[]>(`${this.apiUrl}/active`);
  }

  updateStatus(id: string, status: 'ACTIVE' | 'INACTIVE'): Observable<IncidentType> {
    return this.http.patch<IncidentType>(`${this.apiUrl}/${id}/status`, { status });
  }

  // Add any specific methods for incident types here
}