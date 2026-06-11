import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AppInitService } from './app-init.service';
import { AuthService } from '../services/auth.service';

class MockAuthService {
  isLoggedIn = false;
}

describe('AppInitService', () => {
  let service: AppInitService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AppInitService,
        { provide: AuthService, useClass: MockAuthService },
        { provide: Router, useValue: { url: '/', navigate: () => {} } }
      ]
    });
    service = TestBed.inject(AppInitService);
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should navigate to login when not logged in and not on /login', async () => {
    const spy = spyOn(router, 'navigate');
    (router as any).url = '/';
    await service.init();
    expect(spy).toHaveBeenCalledWith(['/login']);
  });
});
