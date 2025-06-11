import { HttpInterceptorFn } from '@angular/common/http';

export const organizationInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req);
};
