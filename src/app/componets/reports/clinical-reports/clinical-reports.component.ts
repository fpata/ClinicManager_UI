import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../../services/report.service';
import { PatientService } from '../../../services/patient.service';
import { MessageService } from '../../../services/message.service';
import { Patient } from '../../../models/patient.model';
import { DataService } from '../../../services/data.service';
import { PrintService } from '../../../services/print.service';

@Component({
  selector: 'app-clinical-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clinical-reports.component.html',
  styleUrl: './clinical-reports.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClinicalReportsComponent implements OnInit {
  patients: Patient[] = [];

  // Medical History
  historyPatientId: number | null = null;
  isHistoryLoading = false;

  // Referral Letter
  referralPatientId: number | null = null;
  referralDoctorName = '';
  referralClinicName = '';
  referralReason = '';
  isReferralLoading = false;

  constructor(
    private reportService: ReportService,
    private patientService: PatientService,
    private messageService: MessageService,
    private dataService: DataService,
    private printService: PrintService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  private formatDate(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private loadPatients(): void {
    this.patientService.getPatients().subscribe({
      next: (patients) => {
        this.patients = patients;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error fetching patients for reporting:', err);
        this.messageService.error('Could not load patients list.');
      }
    });
  }

  downloadMedicalHistory(): void {
    if (!this.historyPatientId) {
      this.messageService.warn('Please select a patient.');
      return;
    }

    const patId = Number(this.historyPatientId);
    const selectedPatient = this.patients.find(p => p.ID === patId);
    if (!selectedPatient || !selectedPatient.UserID) {
      this.messageService.error('Selected patient has no associated user account.');
      return;
    }

    this.isHistoryLoading = true;
    this.cdr.markForCheck();

    this.patientService.getCompletePatient(selectedPatient.UserID).subscribe({
      next: (patientUser) => {
        const config = this.dataService.getConfig();
        this.printService.printMedicalHistory(patientUser, config);
        this.messageService.success('Medical history print view loaded.');
        this.isHistoryLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Medical history print error:', err);
        this.messageService.error('Failed to load patient medical history details.');
        this.isHistoryLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  downloadReferral(): void {
    if (!this.referralPatientId) {
      this.messageService.warn('Please select a patient.');
      return;
    }
    if (!this.referralDoctorName.trim()) {
      this.messageService.warn('Please enter the specialist\'s name.');
      return;
    }
    if (!this.referralClinicName.trim()) {
      this.messageService.warn('Please enter the destination clinic/hospital name.');
      return;
    }
    if (!this.referralReason.trim()) {
      this.messageService.warn('Please state a reason for referral.');
      return;
    }

    const patId = Number(this.referralPatientId);
    const selectedPatient = this.patients.find(p => p.ID === patId);
    if (!selectedPatient || !selectedPatient.UserID) {
      this.messageService.error('Selected patient has no associated user account.');
      return;
    }

    this.isReferralLoading = true;
    this.cdr.markForCheck();

    this.patientService.getCompletePatient(selectedPatient.UserID).subscribe({
      next: (patientUser) => {
        const config = this.dataService.getConfig();
        this.printService.printReferralLetter(
          patientUser,
          config,
          this.referralDoctorName,
          this.referralClinicName,
          this.referralReason
        );
        this.messageService.success('Referral letter print view loaded.');
        this.isReferralLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Referral letter print error:', err);
        this.messageService.error('Failed to load patient details for referral.');
        this.isReferralLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  clearReferralFilters(): void {
    this.referralPatientId = null;
    this.referralDoctorName = '';
    this.referralClinicName = '';
    this.referralReason = '';
    this.cdr.markForCheck();
  }

  private saveBlob(blob: Blob, defaultFilename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = defaultFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}
