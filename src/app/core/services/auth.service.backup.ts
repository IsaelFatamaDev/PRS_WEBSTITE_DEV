import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import {
  AuthUser,
  AuthResponse,
  LoginRequest,
  LoginResponse,
  TokenValidationResponse,
  UserRole
} from '../models/auth.model';
import { UserResponseDTO, RolesUsers } from '../models/user.model';
import { ApiService } from './api.service';
import { StorageService } from './storage.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  constructor(
    private apiService: ApiService,
    private storageService: StorageService
  ) {
    this.loadUserFromStorage();
  }
  /**
   * Cargar usuario desde StorageService al inicializar
   */
  private loadUserFromStorage(): void {
    const savedUser = this.storageService.getCurrentUser();
    const token = this.storageService.getToken();

    if (savedUser && token) {
      this.currentUserSubject.next(savedUser);
    }
  }/**
   * Iniciar sesión con credenciales
   */
  login(username: string, password: string): Observable<AuthResponse> {
    const loginRequest: LoginRequest = { username, password };

    return this.apiService.post<LoginResponse['data']>('/auth/login', loginRequest)
      .pipe(
        switchMap(responseData => {
          console.log('Login response data:', responseData); if (responseData && responseData.accessToken) {
            // Guardar AMBOS tokens usando StorageService
            this.storageService.setToken(responseData.accessToken);
            this.storageService.setRefreshToken(responseData.refreshToken);

            const authUser: AuthUser = {
              id: responseData.userId,
              username: responseData.username,
              email: '',
              roles: responseData.roles,
              organizationId: null,
              fullName: responseData.fullName,
              userCode: ''
            };            if (responseData.roles.includes(RolesUsers.ADMIN) || responseData.roles.includes(RolesUsers.SUPER_ADMIN)) {
              return this.getUserFullInfo(responseData.userId).pipe(
                map(userInfo => {
                  authUser.email = userInfo.email || '';
                  authUser.organizationId = userInfo.organizationId;
                  authUser.userCode = userInfo.userCode;

                  this.storageService.setCurrentUser(authUser);
                  this.storageService.setUserRole(authUser.roles[0] || 'USER');
                  if (authUser.organizationId) {
                    this.storageService.setOrganizationId(authUser.organizationId);
                  }
                  this.currentUserSubject.next(authUser);

                  const authResponse: AuthResponse = {
                    user: authUser,
                    token: responseData.accessToken,
                    refreshToken: responseData.refreshToken,
                    expiresIn: responseData.expiresIn
                  };

                  return authResponse;
                }),
                catchError(error => {
                  console.warn('No se pudo obtener información adicional del usuario, continuando con datos básicos:', error);

                  this.storageService.setCurrentUser(authUser);
                  this.storageService.setUserRole(authUser.roles[0] || 'USER');
                  this.currentUserSubject.next(authUser);

                  const authResponse: AuthResponse = {
                    user: authUser,
                    token: responseData.accessToken,
                    refreshToken: responseData.refreshToken,
                    expiresIn: responseData.expiresIn
                  };

                  return of(authResponse);
                })
              );
            } else {
              this.storageService.setCurrentUser(authUser);
              this.storageService.setUserRole(authUser.roles[0] || 'USER');
              this.currentUserSubject.next(authUser);
                    user: authUser,
                    token: responseData.accessToken,
                    refreshToken: responseData.refreshToken,
                    expiresIn: responseData.expiresIn
                  }; return of(authResponse);
                })
              );
            } else {
              localStorage.setItem('currentUser', JSON.stringify(authUser));
              this.currentUserSubject.next(authUser);

              const authResponse: AuthResponse = {
                user: authUser,
                token: responseData.accessToken,
                refreshToken: responseData.refreshToken,
                expiresIn: responseData.expiresIn
              };

              return of(authResponse);
            }
          } else {
            throw new Error('Respuesta de login inválida');
          }
        }),
        catchError(error => {
          console.error('Login error:', error);
          return throwError(() => new Error(error.error?.message || 'Error de autenticación'));
        })
      );
  }

  /**
   * Obtener información completa del usuario por ID
   */
  private getUserFullInfo(userId: string): Observable<UserResponseDTO> {
    return this.apiService.get<UserResponseDTO>(`/users/${userId}`);
  }
  /**
   * Cerrar sesión
   */
  logout(): Observable<any> {
    this.clearLocalData();

    return this.apiService.postWithFullResponse('/auth/logout', {}).pipe(
      catchError(error => {
        console.warn('Error en logout remoto:', error);
        return of({ success: true });
      }),
      map(() => ({ success: true }))
    );
  }

  /**
   * Cerrar sesión local (sin llamar al servidor)
   */
  logoutLocal(): void {
    this.clearLocalData();
  }

  /**
   * Limpiar datos locales
   */
  private clearLocalData(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value && !!localStorage.getItem('token');
  }

  /**
   * Verificar si el usuario está logueado
   */
  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  /**
   * Verificar si el usuario tiene un rol específico
   */
  hasRole(role: RolesUsers): boolean {
    const currentUser = this.currentUserSubject.value;
    return currentUser?.roles.includes(role) || false;
  }

  /**
   * Verificar si el usuario tiene alguno de los roles especificados
   */
  hasAnyRole(roles: RolesUsers[]): boolean {
    const currentUser = this.currentUserSubject.value;
    if (!currentUser) return false;

    return roles.some(role => currentUser.roles.includes(role));
  }

  /**
   * Obtener usuario actual
   */
  getCurrentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  /**
   * Obtener ID de la organización del usuario actual
   */
  getCurrentOrganizationId(): string | null {
    const currentUser = this.currentUserSubject.value;
    return currentUser?.organizationId || null;
  }

  /**
   * Validar token actual
   */
  validateToken(): Observable<boolean> {
    const token = localStorage.getItem('token');
    if (!token) {
      return throwError(() => new Error('No token found'));
    }

    return this.apiService.getWithFullResponse<TokenValidationResponse['data']>('/auth/validate-token')
      .pipe(
        map(response => {
          if (response.success && response.data?.valid) {
            return true;
          } else {
            this.logout();
            return false;
          }
        }),
        catchError(error => {
          console.error('Token validation error:', error);
          this.logout();
          return throwError(() => error);
        })
      );
  }

  /**
   * Refrescar token
   */
  refreshToken(): Observable<string> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token found'));
    }

    return this.apiService.postWithFullResponse<{ accessToken: string; expiresIn: number }>('/auth/refresh-token', {
      refreshToken
    }).pipe(
      map(response => {
        if (response.success && response.data) {
          localStorage.setItem('token', response.data.accessToken);
          return response.data.accessToken;
        } else {
          throw new Error('Failed to refresh token');
        }
      }),
      catchError(error => {
        console.error('Token refresh error:', error);
        this.logout();
        return throwError(() => error);
      })
    );
  }

  /**
   * Verificar si el usuario es administrador
   */
  isAdmin(): boolean {
    return this.hasRole(RolesUsers.ADMIN);
  }

  /**
   * Verificar si el usuario es super administrador
   */
  isSuperAdmin(): boolean {
    return this.hasRole(RolesUsers.SUPER_ADMIN);
  }

  /**
   * Verificar si el usuario es cliente
   */
  isClient(): boolean {
    return this.hasRole(RolesUsers.CLIENT);
  }

  /**
   * Verificar si el usuario tiene permisos de administración
   */
  hasAdminPermissions(): boolean {
    return this.hasAnyRole([RolesUsers.ADMIN, RolesUsers.SUPER_ADMIN]);
  }

  /**
   * Establecer el rol activo del usuario
   */
  setActiveRole(role: RolesUsers): void {
    const currentUser = this.currentUserSubject.value;
    if (!currentUser || !currentUser.roles.includes(role)) {
      throw new Error('El usuario no tiene el rol especificado');
    }

    const updatedUser: AuthUser = {
      ...currentUser,
      activeRole: role
    };

    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    this.currentUserSubject.next(updatedUser);
  }

  /**
   * Obtener el rol activo del usuario
   */
  getActiveRole(): RolesUsers | null {
    const currentUser = this.currentUserSubject.value;
    return currentUser?.activeRole || null;
  }
  /**
   * Verificar si el usuario tiene múltiples roles
   */
  hasMultipleRoles(): boolean {
    const currentUser = this.currentUserSubject.value;
    return (currentUser?.roles && currentUser.roles.length > 1) || false;
  }

  /**
   * Obtener los roles disponibles para selección (ADMIN y CLIENT)
   */
  getSelectableRoles(): RolesUsers[] {
    const currentUser = this.currentUserSubject.value;
    if (!currentUser) return [];

    return currentUser.roles.filter(role =>
      role === RolesUsers.ADMIN || role === RolesUsers.CLIENT
    );
  }

  /**
   * Verificar si el usuario necesita seleccionar un rol
   */
  needsRoleSelection(): boolean {
    const selectableRoles = this.getSelectableRoles();
    const currentUser = this.currentUserSubject.value;

    return selectableRoles.length > 1 && !currentUser?.activeRole;
  }
}
