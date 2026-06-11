import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';

import { Header } from './header.component';
import { DataService } from '../../services/data.service';
import { LoginResponse } from '../../services/login.service';
import { UserType } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { AppConfigService } from '../../services/config.service';
import { UserService } from '../../services/user.service';

describe('HeaderComponent', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;
  let dataService: jasmine.SpyObj<DataService>;
  let userService: jasmine.SpyObj<UserService>;
  let loginUserSubject: BehaviorSubject<LoginResponse | null>;
  let configSubject: BehaviorSubject<any>;

  const mockLoginResponse: LoginResponse = {
    token: 'mock-token',
    user: {
      ID: 1,
      UserName: 'testuser',
      UserType: UserType.Doctor,
      FirstName: 'John',
      LastName: 'Doe',
      DOB: '1985-05-15',
      LastLoginDate: '2023-08-19T10:00:00Z'
    }
  };

  beforeEach(async () => {
    loginUserSubject = new BehaviorSubject<LoginResponse | null>(null);
    configSubject = new BehaviorSubject<any>(null);
    const userSubject = new BehaviorSubject<any>(null);
    const dataServiceSpy = jasmine.createSpyObj('DataService', ['setLoginUser', 'getConfig', 'setConfig', 'setUser'], {
      loginUser$: loginUserSubject.asObservable(),
      user$: userSubject.asObservable(),
      config$: configSubject.asObservable()
    });
    dataServiceSpy.getConfig.and.returnValue(null);

    const configServiceSpy = jasmine.createSpyObj('AppConfigService', ['getConfigs']);
    configServiceSpy.getConfigs.and.returnValue(of({ ClinicName: 'Test Clinic' }));

    const userServiceSpy = jasmine.createSpyObj('UserService', ['getUser']);
    userServiceSpy.getUser.and.returnValue(of({ ID: 1, FirstName: 'John', LastName: 'Doe' }));

    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getUserRole', 'getLoggedInPatientId', 'getDefaultRouteForRole', 'logout', 'getAllowedAccess']);
    authServiceSpy.getUserRole.and.returnValue('Doctor');
    authServiceSpy.getDefaultRouteForRole.and.returnValue('/dashboard');
    authServiceSpy.getAllowedAccess.and.returnValue({
      canAccessPatient: true,
      canAccessDashboard: true,
      canAccessBilling: true,
      canAccessConfig: true
    });
    authServiceSpy.logout.and.callFake(() => {
      localStorage.removeItem('token');
    });

    await TestBed.configureTestingModule({
      imports: [Header, RouterTestingModule],
      providers: [
        { provide: DataService, useValue: dataServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: AppConfigService, useValue: configServiceSpy },
        { provide: UserService, useValue: userServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    dataService = TestBed.inject(DataService) as jasmine.SpyObj<DataService>;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with null loginUser', () => {
    expect(component.loginUser).toBeNull();
  });

  describe('Subscription Management', () => {
    it('should subscribe to loginUser$ on init', () => {
      component.ngOnInit();
      
      loginUserSubject.next(mockLoginResponse);
      
      expect(component.loginUser).toEqual(mockLoginResponse);
    });

    it('should unsubscribe on destroy', () => {
      component.ngOnInit();
      spyOn(component['subscription']!, 'unsubscribe');
      spyOn(component['configSub']!, 'unsubscribe');
      
      component.ngOnDestroy();
      
      expect(component['subscription']!.unsubscribe).toHaveBeenCalled();
      expect(component['configSub']!.unsubscribe).toHaveBeenCalled();
    });

    it('should handle unsubscribe when no subscription exists', () => {
      // No ngOnInit called, so subscriptions are undefined
      expect(() => component.ngOnDestroy()).not.toThrow();
    });

    it('should update loginUser when data service emits new value', () => {
      component.ngOnInit();
      
      expect(component.loginUser).toBeNull();
      
      loginUserSubject.next(mockLoginResponse);
      expect(component.loginUser).toEqual(mockLoginResponse);
      
      loginUserSubject.next(null);
      expect(component.loginUser).toBeNull();
    });
  });

  describe('AppConfig Integration', () => {
    it('should default clinicName to CM - Clinic Manager', () => {
      expect(component.clinicName).toBe('CM - Clinic Manager');
    });

    it('should update clinicName when data service config$ emits new AppConfig', () => {
      component.ngOnInit();
      configSubject.next({ ClinicName: 'Super Dental Clinic' });
      expect(component.clinicName).toBe('Super Dental Clinic');
    });

    it('should fallback to default clinicName when data service config$ emits null or config without ClinicName', () => {
      component.ngOnInit();
      configSubject.next(null);
      expect(component.clinicName).toBe('CM - Clinic Manager');

      configSubject.next({ ClinicName: '' });
      expect(component.clinicName).toBe('CM - Clinic Manager');
    });
  });

  describe('Logout Functionality', () => {
    beforeEach(() => {
      localStorage.setItem('token', 'existing-token');
      component.loginUser = mockLoginResponse;
    });

    it('should clear token from localStorage', () => {
      component.logout();
      
      expect(localStorage.getItem('token')).toBeNull();
    });

    it('should call dataService.setLoginUser with null', () => {
      component.logout();
      
      expect(dataService.setLoginUser).toHaveBeenCalledWith(null);
    });

    it('should set loginUser to null', () => {
      component.logout();
      
      expect(component.loginUser).toBeNull();
    });

    it('should handle logout when no token exists', () => {
      localStorage.removeItem('token');
      
      expect(() => component.logout()).not.toThrow();
      expect(dataService.setLoginUser).toHaveBeenCalledWith(null);
      expect(component.loginUser).toBeNull();
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete login/logout cycle', () => {
      // Start with no user
      component.ngOnInit();
      expect(component.loginUser).toBeNull();
      
      // Simulate login
      loginUserSubject.next(mockLoginResponse);
      expect(component.loginUser).toEqual(mockLoginResponse);
      
      // Simulate logout
      component.logout();
      expect(component.loginUser).toBeNull();
      expect(dataService.setLoginUser).toHaveBeenCalledWith(null);
      
      // Cleanup
      component.ngOnDestroy();
    });

    it('should handle multiple user changes', () => {
      component.ngOnInit();
      
      const anotherUser: LoginResponse = {
        ...mockLoginResponse,
        user: { ...mockLoginResponse.user, ID: 2, UserName: 'anotheruser' }
      };
      
      loginUserSubject.next(mockLoginResponse);
      expect(component.loginUser?.user.UserName).toBe('testuser');
      
      loginUserSubject.next(anotherUser);
      expect(component.loginUser?.user.UserName).toBe('anotheruser');
      
      loginUserSubject.next(null);
      expect(component.loginUser).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined subscription gracefully', () => {
      component['subscription'] = undefined;
      expect(() => component.ngOnDestroy()).not.toThrow();
    });

    it('should handle localStorage errors during logout', () => {
      spyOn(localStorage, 'removeItem').and.throwError('Storage error');
      spyOn(console, 'error');
      
      expect(() => component.logout()).not.toThrow();
      // Component should still call dataService even if localStorage fails
      expect(dataService.setLoginUser).toHaveBeenCalledWith(null);
    });

    it('should handle dataService errors gracefully', () => {
      dataService.setLoginUser.and.throwError('DataService error');
      spyOn(console, 'error');
      
      expect(() => component.logout()).not.toThrow();
    });
  });

  describe('Profile Navigation', () => {
    it('should navigate to /user-create after fetching user details on click of Profile', () => {
      const router = TestBed.inject(Router);
      spyOn(router, 'navigate');

      component.loginUser = mockLoginResponse; // Set logged-in user
      const mockEvent = jasmine.createSpyObj('Event', ['preventDefault']);

      const mockUserDetails: any = { ID: 1, FirstName: 'John', LastName: 'Doe', Address: null, Contact: null };
      userService.getUser.and.returnValue(of(mockUserDetails as any));

      component.goToProfile(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(userService.getUser).toHaveBeenCalledWith(1);
      expect(dataService.setUser).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/user-create']);
    });
  });

  describe('Settings Authorization', () => {
    it('should return true for isAdmin when role is Admin, Administrator, or 5', () => {
      const authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;

      authService.getUserRole.and.returnValue('Admin');
      expect(component.isAdmin).toBeTrue();

      authService.getUserRole.and.returnValue('Administrator');
      expect(component.isAdmin).toBeTrue();

      authService.getUserRole.and.returnValue('5');
      expect(component.isAdmin).toBeTrue();
    });

    it('should return false for isAdmin when role is not Admin, Administrator, or 5', () => {
      const authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;

      authService.getUserRole.and.returnValue('Doctor');
      expect(component.isAdmin).toBeFalse();

      authService.getUserRole.and.returnValue('Nurse');
      expect(component.isAdmin).toBeFalse();

      authService.getUserRole.and.returnValue(null);
      expect(component.isAdmin).toBeFalse();
    });
  });
});
