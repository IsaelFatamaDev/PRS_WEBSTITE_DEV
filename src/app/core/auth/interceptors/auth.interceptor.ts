import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  const token = localStorage.getItem('token');

  let modifiedReq = req;
  if (token && !req.headers.has('Authorization')) {
    modifiedReq = req.clone({
      setHeaders: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  return next(modifiedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      console.log('AuthInterceptor: HTTP Error caught:', {
        status: error.status,
        url: error.url,
        message: error.message
      });

      if (error.status === 401) {
        // Solo redirigir al login si el error es específicamente de autenticación
        // y no un error de autorización de recursos específicos
        const isAuthEndpoint = req.url.includes('/auth/');
        const isTokenValidation = req.url.includes('/validate');

        if (isAuthEndpoint || isTokenValidation || !token) {
          console.log('AuthInterceptor: Authentication failed, redirecting to login');
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('currentUser');
          router.navigate(['/auth/login']);
        } else {
          console.log('AuthInterceptor: Resource access denied, not redirecting to login');
          // Para otros tipos de 401, no redirigir automáticamente
          // Dejar que el componente maneje el error
        }
      }

      return throwError(() => error);
    })
  );
};
