import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { OrganizationService } from './organization.service';
import { createDaily_records, dayliRecors, QualityIncident, QualityIncidentCreateRequest, QualityIncidentUpdateRequest, QualityTest, QualityTestUpdateRequest, testing_points, UpdateDaily_records } from '../models/water-quality.model';
import { environment } from '../../../environments/environment';
import { organization } from '../models/organization.model';
interface ApiResponse<T> {
  status: boolean;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class WaterQualityService {

  private apiUrl = environment
  

  constructor(private http:HttpClient, private organizationService:OrganizationService) 
  { }

  // Listado de las organizaciones 
    getOrganizationById(id: string) {
      return this.http.get<organization>(`${this.apiUrl.organizations}/${id}`);
    }
    
  getPointstById(id: string): Observable<testing_points> {
      return this.http.get<ApiResponse<testing_points>>(`${this.apiUrl.testingPoint}/${id}`).pipe(
        map(response => response.data)
      );
    }

  getAllTestingPoints(): Observable<testing_points[]> {
    return this.http.get<ApiResponse<testing_points[]>>(this.apiUrl.testingPoint).pipe(
      map(response => response.data)
    );
  }

  createTestingPoint(point: any): Observable<testing_points> {
    return this.http.post<ApiResponse<testing_points>>(this.apiUrl.testingPoint, point).pipe(
      map(response => response.data)
    );
  }

  updateTestingPoint(id: string, point: any): Observable<testing_points> {
    return this.http.put<ApiResponse<testing_points>>(`${this.apiUrl.testingPoint}/${id}`, point).pipe(
      map(response => response.data)
    );
  }
  deleteTestingPoint(id: string): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.apiUrl.testingPoint}/${id}/deactivate`, {});
  }
  
  restoreTestingPoint(id: string): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.apiUrl.testingPoint}/${id}/activate`, {});
  }
  
  getAllChlorine(){
    return this.http.get<ApiResponse<dayliRecors[]>>(this.apiUrl.dailyRecords).pipe(
          map(response => response.data)
        );
  }

    getChlorineById(id: string): Observable<dayliRecors> {
      return this.http.get<ApiResponse<dayliRecors>>(`${this.apiUrl.dailyRecords}/${id}`).pipe(
        map(response => response.data)
      );
    }

     createChlorine(chlorine: createDaily_records): Observable<dayliRecors> {
        return this.http.post<ApiResponse<dayliRecors>>(this.apiUrl.dailyRecords, chlorine).pipe(
          map(response => response.data)
        );
      }
    
          
  // Lo correcto en el service:
updateChlorine(id: string, chlorine: UpdateDaily_records): Observable<dayliRecors> {
  // Primero obtenemos el registro actual
  return new Observable<dayliRecors>(observer => {
    this.getChlorineById(id).subscribe({
      next: (currentChlorine) => {
        // Combinamos el registro actual con los campos modificados
        const updateChlorine = {
          ...currentChlorine,
          ...chlorine
        };
        
        console.log('Registro actual:', currentChlorine);
        console.log('Campos a actualizar:', chlorine);
        console.log('recordType en campos a actualizar:', chlorine.recordType);
        console.log('Datos combinados para enviar:', updateChlorine);
        console.log('recordType en datos combinados:', updateChlorine.recordType);
        console.log('URL de actualización:', `${this.apiUrl.dailyRecords}/${id}`);
        
        // Enviamos la actualización
        this.http.put<ApiResponse<dayliRecors>>(`${this.apiUrl.dailyRecords}/${id}`, updateChlorine)
          .subscribe({
            next: (response) => {
              console.log('Respuesta del servidor:', response);
              console.log('Datos de respuesta:', response.data);
              console.log('recordType en respuesta:', response.data?.recordType);
              observer.next(response.data);
            },
            error: (error) => {
              console.error('Error del servidor:', error);
              observer.error(error);
            },
            complete: () => observer.complete()
          });
      },
      error: (error) => observer.error(error)
    });
  });
}


      deleteChlorine(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl.dailyRecords}/${id}`);
      }
      // QualityTest

      getAllTest(){
        return this.http.get<ApiResponse<QualityTest[]>>(this.apiUrl.qualityTest).pipe(
              map(response => response.data)
            );
      }

      getTestById(id: string) {
        return this.http.get<ApiResponse<QualityTest>>(`${this.apiUrl.qualityTest}/${id}`).pipe(
          map(response => response.data)
        );
      }
      
      createTest(test: QualityTest): Observable<QualityTest> {
        return this.http.post<ApiResponse<QualityTest>>(this.apiUrl.qualityTest, test).pipe(
          map(response => response.data)
        );
      }
      
      updateTest(id: string, test: QualityTestUpdateRequest): Observable<QualityTest> {
        // Primero obtenemos el registro actual
        return new Observable<QualityTest>(observer => {
          this.getTestById(id).subscribe({
            next: (currentTest) => {
              // Combinamos el registro actual con los campos modificados
              const updateTest = {
                ...currentTest,
                ...test
              };
              
              // Enviamos la actualización
              this.http.put<ApiResponse<QualityTest>>(`${this.apiUrl.qualityTest}/${id}`, updateTest)
                .subscribe({
                  next: (response) => observer.next(response.data),
                  error: (error) => observer.error(error),
                  complete: () => observer.complete()
                });
            },
            error: (error) => observer.error(error)
          });
        });
      }

      // QualityIncident(version eliminate logic)

      getAllIncident(){
        return this.http.get<ApiResponse<QualityIncident[]>>(this.apiUrl.qualityTest).pipe(
          map(response => response.data)
        );
      }
      
      getIncidentById(id: string){
        return this.http.get<ApiResponse<QualityIncident>>(`${this.apiUrl.qualityTest}/${id}`).pipe(
          map(response => response.data)
        );
      }
      
      createIncident(incident: QualityIncidentCreateRequest): Observable<QualityIncident> {
        return this.http.post<ApiResponse<QualityIncident>>(this.apiUrl.qualityTest, incident).pipe(
          map(response => response.data)
        );
      }
      
      updateIncident(id: string, incident: QualityIncidentUpdateRequest): Observable<QualityIncident> {
        return new Observable<QualityIncident>(observer => {
          this.getIncidentById(id).subscribe({
            next: (currentIncident) => {
              const updatedIncident = {
                ...currentIncident,
                ...incident
              };
              this.http.put<ApiResponse<QualityIncident>>(`${this.apiUrl.qualityTest}/${id}`, updatedIncident)
                .subscribe({
                  next: (response) => observer.next(response.data),
                  error: (error) => observer.error(error),
                  complete: () => observer.complete()
                });
            },
            error: (error) => observer.error(error)
          });
        });
      }

        }
