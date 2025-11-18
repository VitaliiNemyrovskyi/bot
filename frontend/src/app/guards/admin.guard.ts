import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.authService.isReady.pipe(
      take(1),
      map(() => {
        const user = this.authService.currentUser();
        const isAdmin = user?.role === 'ADMIN';

        if (!user) {
          // Not authenticated - redirect to login
          this.router.navigate(['/login'], {
            queryParams: { returnUrl: state.url, reason: 'login_required' }
          });
          return false;
        }

        if (!isAdmin) {
          // Authenticated but not admin - redirect to home
          this.router.navigate(['/home']);
          return false;
        }

        return true;
      })
    );
  }
}
