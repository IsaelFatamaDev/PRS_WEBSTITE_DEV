import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface ReniecPersonalData {
     firstName: string;
     firstLastName: string;
     secondLastName: string;
     lastName: string; // Apellidos completos concatenados
     fullName: string;
     documentNumber: string;
     generatedUsername: string;
}

export interface ReniecApiResponse {
     status: boolean;
     data?: ReniecPersonalData;
     message?: string;
     error?: any;
}

@Injectable({
     providedIn: 'root'
})
export class ReniecService {

     constructor(private http: HttpClient) { }

     /**
      * Consulta los datos de una persona por DNI en RENIEC
      * @param dni Número de DNI de 8 dígitos
      * @returns Observable con los datos de la persona
      */
     getPersonalDataByDni(dni: string): Observable<ReniecPersonalData> {
          // Validar formato de DNI antes de enviar
          if (!this.isValidDni(dni)) {
               return throwError(() => new Error('El DNI debe tener exactamente 8 dígitos'));
          }

          const url = `${environment.reniecApiUrl}/${dni.trim()}`;

          return this.http.get<ReniecApiResponse>(url).pipe(
               map(response => {
                    if (response.status && response.data) {
                         return response.data;
                    } else {
                         throw new Error(response.message || 'No se encontraron datos para el DNI proporcionado');
                    }
               }),
               catchError(error => {
                    console.error('Error consultando RENIEC:', error);

                    let errorMessage = 'Error al consultar datos de RENIEC';

                    if (error.status === 400) {
                         errorMessage = 'DNI inválido o con formato incorrecto';
                    } else if (error.status === 404) {
                         errorMessage = 'No se encontraron datos para el DNI proporcionado';
                    } else if (error.status === 503) {
                         errorMessage = 'Servicio de RENIEC no disponible temporalmente';
                    } else if (error.error?.message) {
                         errorMessage = error.error.message;
                    }

                    return throwError(() => new Error(errorMessage));
               })
          );
     }

     /**
      * Valida si el DNI tiene el formato correcto
      * @param dni DNI a validar
      * @returns true si es válido, false caso contrario
      */
     private isValidDni(dni: string): boolean {
          return /^\d{8}$/.test(dni?.trim() || '');
     }

     /**
      * Genera username basado en nombre y apellido
      * Formato: Primera letra del nombre + Primer apellido
      * Ejemplo: Isael Fatama -> IFatama
      * @param firstName Nombre
      * @param lastName Apellido
      * @returns Username generado
      */
     generateUsername(firstName: string, lastName: string): string {
          if (!firstName?.trim() || !lastName?.trim()) {
               throw new Error('Nombre y apellido son requeridos para generar el username');
          }

          const cleanFirstName = firstName.trim().toUpperCase();
          const firstLetter = cleanFirstName.charAt(0);

          const cleanLastName = lastName.trim().toLowerCase();
          const capitalizedLastName = cleanLastName.charAt(0).toUpperCase() + cleanLastName.slice(1);

          return firstLetter + capitalizedLastName;
     }
}
