import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { DataService } from '../../services/data.service';
import { LoginResponse } from '../../services/login.service';
import { Router, RouterModule, NavigationStart } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Patient } from '../../models/patient.model';
import { AuthService } from '../../services/auth.service';
import { AppConfigService } from '../../services/config.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { Address } from '../../models/address.model';
import { Contact } from '../../models/contact.model';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  imports: [RouterModule, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Header implements OnInit, OnDestroy {
  loginUser: LoginResponse | null = null;
  isDarkTheme = false;
  clinicName = 'CM - Clinic Manager';
  clinicLogo: string | null = null;
  private subscription?: Subscription;
  private patientSub?: Subscription;
  private routerSub?: Subscription;
  private configSub?: Subscription;
  patient: Patient | null = null;
  patientId: number | null = null;
  isNewPatient = false;
  showPatientSubnav = false;
  showUserSubnav = false;
  showBillingSubnav = false;
  showReportsSubnav = false;
  constructor(
    private dataService: DataService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private configService: AppConfigService,
    private userService: UserService
  ) {}

  get isLoginURL(): boolean {
    return this.router.url.includes('login');
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn;
  }

  ngOnInit(): void {
    this.subscription = this.dataService.loginUser$.subscribe(user => {
      this.loginUser = user;
      this.cdr.markForCheck();
    });
    // subscribe to patient changes so header links can include patientId
    this.patientSub = this.dataService.user$.subscribe(p => {
      this.patient = p?.Patients[0] ?? null;
      this.patientId = this.patient?.ID ?? null;
      // If patientId is null and this is a Patient role, fallback to their stored ID
      if (this.patientId === null && this.isPatientRole) {
        this.patientId = this.authService.getLoggedInPatientId();
      }
      this.isNewPatient = (this.patientId === 0);
      this.cdr.markForCheck();
    });

    this.routerSub = this.router.events.subscribe(e => {
      if (e instanceof NavigationStart) {
        this.updateSubnavsBasedOnUrl(e.url);
        this.cdr.markForCheck();
      }
    });

    this.configSub = this.dataService.config$.subscribe(config => {
      if (config && config.ClinicName) {
        this.clinicName = config.ClinicName;
      } else {
        this.clinicName = 'CM - Clinic Manager';
      }
      if (config && config.ClinicLogo) {
        this.clinicLogo = config.ClinicLogo;
      } else {
        this.clinicLogo = null;
      }
      this.cdr.markForCheck();
    });

    if (this.isLoggedIn && !this.dataService.getConfig()) {
      this.configService.getConfigs().subscribe({
        next: (config) => {
          this.dataService.setConfig(config);
        },
        error: (err) => {
          console.error('Error fetching app config in header:', err);
        }
      });
    }

    // Initialize subnavs based on current active URL
    this.updateSubnavsBasedOnUrl(this.router.url);

    // Load theme preference
    try {
      const pref = localStorage.getItem('theme');
      this.isDarkTheme = pref === 'dark';
      this.applyTheme(this.isDarkTheme);
    } catch (e) {
      this.isDarkTheme = false;
    }

    if (this.isPatientRole) {
      this.showPatientSubnav = true;
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.patientSub?.unsubscribe();
    this.routerSub?.unsubscribe();
    this.configSub?.unsubscribe();
  }

  get userRole(): string | null {
    return this.authService.getUserRole();
  }

  get showDashboardLink(): boolean {
    const access = this.authService.getAllowedAccess();
    if (access) return access.canAccessDashboard;

    const role = this.userRole;
    if (!role) return false;
    const r = role.toString().toLowerCase();
    return r === 'admin' || r === 'administrator' || r === '5' || r === 'doctor' || r === '2' || r === 'nurse' || r === '3';
  }

  get showUserMenu(): boolean {
    const access = this.authService.getAllowedAccess();
    if (access) return access.canAccessConfig;

    const role = this.userRole;
    if (!role) return false;
    const r = role.toString().toLowerCase();
    return r === 'admin' || r === 'administrator' || r === '5' || r === 'doctor' || r === '2';
  }

  get showPatientMenu(): boolean {
    if (this.isLoginURL) return false;
    const access = this.authService.getAllowedAccess();
    if (access) return access.canAccessPatient;

    return !!this.userRole;
  }

  get showSchedulerLink(): boolean {
    const access = this.authService.getAllowedAccess();
    if (access) return access.canAccessConfig || access.canAccessDashboard;

    const role = this.userRole;
    if (!role) return false;
    const r = role.toString().toLowerCase();
    return r === 'admin' || r === 'administrator' || r === '5' || r === 'doctor' || r === '2';
  }

  get showBillingLink(): boolean {
    const access = this.authService.getAllowedAccess();
    if (access) return access.canAccessBilling;

    const role = this.userRole;
    if (!role) return false;
    const r = role.toString().toLowerCase();
    return r === 'admin' || r === 'administrator' || r === '5' || r === 'doctor' || r === '2' || r === 'accountant';
  }

  get showConfigLink(): boolean {
    const access = this.authService.getAllowedAccess();
    if (access) return access.canAccessConfig;

    const role = this.userRole;
    if (!role) return false;
    const r = role.toString().toLowerCase();
    return r === 'admin' || r === 'administrator' || r === '5' || r === 'doctor' || r === '2';
  }

  get isPatientRole(): boolean {
    const role = this.userRole;
    if (!role) return false;
    const r = role.toString().toLowerCase();
    return r === 'patient' || r === '1';
  }

  get isAdmin(): boolean {
    const role = this.userRole;
    if (!role) return false;
    const r = role.toString().toLowerCase();
    return r === 'admin' || r === 'administrator' || r === '5';
  }

  logout(): void {
    try {
      this.authService.logout();
    } catch (e) {
      console.error('Error logging out via authService:', e);
    }
    try {
      this.dataService.setLoginUser(null);
    } catch (e) {
      console.error('Error setting login user in dataService:', e);
    }
    this.loginUser = null;
  }

  hideAllSubnavs(): void {
    if (!this.isPatientRole) {
      this.showPatientSubnav = false;
    }
    this.showUserSubnav = false;
    this.showBillingSubnav = false;
    this.showReportsSubnav = false;
    this.cdr.markForCheck();
  }

  updateSubnavsBasedOnUrl(url: string): void {
    const match = url.match(/\/patient\/(\d+)/);
    if (match && match[1]) {
      this.patientId = Number(match[1]);
    }

    if (url.includes('/dashboard') || url.includes('/doctorAppointments') || url.includes('/appconfig') || url === '/' || url === '') {
      this.showUserSubnav = false;
      this.showBillingSubnav = false;
      this.showReportsSubnav = false;
      if (!this.isPatientRole) {
        this.showPatientSubnav = false;
      }
    } else if (url.includes('/user-')) {
      this.showUserSubnav = true;
      this.showBillingSubnav = false;
      this.showReportsSubnav = false;
      if (!this.isPatientRole) {
        this.showPatientSubnav = false;
      }
    } else if (url.includes('/patient')) {
      this.showPatientSubnav = true;
      this.showUserSubnav = false;
      this.showBillingSubnav = false;
      this.showReportsSubnav = false;
    } else if (url.includes('/billing')) {
      this.showBillingSubnav = true;
      this.showUserSubnav = false;
      this.showReportsSubnav = false;
      if (!this.isPatientRole) {
        this.showPatientSubnav = false;
      }
    } else if (url.includes('/reports')) {
      this.showReportsSubnav = true;
      this.showUserSubnav = false;
      this.showBillingSubnav = false;
      if (!this.isPatientRole) {
        this.showPatientSubnav = false;
      }
    }
  }

  goToProfile(event: Event): void {
    event.preventDefault();
    const userId = this.loginUser?.user?.ID;
    if (userId) {
      this.userService.getUser(userId).subscribe({
        next: (user: User) => {
          if (user.Address == null || user.Address == undefined) {
            user.Address = new Address();
          }
          if (user.Contact == null || user.Contact == undefined) {
            user.Contact = new Contact();
          }
          this.dataService.setUser(user);
          this.router.navigate(['/user-create']);
        },
        error: (err: any) => {
          console.error('Error fetching user profile data:', err);
        }
      });
    }
  }

  togglePatientSubnav(event: Event): void {
    event.preventDefault();
    this.showPatientSubnav = !this.showPatientSubnav;
    if (this.showPatientSubnav) {
      this.showUserSubnav = false;
      this.showBillingSubnav = false;
      this.showReportsSubnav = false;
    }
    this.cdr.markForCheck();
  }

  toggleUserSubnav(event: Event): void {
    event.preventDefault();
    this.showUserSubnav = !this.showUserSubnav;
    if (this.showUserSubnav) {
      this.showPatientSubnav = false;
      this.showBillingSubnav = false;
      this.showReportsSubnav = false;
    }
    this.cdr.markForCheck();
  }

  toggleBillingSubnav(event: Event): void {
    event.preventDefault();
    this.showBillingSubnav = !this.showBillingSubnav;
    if (this.showBillingSubnav) {
      this.showPatientSubnav = false;
      this.showUserSubnav = false;
      this.showReportsSubnav = false;
    }
    this.cdr.markForCheck();
  }

  toggleReportsSubnav(event: Event): void {
    event.preventDefault();
    this.showReportsSubnav = !this.showReportsSubnav;
    if (this.showReportsSubnav) {
      this.showPatientSubnav = false;
      this.showUserSubnav = false;
      this.showBillingSubnav = false;
    }
    this.cdr.markForCheck();
  }

  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;
    try {
      localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light');
    } catch (e) {}
    this.applyTheme(this.isDarkTheme);
  }

  private applyTheme(dark: boolean): void {
    if (typeof document !== 'undefined') {
      if (dark) document.body.classList.add('theme-dark');
      else document.body.classList.remove('theme-dark');
    }
  }
}
