import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PatientTreatment } from '../../../models/patient-treatment.model';
import { PatientTreatmentService } from '../../../services/patient-treatment.service';
import { DataService } from '../../../services/data.service';
import { Patient } from '../../../models/patient.model';
import { PatientService } from '../../../services/patient.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-patientcompletehistory',
  imports: [FormsModule],
  templateUrl: './patient-complete-history.component.html',
  styleUrls: ['./patient-complete-history.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class PatientCompleteHistoryComponent implements OnInit {
  user: User | null = null;
  patient: Patient | null = null;

  constructor(private dataService: DataService,
    private patientTreatmentService: PatientTreatmentService, private patientService: PatientService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.dataService.user$.subscribe({
      next: (_user: User) => {
        this.user = _user;
        this.patient = _user?.Patients?.[0] ?? null;
        if (_user && _user.ID) {
          this.GetAllTreatmentsForUser(_user.ID);
        }
        this.cdr.markForCheck();
      },
      error: (error: any) => {
        console.error('Error loading patient data:', error);
      }
    });
  }


  patientTreatments: PatientTreatment[] = [];

  OnPatientIdClick(patientID: number) {
    this.patientService.getPatient(patientID).subscribe({
      next: (_newPatient: Patient) => {
        this.user = this.dataService.getUser();
        this.user.Patients[0] = _newPatient;
        this.dataService.setUser(this.user);
        // Persist patientId as well for session fallback
        this.cdr.markForCheck();
      },
      error: (error: any) => {
        console.error('Error fetching patient:', error);
      }
    });
  }

  GetAllTreatmentsForUser(userId: number) {
    this.patientTreatments = [];
    this.patientTreatmentService.getAllTreatmentsForUser(userId).subscribe({
      next: (result: any) => {
        this.patientTreatments = result;
        this.cdr.markForCheck();
        console.log('Treatments fetched successfully:', this.patientTreatments);
      },
      error: (error: any) => {
        console.error('Error fetching treatments:', error);
      }
    });
  }
}