import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { RolesUsers } from '../../models/user.model';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/auth/login']);
    return false;
  }

  if (authService.needsRoleSelection()) {
    router.navigate(['/role-selector']);
    return false;
  }

  const requiredRoles = route.data?.['roles'] as RolesUsers[];
  if (requiredRoles && requiredRoles.length > 0) {
    const activeRole = authService.getActiveRole();

    if (!activeRole || !requiredRoles.includes(activeRole)) {
      if (activeRole) {
        if (activeRole === RolesUsers.SUPER_ADMIN) {
          router.navigate(['/super-admin/dashboard']);
        } else if (activeRole === RolesUsers.ADMIN) {
          router.navigate(['/admin/dashboard']);
        } else if (activeRole === RolesUsers.CLIENT) {
          router.navigate(['/client/dashboard']);
        } else {
          router.navigate(['/unauthorized']);
        }
      } else {
        router.navigate(['/unauthorized']);
      }
      return false;
    }
  }

  return true;
};
