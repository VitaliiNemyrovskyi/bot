import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('auth_token');

  if (token) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });

    return next(authReq).pipe(
      catchError((error) => {
        console.log('Auth interceptor caught error:', error.status, error);
        if (error.status === 401) {
          console.log('401 error - handling session expiry');

          // Clear auth data from localStorage
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');

          // Only redirect if not already on login page
          if (!router.url.includes('/login')) {
            console.log('Redirecting to login from:', router.url);
            router.navigate(['/login'], {
              queryParams: {
                returnUrl: router.url,
                reason: 'session_expired'
              }
            });
          } else {
            console.log('Already on login page, not redirecting');
          }
        }
        return throwError(() => error);
      })
    );
  }

  return next(req);
};
