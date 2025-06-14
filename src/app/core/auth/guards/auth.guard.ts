import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UserRole } from '../../models/auth.model';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.isLoggedIn() === false) {
    router.navigate(['/login']);
    return false;
  }
  
  const requiredRoles = route.data?.['roles'] as UserRole[]; 
  if (requiredRoles && !authService.hasRole(requiredRoles[0])) { 
    router.navigate(['/unauthorized']);
    return false;
  }
  
  return true;
};
