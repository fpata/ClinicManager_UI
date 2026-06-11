import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let router: jasmine.SpyObj<Router>;

  const validToken = 'header.' + btoa(JSON.stringify({ exp: Math.floor(Date.now()/1000) + 3600 })) + '.signature';
  const expiredToken = 'header.' + btoa(JSON.stringify({ exp: Math.floor(Date.now()/1000) - 3600 })) + '.signature';
  const invalidToken = 'invalid.token.format';

  const mockUser = {
    ID: 1,
    UserName: 'testuser',
    UserType: 'Doctor',
    FirstName: 'John',
    LastName: 'Doe'
  };

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: Router, useValue: routerSpy }
      ]
    });
    service = TestBed.inject(AuthService);
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Token Management', () => {
    it('should set and get token', () => {
      service.setToken(validToken);
      expect(service.getToken()).toBe(validToken);
      expect(localStorage.getItem('token')).toBe(validToken);
    });

    it('should return null when no token is set', () => {
      expect(service.getToken()).toBeNull();
    });

    it('should clear token from localStorage when removed', () => {
      service.setToken(validToken);
      localStorage.removeItem('token');
      expect(service.getToken()).toBeNull();
    });
  });

  describe('User Management', () => {
    it('should set and get user', () => {
      service.setUser(mockUser);
      expect(service.getUser()).toEqual(mockUser);
      expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser));
    });

    it('should return null when no user is set', () => {
      expect(service.getUser()).toBeNull();
    });

    it('should clear user from localStorage when user is removed', () => {
      service.setUser(mockUser);
      localStorage.removeItem('user');
      expect(service.getUser()).toBeNull();
    });
  });

  describe('Authentication Status', () => {
    it('should report logged in with valid token', () => {
      service.setToken(validToken);
      expect(service.isLoggedIn).toBeTrue();
    });

    it('should report not logged in with no token', () => {
      expect(service.isLoggedIn).toBeFalse();
    });

    it('should report not logged in with expired token', () => {
      service.setToken(expiredToken);
      expect(service.isLoggedIn).toBeFalse();
    });

    it('should report not logged in with invalid token format', () => {
      service.setToken(invalidToken);
      expect(service.isLoggedIn).toBeFalse();
    });

    it('should handle malformed JWT payload gracefully', () => {
      const malformedToken = 'header.invalid-base64.signature';
      service.setToken(malformedToken);
      expect(service.isLoggedIn).toBeFalse();
    });
  });

  describe('Logout', () => {
    it('should logout and navigate to login page', () => {
      service.setToken(validToken);
      service.setUser(mockUser);
      
      service.logout();
      
      expect(service.getToken()).toBeNull();
      expect(service.getUser()).toBeNull();
      expect(service.isLoggedIn).toBeFalse();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should clear all stored data on logout', () => {
      service.setToken(validToken);
      service.setUser(mockUser);
      localStorage.setItem('otherData', 'test');
      
      service.logout();
      
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
      // Other data should remain untouched
      expect(localStorage.getItem('otherData')).toBe('test');
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined token gracefully', () => {
      service.setToken(undefined as any);
      expect(service.getToken()).toBeNull();
      expect(service.isLoggedIn).toBeFalse();
    });

    it('should handle undefined user gracefully', () => {
      service.setUser(undefined as any);
      expect(service.getUser()).toBeNull();
    });

    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage to throw an error
      spyOn(localStorage, 'setItem').and.throwError('Storage full');
      spyOn(console, 'error');
      
      expect(() => service.setToken(validToken)).not.toThrow();
    });

    it('should handle redirect to login', () => {
      service.redirectToLogin();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should provide isLoggedIn observable', () => {
      let isLoggedIn: boolean | undefined;
      service.isLoggedIn$.subscribe(value => isLoggedIn = value);
      
      service.setToken(validToken);
      expect(isLoggedIn).toBeTrue();
      
      service.logout();
      expect(isLoggedIn).toBeFalse();
    });
  });
});
