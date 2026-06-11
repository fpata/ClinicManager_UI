import { authGuard } from './auth.guard';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

class MockAuthService {
  isLoggedIn = false;
  redirectToLogin() {}
  getUserRole() { return 'Doctor'; }
  getDefaultRouteForRole(role: string) { return '/dashboard'; }
  getAllowedAccess() {
    return {
      canAccessPatient: true,
      canAccessDashboard: true,
      canAccessBilling: true,
      canAccessConfig: true
    };
  }
}

describe('authGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: { navigate: () => {} } },
        { provide: AuthService, useClass: MockAuthService }
      ]
    });
  });

  it('should allow when logged in', () => {
    const auth = TestBed.inject(AuthService) as any;
    auth.isLoggedIn = true;
    const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
    expect(result).toBeTrue();
  });

  it('should redirect when not logged in', () => {
    const auth = TestBed.inject(AuthService) as any;
    const spy = spyOn(auth, 'redirectToLogin');
    auth.isLoggedIn = false;
    const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
    expect(result).toBeFalse();
    expect(spy).toHaveBeenCalled();
  });
});
