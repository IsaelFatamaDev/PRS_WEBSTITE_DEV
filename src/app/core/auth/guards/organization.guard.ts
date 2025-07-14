import { CanActivateChildFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';

export const organizationGuard: CanActivateChildFn = (childRoute, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/auth/login']);
    return false;
  }

  const organizationId = authService.getCurrentOrganizationId();
  const currentUser = authService.getCurrentUser();

  if (!organizationId && !authService.isSuperAdmin()) {
    console.error('Usuario sin organizationId:', currentUser);
    router.navigate(['/unauthorized']);
    return false;
  }

  return true;
};
