import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from './base.service';
import { IncidentResolution } from '../models/complaints-incidents.models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IncidentResolutionsService extends BaseService<IncidentResolution> {
  constructor(http: HttpClient) {
    super(http, 'incident-resolutions');
  }

  getResolutionsByIncident(incidentId: string): Observable<IncidentResolution[]> {
    return this.http.get<IncidentResolution[]>(`${this.apiUrl}/incident/${incidentId}`);
  }
} 