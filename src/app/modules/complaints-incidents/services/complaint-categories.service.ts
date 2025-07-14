import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from './base.service';
import { ComplaintCategory } from '../models/complaints-incidents.models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ComplaintCategoriesService extends BaseService<ComplaintCategory> {
  constructor(http: HttpClient) {
    super(http, 'complaint-categories');
  }

  // Add any specific methods for complaint categories here
} 