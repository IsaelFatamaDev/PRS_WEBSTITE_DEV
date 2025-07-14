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
      if (error.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('currentUser');
        router.navigate(['/auth/login']);
      }

      return throwError(() => error);
    })
  );
};
