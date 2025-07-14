import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { RolesUsers } from '../../models/user.model';

export const clientGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('ClientGuard: Checking authentication...');

  if (!authService.isAuthenticated()) {
    console.log('ClientGuard: Not authenticated, redirecting to login');
    router.navigate(['/auth/login']);
    return false;
  }

  console.log('ClientGuard: Checking role selection...');
  if (authService.needsRoleSelection()) {
    console.log('ClientGuard: Role selection needed, redirecting to role selector');
    router.navigate(['/role-selector']);
    return false;
  }

  console.log('ClientGuard: Getting active role...');
  const activeRole = authService.getActiveRole();
  console.log('ClientGuard: Active role is:', activeRole);

  if (activeRole !== RolesUsers.CLIENT) {
    console.log('ClientGuard: Invalid role, redirecting to unauthorized');
    router.navigate(['/unauthorized']);
    return false;
  }

  console.log('ClientGuard: All checks passed, allowing access');
  return true;
};
