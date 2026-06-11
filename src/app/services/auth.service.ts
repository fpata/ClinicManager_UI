import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'token';
  private userKey = 'user';
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());

  constructor(private router: Router) {}

  get isLoggedIn$(): Observable<boolean> {
    return this.isLoggedInSubject.asObservable();
  }

  get isLoggedIn(): boolean {
    return this.hasToken();
  }

  private hasToken(): boolean {
    const token = localStorage.getItem(this.tokenKey);
    return !!token && this.isTokenValid(token);
  }

  private isTokenValid(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      return payload.exp > now;
    } catch {
      return false;
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  setToken(token: string): void {
    try {
      if (token) {
        localStorage.setItem(this.tokenKey, token);
        this.isLoggedInSubject.next(true);
      } else {
        this.logout();
      }
    } catch (error) {
      console.error('Failed to set token:', error);
    }
  }

  setUser(user: any): void {
    try {
      if (user) {
        localStorage.setItem(this.userKey, JSON.stringify(user));
      } else {
        localStorage.removeItem(this.userKey);
      }
    } catch (error) {
      console.error('Failed to set user:', error);
    }
  }

  getUser(): any {
    const user = localStorage.getItem(this.userKey);
    if (user) {
      try {
        return JSON.parse(user);
      } catch (error) {
        console.error('Failed to parse user:', error);
        return null;
      }
    }
    return null;
  }

  getUserRole(): string | null {
    const user = this.getUser();
    if (user && user.UserType) {
      if (typeof user.UserType === 'number') {
        const mapping: { [key: number]: string } = {
          1: 'Patient',
          2: 'Doctor',
          3: 'Nurse',
          4: 'Receptionist',
          5: 'Admin',
          6: 'Technician',
          7: 'Accountant',
          8: 'DentalAssistant'
        };
        return mapping[user.UserType] || null;
      }
      return user.UserType;
    }

    const token = this.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.usertype || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || null;
      } catch {
        return null;
      }
    }
    return null;
  }

  getLoggedInPatientId(): number | null {
    const idVal = localStorage.getItem('loggedInPatientId');
    if (idVal) {
      return Number(idVal);
    }
    const user = this.getUser();
    if (user && user.Patients && user.Patients.length > 0) {
      return user.Patients[0].ID;
    }
    return null;
  }

  setLoggedInPatientId(id: number): void {
    localStorage.setItem('loggedInPatientId', id.toString());
  }

  setAllowedAccess(access: any): void {
    if (access) {
      localStorage.setItem('allowedAccess', JSON.stringify(access));
    } else {
      localStorage.removeItem('allowedAccess');
    }
  }

  getAllowedAccess(): any {
    const access = localStorage.getItem('allowedAccess');
    if (access) {
      try {
        return JSON.parse(access);
      } catch {
        return null;
      }
    }

    const token = this.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return {
          canAccessPatient: payload.canAccessPatient === 'true' || payload.canAccessPatient === true,
          canAccessDashboard: payload.canAccessDashboard === 'true' || payload.canAccessDashboard === true,
          canAccessBilling: payload.canAccessBilling === 'true' || payload.canAccessBilling === true,
          canAccessConfig: payload.canAccessConfig === 'true' || payload.canAccessConfig === true
        };
      } catch {
        return null;
      }
    }
    return null;
  }

  getDefaultRouteForRole(role: string | null): string {
    if (!role) return '/login';
    const r = role.toString().toLowerCase();
    if (r === 'admin' || r === 'administrator' || r === '5' || r === 'doctor' || r === '2' || r === 'nurse' || r === '3') {
      return '/dashboard';
    }
    if (r === 'patient' || r === '1') {
      const patientId = this.getLoggedInPatientId();
      return patientId ? `/patient/${patientId}/treatment` : '/patient';
    }
    if (r === 'accountant') {
      return '/billing';
    }
    return '/dashboard';
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem('loggedInPatientId');
    localStorage.removeItem('allowedAccess');
    this.isLoggedInSubject.next(false);
    this.router.navigate(['/login']);
  }

  redirectToLogin(): void {
    this.router.navigate(['/login']);
  }
}
