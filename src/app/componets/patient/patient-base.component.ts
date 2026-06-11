import { ChangeDetectorRef, Directive, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Patient } from '../../models/patient.model';
import { User, UserType } from '../../models/user.model';
import { DataService } from '../../services/data.service';
import { MessageService } from '../../services/message.service';
import { PatientService } from '../../services/patient.service';
import { UserService } from '../../services/user.service';

/**
 * Abstract base class for all patient detail components.
 * Provides shared implementations of onClear() and onDelete().
 *
 * Concrete components must:
 *  1. extend PatientBaseComponent
 *  2. call super(dataService, patientService, messageService, router, cdr) in their constructor
 *  3. call this.initPatientSubscription() in ngOnInit()
 *  4. implement applyUserData(user) to populate component-specific fields
 *  5. call super.ngOnDestroy() in their ngOnDestroy()
 */
@Directive()
export abstract class PatientBaseComponent implements OnDestroy {
  user: User | null = null;
  patient: Patient | null = null;

  get isPatientRole(): boolean {
    const loginUser = this.dataService.getLoginUser();
    const userType = loginUser?.user?.UserType as any;
    return userType === UserType.Patient || userType === 'Patient' || userType === 1 || userType === '1';
  }

  protected patientSubscription: Subscription = new Subscription();

  constructor(
    protected dataService: DataService,
    protected userService: UserService,
    protected patientService: PatientService,
    protected messageService: MessageService,
    protected router: Router,
    protected cdr: ChangeDetectorRef
  ) { }

  /**
   * Subscribe to user$ stream and delegate to applyUserData().
   * Call this inside each component's ngOnInit().
   */
  protected initPatientSubscription(): void {
    this.patientSubscription = this.dataService.user$.subscribe({
      next: (user: User) => {
        this.user = user;
        this.patient = user?.Patients?.[0] ?? null;
        if (this.patient == null) { // If no patient is selected, redirect to patient search
          this.messageService.warn('No patient is currently selected.');
          this.router.navigate(['/patient/search']);
        }
        this.applyUserData(user);
        this.cdr.markForCheck();
      },
      error: (error: any) => {
        this.messageService.error('Error loading patient data: ' + (error?.message ?? error));
      }
    });
  }

  /**
   * Override in each component to apply component-specific state from the loaded user.
   */
  protected abstract applyUserData(user: User): void;

  // ─────────────────────────────────────────────────────────────
  // Generic Clear: re-fetches patient from API and refreshes state
  // ─────────────────────────────────────────────────────────────
  onClear(): void {
    if (!this.patient?.ID) {
      this.messageService.warn('No patient is currently selected.');
      return;
    }

    this.patientService.getPatient(this.patient.ID).subscribe({
      next: (freshUser: User) => {
        this.dataService.setUser(freshUser);
        this.messageService.info('Form has been refreshed with the latest saved data.');
      },
      error: (error: any) => {
        this.messageService.error('Failed to reload patient data: ' + (error?.message ?? error));
      }
    });
  }

  // ─────────────────────────────────────────────────────────────
  // Generic Delete: confirms then deletes patient and redirects
  // ─────────────────────────────────────────────────────────────
  onDelete(): void {
    if (!this.patient?.ID) {
      this.messageService.warn('No patient is currently selected.');
      return;
    }

    const patientId = this.patient.ID;
    const confirmFn: (msg: string) => Promise<boolean> =
      (window as any).showConfirm ??
      ((msg: string) => Promise.resolve(confirm(msg)));

    confirmFn('Are you sure you want to delete this patient? This action cannot be undone.').then(
      (confirmed: boolean) => {
        if (!confirmed) return;

        this.patientService.deletePatient(patientId).subscribe({
          next: () => {
            this.messageService.success('Patient deleted successfully.');
            this.router.navigate(['/patient/search']);
          },
          error: (error: any) => {
            this.messageService.error('Failed to delete patient: ' + (error?.message ?? error));
          }
        });
      }
    );
  }

  ngOnDestroy(): void {
    this.patientSubscription?.unsubscribe();
  }

  savePatient(): void {
    if (!this.patient) return;
    this.patientService.savePatient(this.patient).subscribe({
      next: (savedPatient: Patient) => {
        this.messageService.success('Patient saved successfully.');
        if (this.user) {
          const updatedUser = JSON.parse(JSON.stringify(this.user));
          if (!updatedUser.Patients) {
            updatedUser.Patients = [];
          }
          if (updatedUser.Patients.length > 0) {
            updatedUser.Patients[0] = savedPatient;
          } else {
            updatedUser.Patients.push(savedPatient);
          }
          this.dataService.setUser(updatedUser);
        }
      },
      error: (error: any) => {
        this.messageService.error('Failed to save patient: ' + (error?.message ?? error));
      }
    });
  }

  protected loadPatientInformation(): void {
    const loginUser = this.dataService.getLoginUser();
    const userType = loginUser?.user?.UserType as any;
    const isPatient = userType === UserType.Patient || userType === 'Patient' || userType === 1 || userType === '1';
    if (this.user == null && loginUser?.user && isPatient) {
      this.userService.getUser(loginUser.user.ID).subscribe({
        next: (user: User) => {
          this.user = user;
          this.patientService.getLatestPatientbyUserId(user.ID).subscribe({
            next: (patient: Patient) => {
              this.patient = patient;
              this.dataService.setPatient(patient);
              this.user!.Patients = [patient];
              this.dataService.setUser(this.user!);
            },
            error: (error: any) => {
              this.messageService.error('Failed to load patient information: ' + (error?.message ?? error));
            }
          });
        },
        error: (error: any) => {
          this.messageService.error('Failed to load user information: ' + (error?.message ?? error));
        }
      });
      this.cdr.detectChanges();
    }
  }
}
