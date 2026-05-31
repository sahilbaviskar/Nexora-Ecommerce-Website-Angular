import { HttpInterceptorFn } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');

  if (!token) {
    return next(req).pipe(
      catchError((error) => {
        if (error?.status === 401) {
          localStorage.removeItem('token');
        }
        return throwError(() => error);
      })
    );
  }

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(authReq).pipe(
    catchError((error) => {
      if (error?.status === 401) {
        localStorage.removeItem('token');
      }
      return throwError(() => error);
    })
  );
};
