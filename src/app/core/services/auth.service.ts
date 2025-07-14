import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import {
  AuthUser,
  AuthResponse,
  LoginRequest,
  LoginResponse,
  TokenValidationResponse
} from '../models/auth.model';
import { UserResponseDTO, RolesUsers } from '../models/user.model';
import { ApiService } from './api.service';
import { StorageService } from './storage.service';

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
  }

  /**
   * Iniciar sesión con credenciales
   */
  login(username: string, password: string): Observable<AuthResponse> {
    const loginRequest: LoginRequest = { username, password };

    return this.apiService.post<LoginResponse['data']>('/auth/login', loginRequest)
      .pipe(
        switchMap(responseData => {
          console.log('Login response data:', responseData);

          if (responseData && responseData.accessToken) {
            // Guardar tokens usando StorageService
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
            };

            // Verificar si necesita información adicional del usuario (para ADMIN/SUPER_ADMIN)
            if (responseData.roles.includes(RolesUsers.ADMIN) || responseData.roles.includes(RolesUsers.SUPER_ADMIN)) {
              return this.getUserFullInfo(responseData.userId).pipe(
                map(userInfo => {
                  authUser.email = userInfo.email || '';
                  authUser.organizationId = userInfo.organizationId;
                  authUser.userCode = userInfo.userCode;

                  this.saveUserData(authUser);

                  return {
                    user: authUser,
                    token: responseData.accessToken,
                    refreshToken: responseData.refreshToken,
                    expiresIn: responseData.expiresIn
                  };
                }),
                catchError(error => {
                  console.warn('No se pudo obtener información adicional del usuario:', error);
                  this.saveUserData(authUser);

                  return of({
                    user: authUser,
                    token: responseData.accessToken,
                    refreshToken: responseData.refreshToken,
                    expiresIn: responseData.expiresIn
                  });
                })
              );
            } else {
              // Para usuarios CLIENT, usar datos básicos
              this.saveUserData(authUser);

              return of({
                user: authUser,
                token: responseData.accessToken,
                refreshToken: responseData.refreshToken,
                expiresIn: responseData.expiresIn
              });
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
   * Guardar datos del usuario en storage y actualizar subject
   */
  private saveUserData(authUser: AuthUser): void {
    this.storageService.setCurrentUser(authUser);
    this.storageService.setUserRole(authUser.roles[0] || 'USER');
    if (authUser.organizationId) {
      this.storageService.setOrganizationId(authUser.organizationId);
    }
    this.currentUserSubject.next(authUser);
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
   * Limpiar datos locales
   */
  private clearLocalData(): void {
    this.currentUserSubject.next(null);
    this.storageService.clearAll();
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value && !!this.storageService.getToken();
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
    return currentUser?.organizationId || this.storageService.getOrganizationId();
  }

  /**
   * Validar token actual
   */
  validateToken(): Observable<boolean> {
    const token = this.storageService.getToken();
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
    const refreshToken = this.storageService.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token found'));
    }

    return this.apiService.postWithFullResponse<{ accessToken: string; expiresIn: number }>('/auth/refresh-token', {
      refreshToken
    }).pipe(
      map(response => {
        if (response.success && response.data) {
          this.storageService.setToken(response.data.accessToken);
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
    console.log('AuthService.setActiveRole() called with role:', role);
    const currentUser = this.currentUserSubject.value;
    console.log('AuthService.setActiveRole() - Current user:', currentUser);

    if (!currentUser || !currentUser.roles.includes(role)) {
      console.error('AuthService.setActiveRole() - User does not have the specified role');
      throw new Error('El usuario no tiene el rol especificado');
    }

    const updatedUser: AuthUser = {
      ...currentUser,
      activeRole: role
    }; console.log('AuthService.setActiveRole() - Updated user:', updatedUser);
    this.storageService.setCurrentUser(updatedUser);
    this.currentUserSubject.next(updatedUser);
    console.log('AuthService.setActiveRole() - Role set successfully');
  }
  /**
   * Obtener el rol activo del usuario
   */
  getActiveRole(): RolesUsers | null {
    const currentUser = this.currentUserSubject.value;
    const activeRole = currentUser?.activeRole || null;
    // console.log('AuthService.getActiveRole() - Current user:', currentUser);
    // console.log('AuthService.getActiveRole() - Active role:', activeRole);
    return activeRole;
  }

  /**
   * Verificar si el usuario tiene múltiples roles
   */
  hasMultipleRoles(): boolean {
    const currentUser = this.currentUserSubject.value;
    return (currentUser?.roles && currentUser.roles.length > 1) || false;
  }
  /**
   * Obtener los roles disponibles para selección
   */
  getSelectableRoles(): RolesUsers[] {
    const currentUser = this.currentUserSubject.value;
    if (!currentUser) return [];

    return currentUser.roles.filter(role =>
      role === RolesUsers.ADMIN || role === RolesUsers.CLIENT || role === RolesUsers.SUPER_ADMIN
    );
  }  /**
   * Verificar si el usuario necesita seleccionar un rol
   */
  needsRoleSelection(): boolean {
    const selectableRoles = this.getSelectableRoles();
    const currentUser = this.currentUserSubject.value;

    // Si tiene más de un rol seleccionable Y no tiene un rol activo establecido, necesita seleccionar uno
    const hasMultipleRoles = selectableRoles.length > 1;
    const hasActiveRole = !!currentUser?.activeRole;
    const needsSelection = hasMultipleRoles && !hasActiveRole;

    console.log('AuthService.needsRoleSelection() - Multiple roles:', hasMultipleRoles, 'Active role:', currentUser?.activeRole, 'Needs selection:', needsSelection);

    return needsSelection;
  }
}
