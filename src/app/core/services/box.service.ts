import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { WaterBox, WaterBoxAssignment, WaterBoxTransfer } from '../models/box.model';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

export interface UserClient {
  id: string;
  username: string;
}

@Injectable({
  providedIn: 'root'
})
export class BoxService {
private infraBase = (environment.infrastructureApiUrl || '').replace(/\/+$/, '');
private waterBoxBaseUrl = `${this.infraBase}/water-boxes`;
private waterBoxAssignmentBaseUrl = `${this.infraBase}/water-box-assignments`;
private waterBoxTransferBaseUrl = `${this.infraBase}/water-box-transfers`;

  private userClientApiUrl = 'https://lab.vallegrande.edu.pe/jass/ms-user/api/v1/users/role/CLIENT';
  private userBaseUrl = 'https://lab.vallegrande.edu.pe/jass/ms-user/api/v1';

  constructor(private api: ApiService, private http: HttpClient) { }
  getClients(): Observable<UserClient[]> {
    return this.http.get<any>(this.userClientApiUrl).pipe(
      map(res => {
        console.log('Respuesta de la API de usuarios:', res); // Registro de depuración
        return (res.data || []).map((u: any) => ({ id: u.id, username: u.username }));
      })
    );
  }

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

  // Obtener asignaciones por ID de caja (combina activas e inactivas y filtra por waterBoxId)
  getWaterBoxAssignmentsByBoxId(waterBoxId: number): Observable<WaterBoxAssignment[]> {
    return forkJoin([
      this.getAllActiveWaterBoxAssignments(),
      this.getAllInactiveWaterBoxAssignments()
    ]).pipe(
      map(([active, inactive]) => [...active, ...inactive].filter(a => a.waterBoxId === waterBoxId))
    );
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

  // --- Helpers para enriquecer transferencias ---
  /**
   * Obtener usuario básico por ID desde ms-user (usa llamada directa con token)
   */
  getUserBasicById(userId: string): Observable<UserClient> {
    const url = `${this.userBaseUrl}/auth/token/user/${userId}`;
    return this.api.getInfrastructureDirect<any>(url).pipe(
      map((res: any) => {
        const d = (res && (res.data ?? res)) || {};
        const username = d.username || d.fullName || d.name || 'Usuario desconocido';
        return { id: d.id || userId, username } as UserClient;
      }),
      catchError(() => of({ id: userId, username: 'Usuario desconocido' } as UserClient))
    );
  }

  /** Obtener asignaciones por IDs y devolver un Map id -> asignación */
  getAssignmentsByIds(ids: number[]): Observable<Map<number, WaterBoxAssignment>> {
    const unique = Array.from(new Set(ids.filter((v) => v != null)));
    if (unique.length === 0) {
      return new Observable<Map<number, WaterBoxAssignment>>((obs) => { obs.next(new Map()); obs.complete(); });
    }
    return forkJoin(unique.map((id) => this.getWaterBoxAssignmentById(id).pipe(catchError(() => of(null as unknown as WaterBoxAssignment))))).pipe(
      map((assignments) => new Map(assignments.filter(a => !!a).map((a) => [a.id, a])))
    );
  }

  /** Obtener usuarios por IDs y devolver un Map userId -> username */
  getUsersByIds(userIds: string[]): Observable<Map<string, string>> {
    const unique = Array.from(new Set(userIds.filter((v) => !!v)));
    if (unique.length === 0) {
      return new Observable<Map<string, string>>((obs) => { obs.next(new Map()); obs.complete(); });
    }
    return forkJoin(unique.map((id) => this.getUserBasicById(id).pipe(catchError(() => of({ id, username: 'Usuario desconocido' } as UserClient))))).pipe(
      map((users) => new Map(users.map((u) => [u.id, u.username])))
    );
  }
}
