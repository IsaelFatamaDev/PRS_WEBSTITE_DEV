import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { RolesUsers } from '../../models/user.model';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('AdminGuard: Checking authentication...');

  if (!authService.isAuthenticated()) {
    console.log('AdminGuard: Not authenticated, redirecting to login');
    router.navigate(['/auth/login']);
    return false;
  }

  console.log('AdminGuard: Checking role selection...');
  if (authService.needsRoleSelection()) {
    console.log('AdminGuard: Role selection needed, redirecting to role selector');
    router.navigate(['/role-selector']);
    return false;
  }

  console.log('AdminGuard: Getting active role...');
  const activeRole = authService.getActiveRole();
  console.log('AdminGuard: Active role is:', activeRole);

  if (activeRole !== RolesUsers.ADMIN && activeRole !== RolesUsers.SUPER_ADMIN) {
    console.log('AdminGuard: Invalid role, redirecting to unauthorized');
    router.navigate(['/unauthorized']);
    return false;
  }
  console.log('AdminGuard: Getting organization ID...');
  const organizationId = authService.getCurrentOrganizationId();
  console.log('AdminGuard: Organization ID is:', organizationId);

  // TEMPORALMENTE COMENTADO PARA DEBUG
  // if (!organizationId) {
  //   console.error('AdminGuard: Usuario administrador sin organizationId');
  //   router.navigate(['/unauthorized']);
  //   return false;
  // }

  console.log('AdminGuard: All checks passed, allowing access');
  return true;
};
