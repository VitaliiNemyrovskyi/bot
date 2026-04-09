import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {
  }

canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.authService.isReady.pipe(
      take(1),
      map(() => {
        const isAuth = this.authService.isAuthenticated();
        const isLoginRoute = route.routeConfig?.path === 'login' || route.routeConfig?.path === 'register';

        // Authenticated users hitting /login should be sent into the app.
        // OnboardingGuard on downstream routes decides whether to bounce them
        // to /onboarding (no exchange connected) or to the dashboard.
        if (isAuth && isLoginRoute) {
          this.router.navigate(['/onboarding']);
          return false;
        }

        if (isAuth || isLoginRoute) {
          return true;
        } else {
          // Check if there was a token that might have expired
          const hadToken = localStorage.getItem('auth_token');
          if (hadToken) {
            this.authService.handleSessionExpired();
          }
          this.router.navigate(['/login'], {
            queryParams: {
              returnUrl: state.url,
              reason: hadToken ? 'session_expired' : 'login_required'
            }
          });
          return false;
        }
      })
    );
  }
}
