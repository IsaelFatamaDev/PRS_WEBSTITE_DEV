import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';

export const organizationInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  const organizationId = authService.getCurrentOrganizationId();

  if (organizationId) {
    const needsOrganizationIdParam = [
      '/users/role',
      '/users/status',
      '/users/search'
    ].some(endpoint => req.url.includes(endpoint));

    const excludeFromParam = [
      '/auth/',
      '/users/organization/',
    ].some(endpoint => req.url.includes(endpoint));

    const isUserSpecificEndpoint = /\/users\/[a-fA-F0-9]{24}/.test(req.url);

    if (needsOrganizationIdParam && !excludeFromParam && !isUserSpecificEndpoint && !req.params.has('organizationId')) {
      const modifiedReq = req.clone({
        setParams: {
          organizationId: organizationId
        }
      });
      return next(modifiedReq);
    }
  }

  return next(req);
};
