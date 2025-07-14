import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from './base.service';
import { Complaint } from '../models/complaints-incidents.models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ComplaintsService extends BaseService<Complaint> {
  constructor(http: HttpClient) {
    super(http, 'complaints');
  }

  getComplaintsByUser(userId: string): Observable<Complaint[]> {
    return this.http.get<Complaint[]>(`${this.apiUrl}/user/${userId}`);
  }

  getComplaintsByStatus(status: string): Observable<Complaint[]> {
    return this.http.get<Complaint[]>(`${this.apiUrl}/status/${status}`);
  }
}