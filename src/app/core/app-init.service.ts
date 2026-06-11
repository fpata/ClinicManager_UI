import { APP_INITIALIZER, Injectable } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AppInitService {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  init(): Promise<void> {
    return new Promise((resolve) => {
      // Check if user is logged in on app initialization
      if (!this.authService.isLoggedIn) {
        // Only redirect to login if not already on login page
        if (this.router.url !== '/login') {
          this.router.navigate(['/login']);
        }
      }
      resolve();
    });
  }
}

export function appInitializerFactory(appInitService: AppInitService) {
  return () => appInitService.init();
}

export const APP_INIT_PROVIDER = {
  provide: APP_INITIALIZER,
  useFactory: appInitializerFactory,
  deps: [AppInitService],
  multi: true
};
