import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { organization, organizationCreate, organizationUpdate, zones, zonesCreate, zonesUpdate, street, streetCreate, streetUpdate } from '../models/organization.model';
import { environment } from '../../../environments/environment';

interface ApiResponse<T> {
  status: boolean,
  data: T
}

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  // Url de las apis organizations
  private apiUrl = environment

  constructor(private http: HttpClient) { }

  getAllOrganization() {
    return this.http.get<ApiResponse<organization[]>>(this.apiUrl.organizations).pipe(
      map(response => response.data)
    );
  }

  getOrganizationById(id: string) {
    return this.http.get<ApiResponse<organization>>(`${this.apiUrl.organizations}/${id}`).pipe(
      map(response => response.data)
    );
  }


  createOrganization(organization: organizationCreate): Observable<organization> {
    return this.http.post<ApiResponse<organization>>(this.apiUrl.organizations, organization).pipe(
      map(response => response.data)
    );
  }

  updateOrganization(id: string, client: organizationUpdate): Observable<organization> {
    return this.http.put<ApiResponse<organization>>(`${this.apiUrl.organizations}/${id}`, client).pipe(
      map(response => response.data)
    );
  }


  deleteOrganization(id: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl.organizations}/delete/${id}`, {}).pipe(
      map(response => response.data)
    );
  }

  restoreOrganization(id: string): Observable<void> {
    return this.http.patch<ApiResponse<void>>(`${this.apiUrl.organizations}/restore/${id}`, {}).pipe(
      map(response => response.data)
    );
  }

  // Metode zones

  getAllZones() {
    return this.http.get<ApiResponse<zones[]>>(this.apiUrl.zonas).pipe(
      map(response => response.data)
    );
  }

  getZoneById(id: string) {
    return this.http.get<ApiResponse<zones>>(`${this.apiUrl.zonas}/${id}`).pipe(
      map(response => response.data)
    );
  }

  createZones(zone: zonesCreate): Observable<zones> {
    return this.http.post<ApiResponse<zones>>(this.apiUrl.zonas, zone).pipe(
      map(response => response.data)
    );
  }

  updateZones(id: string, zone: zonesUpdate): Observable<zones> {
    return this.http.put<ApiResponse<zones>>(`${this.apiUrl.zonas}/${id}`, zone).pipe(
      map(response => response.data)
    );
  }

  deleteZones(id: string): Observable<void> {
    return this.http.patch<ApiResponse<void>>(`${this.apiUrl.zonas}/delete/${id}`, {}).pipe(
      map(response => response.data)
    );
  }

  restoreZones(id: string): Observable<void> {
    return this.http.patch<ApiResponse<void>>(`${this.apiUrl.zonas}/restore/${id}`, {}).pipe(
      map(response => response.data)
    );
  }

  // Metode Street
  getAllStreet() {
    return this.http.get<ApiResponse<street[]>>(this.apiUrl.street).pipe(
      map(response => {
        console.log('🔍 Respuesta streets API:', response);
        return response.data || [];
      })
    );
  }

  getStreetById(id: string) {
    return this.http.get<ApiResponse<street>>(`${this.apiUrl.street}/${id}`).pipe(
      map(response => response.data)
    );
  }

  createStreet(streetData: streetCreate): Observable<street> {
    return this.http.post<ApiResponse<street>>(this.apiUrl.street, streetData).pipe(
      map(response => response.data)
    );
  }

  updateStreet(id: string, streetData: streetUpdate): Observable<street> {
    return this.http.put<ApiResponse<street>>(`${this.apiUrl.street}/${id}`, streetData).pipe(
      map(response => response.data)
    );
  }

  deleteStreet(id: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl.street}/delete/${id}`, {}).pipe(
      map(response => response.data)
    );
  }

  restoreStreet(id: string): Observable<void> {
    return this.http.patch<ApiResponse<void>>(`${this.apiUrl.street}/restore/${id}`, {}).pipe(
      map(response => response.data)
    );
  }

}
