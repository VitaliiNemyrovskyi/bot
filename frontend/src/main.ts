import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { authInterceptor } from './app/interceptors/auth.interceptor';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { AuthGuard } from './app/guards/auth.guard';
// import './disable-logs'; // Disable console.log for performance - TEMPORARILY DISABLED FOR DEBUGGING

bootstrapApplication(AppComponent, {
  providers: [
    AuthGuard,
    provideExperimentalZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),
    provideAnimations(),
    provideHttpClient(
      withInterceptors([authInterceptor]),
    ),
  ]
})
.catch(err => console.error(err));
