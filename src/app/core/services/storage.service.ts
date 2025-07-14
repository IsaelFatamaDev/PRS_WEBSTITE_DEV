import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }

  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  setRefreshToken(refreshToken: string): void {
    localStorage.setItem('refreshToken', refreshToken);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  setCurrentUser(user: any): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  getCurrentUser(): any {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  setUserRole(role: string): void {
    localStorage.setItem('userRole', role);
  }

  getUserRole(): string | null {
    return localStorage.getItem('userRole');
  }

  setOrganizationId(orgId: string): void {
    localStorage.setItem('organizationId', orgId);
  }

  getOrganizationId(): string | null {
    return localStorage.getItem('organizationId');
  }

  removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  clearAuthData(): void {
    const authKeys = [
      'token',
      'refreshToken',
      'accessToken',
      'currentUser',
      'userRole',
      'organizationId',
      'sessionId'
    ];

    authKeys.forEach(key => {
      this.removeItem(key);
    });
  }

  clearAll(): void {
    localStorage.clear();
  }

  hasValidAuth(): boolean {
    const token = this.getToken();
    const user = this.getCurrentUser();
    return !!(token && user);
  }
}
