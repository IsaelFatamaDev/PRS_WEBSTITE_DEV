import { Injectable } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { WaterBox, WaterBoxAssignment, WaterBoxTransfer } from '../models/box.model';

@Injectable({
  providedIn: 'root'
})
export class BoxService {
  private waterBoxBaseUrl = 'https://vg-ms-infrastructure-production.up.railway.app/api/v1/water-boxes';
  private waterBoxAssignmentBaseUrl = 'https://vg-ms-infrastructure-production.up.railway.app/api/v1/water-box-assignments';
  private waterBoxTransferBaseUrl = 'https://vg-ms-infrastructure-production.up.railway.app/api/v1/water-box-transfers';

  constructor(private api: ApiService) { }

  // WaterBoxService methods
  getAllWaterBoxes(): Observable<WaterBox[]> {
    return forkJoin([
      this.api.getInfrastructureDirect<WaterBox[]>(`${this.waterBoxBaseUrl}/active`),
      this.api.getInfrastructureDirect<WaterBox[]>(`${this.waterBoxBaseUrl}/inactive`)
    ]).pipe(
      map(([active, inactive]) => [...active, ...inactive])
    );
  }

  getAllActiveWaterBoxes(): Observable<WaterBox[]> {
    return this.api.getInfrastructureDirect<WaterBox[]>(`${this.waterBoxBaseUrl}/active`);
  }

  getAllInactiveWaterBoxes(): Observable<WaterBox[]> {
    return this.api.getInfrastructureDirect<WaterBox[]>(`${this.waterBoxBaseUrl}/inactive`);
  }

  getWaterBoxById(id: number): Observable<WaterBox> {
    return this.api.getInfrastructureDirect<WaterBox>(`${this.waterBoxBaseUrl}/${id}`);
  }

  createWaterBox(box: Partial<WaterBox>): Observable<WaterBox> {
    return this.api.postInfrastructureDirect<WaterBox>(this.waterBoxBaseUrl, box);
  }

  updateWaterBox(id: number, box: Partial<WaterBox>): Observable<WaterBox> {
    return this.api.putInfrastructureDirect<WaterBox>(`${this.waterBoxBaseUrl}/${id}`, box);
  }

  deleteWaterBox(id: number): Observable<void> {
    return this.api.deleteInfrastructureDirect<void>(`${this.waterBoxBaseUrl}/${id}`);
  }

  restoreWaterBox(id: number): Observable<WaterBox> {
    return this.api.patchInfrastructureDirect<WaterBox>(`${this.waterBoxBaseUrl}/${id}/restore`, {});
  }

  // WaterBoxAssignmentService methods
  getAllActiveWaterBoxAssignments(): Observable<WaterBoxAssignment[]> {
    return this.api.getInfrastructureDirect<WaterBoxAssignment[]>(`${this.waterBoxAssignmentBaseUrl}/active`);
  }

  getAllInactiveWaterBoxAssignments(): Observable<WaterBoxAssignment[]> {
    return this.api.getInfrastructureDirect<WaterBoxAssignment[]>(`${this.waterBoxAssignmentBaseUrl}/inactive`);
  }

  getWaterBoxAssignmentById(id: number): Observable<WaterBoxAssignment> {
    return this.api.getInfrastructureDirect<WaterBoxAssignment>(`${this.waterBoxAssignmentBaseUrl}/${id}`);
  }

  createWaterBoxAssignment(data: Partial<WaterBoxAssignment>): Observable<WaterBoxAssignment> {
    return this.api.postInfrastructureDirect<WaterBoxAssignment>(this.waterBoxAssignmentBaseUrl, data);
  }

  updateWaterBoxAssignment(id: number, data: Partial<WaterBoxAssignment>): Observable<WaterBoxAssignment> {
    return this.api.putInfrastructureDirect<WaterBoxAssignment>(`${this.waterBoxAssignmentBaseUrl}/${id}`, data);
  }

  deleteWaterBoxAssignment(id: number): Observable<void> {
    return this.api.deleteInfrastructureDirect<void>(`${this.waterBoxAssignmentBaseUrl}/${id}`);
  }

  restoreWaterBoxAssignment(id: number): Observable<WaterBoxAssignment> {
    return this.api.patchInfrastructureDirect<WaterBoxAssignment>(`${this.waterBoxAssignmentBaseUrl}/${id}/restore`, {});
  }

  // WaterBoxTransferService methods
  getAllWaterBoxTransfers(): Observable<WaterBoxTransfer[]> {
    return this.api.getInfrastructureDirect<WaterBoxTransfer[]>(this.waterBoxTransferBaseUrl);
  }

  getWaterBoxTransferById(id: number): Observable<WaterBoxTransfer> {
    return this.api.getInfrastructureDirect<WaterBoxTransfer>(`${this.waterBoxTransferBaseUrl}/${id}`);
  }

  createWaterBoxTransfer(data: Partial<WaterBoxTransfer>): Observable<WaterBoxTransfer> {
    return this.api.postInfrastructureDirect<WaterBoxTransfer>(this.waterBoxTransferBaseUrl, data);
  }

  updateWaterBoxTransfer(id: number, data: Partial<WaterBoxTransfer>): Observable<WaterBoxTransfer> {
    return this.api.putInfrastructureDirect<WaterBoxTransfer>(`${this.waterBoxTransferBaseUrl}/${id}`, data);
  }

  deleteWaterBoxTransfer(id: number): Observable<void> {
    return this.api.deleteInfrastructureDirect<void>(`${this.waterBoxTransferBaseUrl}/${id}`);
  }

  restoreWaterBoxTransfer(id: number): Observable<WaterBoxTransfer> {
    return this.api.patchInfrastructureDirect<WaterBoxTransfer>(`${this.waterBoxTransferBaseUrl}/${id}/restore`, {});
  }
}
