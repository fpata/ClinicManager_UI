import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { LoginService, LoginResponse } from './login.service';
import { AuthService } from './auth.service';
import { UserType } from '../models/user.model';


describe('LoginService', () => {
  let service: LoginService;
  let httpMock: HttpTestingController;
  let authService: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [LoginService, AuthService]
    });
    service = TestBed.inject(LoginService);
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call authService on login success', () => {
    const setTokenSpy = spyOn(authService, 'setToken');
    const setUserSpy = spyOn(authService, 'setUser');

    service.login('u', 'p').subscribe();

    const req = httpMock.expectOne(() => true);
    const fake: LoginResponse = { token: 'abc', user: { ID:1, UserName:'u', UserType: UserType.Administrator, FirstName:'F', LastName:'L' } };
    req.flush(fake);
    expect(setTokenSpy).toHaveBeenCalledWith('abc');
    expect(setUserSpy).toHaveBeenCalled();
  });
});
