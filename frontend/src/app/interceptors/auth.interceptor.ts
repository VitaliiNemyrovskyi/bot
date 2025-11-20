import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

// Flag to prevent multiple redirects from concurrent 401 responses
let isRedirecting = false;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('auth_token');

  // Clone request with cache-control headers and auth token if available
  const modifiedReq = req.clone({
    headers: req.headers
      .set('Cache-Control', 'no-cache, no-store, must-revalidate')
      .set('Pragma', 'no-cache')
      .set('Expires', '0')
      .set('Authorization', token ? 'Bearer ' + token : '')
  });

  // Handle errors for all requests, regardless of auth token presence
  return next(modifiedReq).pipe(
    catchError((error) => {
      if (error.status === 401) {
        // Clear auth data directly from localStorage to avoid circular dependency
        // (AuthService injects HttpClient which uses this interceptor)
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');

        // Only redirect once, even if multiple 401s come in
        if (!isRedirecting && !router.url.includes('/login')) {
          isRedirecting = true;
          console.log('401 error - redirecting to login from:', router.url);

          router.navigate(['/login'], {
            queryParams: {
              returnUrl: router.url,
              reason: token ? 'session_expired' : 'login_required'
            }
          }).then(() => {
            // Reset flag after navigation completes
            isRedirecting = false;
          });
        }
      }
      return throwError(() => error);
    })
  );
};
