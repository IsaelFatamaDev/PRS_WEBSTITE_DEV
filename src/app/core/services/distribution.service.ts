import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { fares, faresCreate, faresUpdate, schedules, schedulesCreate, schedulesUpdate, routes } from '../models/distribution.model';
import { map, Observable } from 'rxjs';

interface ApiResponse<T> {
  status: boolean,
  data: T
}

@Injectable({
  providedIn: 'root'
})
export class DistributionService {
  getZones() {
    throw new Error('Method not implemented.');
  }
 getAllFares(): Observable<fares[]> {
  return this.getAllF(); // ← usa internamente el método ya existente
}

  // Url de las apis distributions
  private apiFares = "https://vg-ms-distribution-production.up.railway.app/api/v2/fare";
  private apiSchedules = "https://vg-ms-distribution-production.up.railway.app/api/v2/schedules";
  private apiRoutes = "https://vg-ms-distribution-production.up.railway.app/api/v2/routes"
  constructor(private http: HttpClient) { }


  // MÉTODOS DE FARES

getAllF(): Observable<fares[]> {
  return this.http.get<ApiResponse<fares[]>>(this.apiFares).pipe(
    map(response => response.data) // ✅ aquí ya devuelves solo el array
  );
}

getAllActiveF(): Observable<fares[]> {
  return this.http.get<ApiResponse<fares[]>>(`${this.apiFares}/active`).pipe(
    map(response => response.data)
  );
}

getAllInactiveF(): Observable<fares[]> {
  return this.http.get<ApiResponse<fares[]>>(`${this.apiFares}/inactive`).pipe(
    map(response => response.data)
  );
}

getByIdF(id: string): Observable<fares> {
  return this.http.get<ApiResponse<fares>>(`${this.apiFares}/${id}`).pipe(
    map(response => response.data)
  );
}

  saveFares(fares: faresCreate): Observable<fares> {
    return this.http.post<ApiResponse<fares>>(this.apiFares, fares).pipe(
      map(response => response.data)
    );
  }

  updateFares(id: string, client: faresUpdate): Observable<fares> {
    return this.http.put<ApiResponse<fares>>(`${this.apiFares}/${id}`, client).pipe(
      map(response => response.data)
    );
  }


  deactivateFares(id: string): Observable<void> {
    return this.http.patch<ApiResponse<void>>(`${this.apiFares}/${id}/deactivate`, {}).pipe(
      map(response => response.data)
    );
  }

  activateFares(id: string): Observable<void> {
    return this.http.patch<ApiResponse<void>>(`${this.apiFares}/${id}/activate`, {}).pipe(
      map(response => response.data)
    );
  }


  // MÉTODOS DE SCHEDULES
getAll(): Observable<schedules[]> {
  return this.http.get<ApiResponse<schedules[]>>(this.apiSchedules).pipe(
    map(res => res.data)
  );
}

  getAllActiveS(): Observable<schedules[]> {
    return this.http.get<schedules[]>(`${this.apiSchedules}/active`);
  }

  getAllInactiveS(): Observable<schedules[]> {
    return this.http.get<schedules[]>(`${this.apiSchedules}/inactive`);
  }

getByIdS(id: string): Observable<schedules> {
  return this.http.get<ApiResponse<schedules>>(`${this.apiSchedules}/${id}`).pipe(
    map(res => res.data)
  );
}

  saveSchedules(schedules: schedulesCreate): Observable<schedules> {
    return this.http.post<ApiResponse<schedules>>(this.apiSchedules, schedules).pipe(
      map(response => response.data)
    );
  }

  updateSchedules(id: string, client: schedulesUpdate): Observable<schedules> {
    return this.http.put<ApiResponse<schedules>>(`${this.apiSchedules}/${id}`, client).pipe(
      map(response => response.data)
    );
  }

  deactivateSchedules(id: string): Observable<void> {
    return this.http.patch<ApiResponse<void>>(`${this.apiSchedules}/${id}/deactivate`, {}).pipe(
      map(response => response.data)
    );
  }

  activateSchedules(id: string): Observable<void> {
    return this.http.patch<ApiResponse<void>>(`${this.apiSchedules}/${id}/activate`, {}).pipe(
      map(response => response.data)
    );
  }

   // MÉTODOS DE ROUTES
 getAllR(): Observable<routes[]> {
  return this.http.get<ApiResponse<routes[]>>(this.apiRoutes).pipe(
    map(response => response.data)
  );
}

getAllActiveR(): Observable<routes[]> {
  return this.http.get<ApiResponse<routes[]>>(`${this.apiRoutes}/active`).pipe(
    map(response => response.data)
  );
}

getAllInactiveR(): Observable<routes[]> {
  return this.http.get<ApiResponse<routes[]>>(`${this.apiRoutes}/inactive`).pipe(
    map(response => response.data)
  );
}

getByIdR(id: string): Observable<routes> {
  return this.http.get<ApiResponse<routes>>(`${this.apiRoutes}/${id}`).pipe(
    map(response => response.data)
  );
}
}
