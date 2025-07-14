import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from './base.service';
import { ComplaintResponse } from '../models/complaints-incidents.models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ComplaintResponsesService extends BaseService<ComplaintResponse> {
  constructor(http: HttpClient) {
    super(http, 'complaint-responses');
  }

  getResponsesByComplaint(complaintId: string): Observable<ComplaintResponse[]> {
    return this.http.get<ComplaintResponse[]>(`${this.apiUrl}/complaint/${complaintId}`);
  }

  getResponsesByUser(userId: string): Observable<ComplaintResponse[]> {
    return this.http.get<ComplaintResponse[]>(`${this.apiUrl}/user/${userId}`);
  }
} 