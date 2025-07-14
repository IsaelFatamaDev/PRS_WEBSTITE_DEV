import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ha ocurrido un error desconocido';

      if (error.error instanceof ErrorEvent) {
        errorMessage = `Error: ${error.error.message}`;
      } else {
        switch (error.status) {
          case 400:
            errorMessage = error.error?.message || 'Solicitud incorrecta';
            break;
          case 401:
            errorMessage = 'No autorizado. Por favor, inicie sesión nuevamente';
            break;
          case 403:
            errorMessage = 'Acceso denegado. No tiene permisos para realizar esta acción';
            break;
          case 404:
            errorMessage = 'Recurso no encontrado';
            break;
          case 409:
            errorMessage = error.error?.message || 'Conflicto en la solicitud';
            break;
          case 500:
            errorMessage = 'Error interno del servidor. Inténtelo más tarde';
            break;
          case 503:
            errorMessage = 'Servicio no disponible. Inténtelo más tarde';
            break;
          default:
            errorMessage = error.error?.message || `Error HTTP ${error.status}: ${error.statusText}`;
        }
      }

      console.error('HTTP Error:', {
        status: error.status,
        message: errorMessage,
        url: error.url,
        error: error.error
      });

      const customError = new Error(errorMessage);
      (customError as any).status = error.status;
      (customError as any).originalError = error;

      return throwError(() => customError);
    })
  );
};
