import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  console.log('🔵 INTERCEPTOR RUNNING for URL:', req.url);

  const router = inject(Router);
  const token = localStorage.getItem('auth_token');

  // Clone request with cache-control headers and auth token if available
  const modifiedReq = req.clone({
    headers: req.headers
      .set('Cache-Control', 'no-cache, no-store, must-revalidate')
      .set('Pragma', 'no-cache')
      .set('Expires', '0')
      .set('Authorization', token ? `Bearer ${token}` : '')
  });

  // Handle errors for all requests, regardless of auth token presence
  return next(modifiedReq).pipe(
    catchError((error) => {
      console.log('Auth interceptor caught error:', error.status, error);
      if (error.status === 401) {
        console.log('401 error - handling unauthorized access');

        // Clear auth data from localStorage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');

        // Only redirect if not already on login page
        if (!router.url.includes('/login')) {
          console.log('Redirecting to login from:', router.url);
          router.navigate(['/login'], {
            queryParams: {
              returnUrl: router.url,
              reason: token ? 'session_expired' : 'login_required'
            }
          });
        } else {
          console.log('Already on login page, not redirecting');
        }
      }
      return throwError(() => error);
    })
  );
};
