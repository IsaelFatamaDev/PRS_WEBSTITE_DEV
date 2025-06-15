import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { User, UserRole, AuthResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }
  private currentUserSubject = new BehaviorSubject<Omit<User, 'password'> | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // usuarios
  private readonly mockUsers: User[] = [
    {
      id: '1',
      email: 'admin@jass.com',
      password: 'admin123',
      role: UserRole.ADMIN,
      name: 'Administrador',
      organizationId: '1'
    },
    {
      id: '2',
      email: 'client@jass.com',
      password: 'client123',
      role: UserRole.CLIENT,
      name: 'Cliente',
      organizationId: '1'
    },
    {
      id: '3',
      email: 'superadmin@jass.com',
      password: 'super123',
      role: UserRole.SUPERADMIN,
      name: 'Super Administrador'
    }
  ];

  constructor() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
  }

  login(email: string, password: string): Observable<AuthResponse> {
    const user = this.mockUsers.find(u => u.email === email && u.password === password);

    if (user) {
      const token = `mock-token-${user.id}-${Date.now()}`;

      const { password: _, ...userWithoutPassword } = user;

      const authResponse: AuthResponse = {
        user: userWithoutPassword,
        token
      };

      localStorage.setItem('token', token);
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));

      this.currentUserSubject.next(userWithoutPassword);

      return of(authResponse);
    }

    return throwError(() => new Error('Credenciales inválidas'));
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  hasRole(role: UserRole): boolean {
    const currentUser = this.currentUserSubject.value;
    return currentUser?.role === role;
  }

  hasAnyRole(roles: UserRole[]): boolean {
    const currentUser = this.currentUserSubject.value;
    return roles.some(role => currentUser?.role === role);
  }

  getCurrentUser(): Omit<User, 'password'> | null {
    return this.currentUserSubject.value;
  }
}
