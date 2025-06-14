export class AuthService {
  
  isLoggedIn(): boolean {
    return !!localStorage.getItem('currentUser');
  }

  hasAnyRole(requiredRoles: string[]): boolean {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return requiredRoles.some(role => user.roles?.includes(role));
  }
  
}