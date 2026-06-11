import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../services/data.service';
import { Patient } from '../../../models/patient.model';
import { PatientVitals } from '../../../models/patient-vitals.model';
import { MessageService } from '../../../services/message.service';
import { PatientService } from '../../../services/patient.service';
import { UtilityService } from '../../../services/utility.service';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.model';
import { PatientBaseComponent } from '../patient-base.component';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-patient-vitals',
  imports: [FormsModule],
  templateUrl: './patient-vitals.component.html',
  styleUrls: ['./patient-vitals.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatientVitalsComponent extends PatientBaseComponent implements OnInit {
  vitals: PatientVitals | null = null;
  isNewPatient = false;

  constructor(
    dataService: DataService,
    userService: UserService,
    patientService: PatientService,
    messageService: MessageService,
    router: Router,
    cdr: ChangeDetectorRef,
    private util: UtilityService,
    private authService: AuthService
  ) {
    super(dataService, userService, patientService, messageService, router, cdr);
  }

  ngOnInit(): void {
    this.initPatientSubscription();
  }

  protected applyUserData(user: User): void {
    this.patient = user?.Patients?.[0] as Patient ?? null;
    this.isNewPatient = (this.patient?.ID === 0);
    if (this.patient) {
      this.patient.UserID = this.dataService.getUser()?.ID ?? 0;
    }
    if (this.patient?.PatientVitals?.length) {
      this.vitals = this.patient.PatientVitals[this.patient.PatientVitals.length - 1] as PatientVitals;
      this.vitals.RecordedDate = this.util.formatDate(this.vitals.RecordedDate.toString(), 'yyyy-MM-dd');
    } else {
      this.vitals = new PatientVitals();
      if (this.patient) this.patient.PatientVitals = [this.vitals];
    }
  }

  SetValuesForVitalID(vitalID: number): void {
    const selected = this.patient?.PatientVitals?.find(v => v.ID === vitalID);
    if (selected) {
      this.vitals = selected as PatientVitals;
      this.cdr.markForCheck();
    }
  }

  AddPatientVitals(): void {
    this.vitals = new PatientVitals();
    if (this.patient) {
      this.vitals.PatientID = this.patient.ID ?? 0;
      this.vitals.UserID = this.patient.UserID ?? 0;
      this.vitals.RecordedBy = this.authService.getUser()?.ID ?? 0;
      this.vitals.IsActive = 1;
      this.vitals.CreatedDate = this.util.formatDateTime(new Date());
      this.vitals.ModifiedDate = this.util.formatDateTime(new Date());
      this.vitals.ModifiedBy = this.authService.getUser()?.ID ?? 0;
      this.vitals.RecordedDate = this.util.formatDate(new Date(), 'yyyy-MM-dd');
      if (!this.patient.PatientVitals) {
        this.patient.PatientVitals = [];
      } else {
        const last = this.patient.PatientVitals[this.patient.PatientVitals.length - 1] as PatientVitals;
        this.vitals.BloodType = last.BloodType;
        this.vitals.Height = last.Height;
        this.vitals.Weight = last.Weight;
      }
      this.patient.PatientVitals.push(this.vitals);
      this.cdr.markForCheck();
    }
  }

  onSave(): void {
    super.savePatient();
    this.cdr.markForCheck();
  }
}