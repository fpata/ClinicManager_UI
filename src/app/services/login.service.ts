import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, switchMap, catchError, of } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { UserType } from '../models/user.model';
import { DataService } from './data.service';

export class LoginResponse {
  token: string;
  user: {
    ID: number;
    UserName: string;
    UserType: UserType;
    FirstName: string;
    LastName: string;
    DOB?: string;
    LastLoginDate?: string;
  };
  allowedAccess?: {
    canAccessPatient: boolean;
    canAccessDashboard: boolean;
    canAccessBilling: boolean;
    canAccessConfig: boolean;
  };
}

@Injectable({ providedIn: 'root' })
export class LoginService {
  private apiUrl = `${environment.API_BASE_URL}/login`;

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService, private dataService: DataService
  ) {}

  login(UserName: string, Password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.apiUrl, { UserName, Password })
      .pipe(
        switchMap(response => {
          if (response.token) {
            this.authService.setToken(response.token);
            this.authService.setUser(response.user);
            this.authService.setAllowedAccess(response.allowedAccess);

            // Read UserType directly from the API response (arrives as string due to
            // JsonStringEnumConverter, e.g. "Patient", "Administrator", etc.)
            const rawUserType = response.user?.UserType?.toString() ?? '';
            const isPatient = rawUserType === '1'
              || rawUserType.toLowerCase() === 'patient';

            if (isPatient) {
              // Patient role: fetch their latest patient record then navigate
              const headers = new HttpHeaders({ Authorization: `Bearer ${response.token}` });
              return this.http.get<any>(
                `${environment.API_BASE_URL}/patient/Latest/${response.user.ID}`,
                { headers }
              ).pipe(
                tap(patient => {
                  if (patient && patient.ID) {
                    this.authService.setLoggedInPatientId(patient.ID);
                    this.dataService.setUser({ ...response.user, Patients: [patient] } as any);
                  }
                  this.router.navigate([`/patient/${patient?.ID ?? ''}/treatment`]);
                }),
                switchMap(() => of(response)),
                catchError(err => {
                  console.error('Failed to load patient details:', err);
                  this.router.navigate(['/patient']);
                  return of(response);
                })
              );
            } else {
              // All other roles (Admin, Doctor, Nurse, etc.) — navigate immediately
              const userRole = this.authService.getUserRole();
              const nextRoute = this.authService.getDefaultRouteForRole(userRole);
              this.router.navigate([nextRoute]);
              return of(response);
            }
          }
          return of(response);
        })
      );
  }

  logout(): void {
    this.authService.logout();
  }
}
