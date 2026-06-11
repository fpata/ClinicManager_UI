import { Component, ChangeDetectionStrategy, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../../../services/data.service';
import { MessageService } from '../../../services/message.service';
import { PatientService } from '../../../services/patient.service';
import { PatientBaseComponent } from '../patient-base.component';
import { DashboardComponent } from '../../dashboard/dashboard.component';
import { AppointmentHelper } from '../../../common/appointment-helper';
import { Patient } from '../../../models/patient.model';
import { User } from '../../../models/user.model';
import { UserService } from '../../../services/user.service';
@Component({
  selector: 'app-patient-appointment',
  imports: [DashboardComponent],
  templateUrl: './patient-appointment.component.html',
  styleUrls: ['./patient-appointment.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatientAppointmentComponent extends PatientBaseComponent implements OnInit {

  constructor(
    dataService: DataService,
    userService: UserService,
    patientService: PatientService,
    messageService: MessageService,
    router: Router,
    cdr: ChangeDetectorRef
  ) {
    super(dataService, userService, patientService, messageService, router, cdr);
  }

  ngOnInit(): void {
    this.initPatientSubscription();
  }

  protected applyUserData(user: User): void {
    if (!user) { this.router.navigate(['/dashboard']); return; }
    if (!user.Patients?.length) { this.router.navigate(['/patient/search']); return; }

    this.patient = user.Patients[0] as Patient;
    this.cdr.markForCheck();
  }

  displayName(d: any): string {
    return AppointmentHelper.displayName(d);
  }

  /**
   * Resolves the patient's display name using the richest available source:
   * 1. patient.user (nested User object returned by the API)
   * 2. the top-level user loaded from the data service
   * Falls back to an empty string so the typeahead in the modal stays blank
   * instead of showing 'Unknown Patient'.
   */
  get resolvedPatientName(): string {
    // Prefer the nested user object on the patient record
    if (this.patient?.user) {
      const first = this.patient.user.FirstName || '';
      const last = this.patient.user.LastName || '';
      const name = (first + ' ' + last).trim();
      if (name) return name;
    }
    // Fall back to the top-level user loaded into the base component
    if (this.user) {
      const first = this.user.FirstName || '';
      const last = this.user.LastName || '';
      const name = (first + ' ' + last).trim();
      if (name) return name;
    }
    return '';
  }

  onSave(): void {
    if (!this.patient) {
      this.messageService.warn('No patient is currently selected.');
      return;
    }
    super.savePatient();
    this.cdr.markForCheck();
  }

  /** Clear form: reload latest data from server */
  override onClear(): void {
    super.onClear();
  }

  /** Delete patient with confirmation */
  override onDelete(): void {
    super.onDelete();
  }
}