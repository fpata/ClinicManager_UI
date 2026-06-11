import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BillingRecord, BillingStatus } from '../../../models/billing.model';
import { BillingService } from '../../../services/blling.service';
import { MessageService } from '../../../services/message.service';
import { Router } from '@angular/router';
import { SearchService } from '../../../services/search.service';
import { UtilityService } from '../../../services/utility.service';
import { PatientTreatmentService } from '../../../services/patient-treatment.service';
import { PatientService } from '../../../services/patient.service';
import { TypeaheadComponent } from '../../../common/typeahead/typeahead';
import { AppointmentHelper } from '../../../common/appointment-helper';
import { SearchModel } from '../../../models/search.model';
import { Observable } from 'rxjs';
import { PatientTreatment } from '../../../models/patient-treatment.model';
import { Patient } from '../../../models/patient.model';
import { PatientTreatmentDetail } from '../../../models/patient-treatment-detail.model';
import { DataService } from '../../../services/data.service';

@Component({
  selector: 'app-create-billing',
  imports: [FormsModule, CommonModule, TypeaheadComponent],
  templateUrl: './create-billing.component.html',
  styleUrl: './create-billing.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateBillingComponent {
  newBilling: BillingRecord = this.initBillingRecord();
  billingStatuses = Object.values(BillingStatus);
  formSubmitted = false;

  selectedPatient: any | null = null;
  selectedDoctor: any | null = null;
  treatmentDetails: any[] = [];

  @Output() onBillingCreated = new EventEmitter<BillingRecord>();

  constructor(
    private billingService: BillingService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private searchService: SearchService,
    private util: UtilityService,
    private patientTreatmentService: PatientTreatmentService,
    private patientService: PatientService,
    private dataService: DataService
  ) {}

  private initBillingRecord(): BillingRecord {
    const record = new BillingRecord();
    record.Status = BillingStatus.Submitted;
    record.ServiceDate = new Date().toISOString().substring(0, 10);
    record.Subtotal = 0;
    record.TaxTotal = 0;
    record.DiscountTotal = 0;
    record.AdjustmentTotal = 0;
    record.Total = 0;
    record.AmountPaid = 0;
    record.BalanceDue = 0;
    record.Notes = '';
    return record;
  }

  getDoctors = (name: string): Observable<SearchModel[]> => {
    return AppointmentHelper.getDoctors(name, this.searchService, this.util);
  }

  getPatients = (name: string): Observable<SearchModel[]> => {
    return AppointmentHelper.getPatients(name, this.searchService, this.util);
  }

  displayName(d: any): string {
    return AppointmentHelper.displayName(d);
  }

  onPatientSelected(patient: any | null): void {
    this.selectedPatient = patient;
    if (!patient) {
      this.newBilling.PatientID = 0;
      this.newBilling.PatientName = '';
      this.treatmentDetails = [];
      this.calculateSubtotalFromGrid();
      this.cdr.markForCheck();
      return;
    }
    this.newBilling.PatientID = patient.PatientID || patient.ID || 0;
    this.newBilling.PatientName = `${patient.FirstName || ''} ${patient.LastName || ''}`.trim();

    const userId = patient.UserID || 0;
    const patientId = patient.PatientID || patient.ID || 0;

    if (userId > 0) {
      this.loadPatientTreatments(userId);
    } else if (patientId > 0) {
      // Fetch full patient to get UserID
      this.patientService.getPatient(patientId).subscribe({
        next: (p: Patient) => {
          if (p && p.UserID) {
            this.loadPatientTreatments(p.UserID);
          } else {
            this.treatmentDetails = [];
            this.calculateSubtotalFromGrid();
          }
        },
        error: (err: any) => {
          this.messageService.error('Error fetching patient details: ' + (err.message || err));
          this.treatmentDetails = [];
          this.calculateSubtotalFromGrid();
        }
      });
    } else {
      this.treatmentDetails = [];
      this.calculateSubtotalFromGrid();
    }
  }

  onDoctorSelected(doctor: any | null): void {
    this.selectedDoctor = doctor;
    if (!doctor) {
      this.newBilling.DoctorID = 0;
      this.newBilling.DoctorName = '';
      this.cdr.markForCheck();
      return;
    }
    this.newBilling.DoctorID = doctor.UserID || doctor.DoctorID || 0;
    this.newBilling.DoctorName = `${doctor.FirstName || ''} ${doctor.LastName || ''}`.trim();
    this.cdr.markForCheck();
  }

  loadPatientTreatments(userId: number): void {
    this.patientTreatmentService.getAllTreatmentsForUser(userId).subscribe({
      next: (treatments: PatientTreatment[]) => {
        this.treatmentDetails = [];
        if (treatments && treatments.length > 0) {
          treatments.forEach((treatment: PatientTreatment) => {
            if (treatment.PatientTreatmentDetails && treatment.PatientTreatmentDetails.length > 0) {
              treatment.PatientTreatmentDetails.forEach((d: PatientTreatmentDetail) => {
                this.treatmentDetails.push({
                  ...d,
                  selected: true,
                  PatientTreatmentID: treatment.ID
                });
              });
            } else {
              // Fallback: create a row from treatment-level data when no details exist
              this.treatmentDetails.push({
                ID: 0,
                PatientTreatmentID: treatment.ID,
                Procedure: treatment.TreatmentPlan || 'General Treatment',
                ProcedureTreatmentCost: treatment.ActualCost || treatment.EstimatedCost || 0,
                TreatmentDate: treatment.TreatmentDate || this.util.formatDate(new Date(), 'yyyy-MM-dd'),
                selected: true
              });
            }
          });
        }
        this.calculateSubtotalFromGrid();
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        this.messageService.error('Error fetching patient treatments: ' + (err.message || err));
        this.treatmentDetails = [];
        this.calculateSubtotalFromGrid();
        this.cdr.markForCheck();
      }
    });
  }

  calculateSubtotalFromGrid(): void {
    let subtotal = 0;
    this.treatmentDetails.forEach(item => {
      if (item.selected) {
        subtotal += Number(item.ProcedureTreatmentCost) || 0;
      }
    });
    this.newBilling.Subtotal = subtotal;

    const selectedDetails = this.treatmentDetails.filter(d => d.selected);
    if (selectedDetails.length > 0) {
      this.newBilling.TreatmentName = selectedDetails.map(d => d.Procedure || 'General Service').join(', ');
      if (this.newBilling.TreatmentName.length > 200) {
        this.newBilling.TreatmentName = this.newBilling.TreatmentName.substring(0, 197) + '...';
      }
      this.newBilling.TreatmentID = selectedDetails[0].PatientTreatmentID || selectedDetails[0].ID || 0;
    } else {
      this.newBilling.TreatmentName = '';
      this.newBilling.TreatmentID = 0;
    }

    this.calculateTotal();
  }

  addCustomTreatmentDetail(): void {
    const newDetail = {
      ID: 0,
      PatientTreatmentID: 0,
      Procedure: '',
      Tooth: '',
      ProcedureTreatmentCost: 0,
      TreatmentDate: this.util.formatDate(new Date(), 'yyyy-MM-dd'),
      selected: true
    };
    this.treatmentDetails.push(newDetail);
    this.calculateSubtotalFromGrid();
    this.cdr.markForCheck();
  }

  removeTreatmentDetail(index: number): void {
    this.treatmentDetails.splice(index, 1);
    this.calculateSubtotalFromGrid();
    this.cdr.markForCheck();
  }

  calculateTotal(): void {
    const subtotal = Number(this.newBilling.Subtotal) || 0;
    const tax = Number(this.newBilling.TaxTotal) || 0;
    const discount = Number(this.newBilling.DiscountTotal) || 0;
    const adjustment = Number(this.newBilling.AdjustmentTotal) || 0;

    this.newBilling.Total = subtotal + tax - discount + adjustment;
    this.newBilling.BalanceDue = this.newBilling.Total - (this.newBilling.AmountPaid || 0);
    this.cdr.markForCheck();
  }

  CreateBilling(form: any): void {
    this.formSubmitted = true;
    if (!form.valid) {
      this.messageService.warn('Please fill out all required fields correctly');
      return;
    }

    if (!this.selectedPatient || !this.newBilling.PatientName) {
      this.messageService.warn('Please search and select a patient');
      return;
    }

    if (!this.selectedDoctor || !this.newBilling.DoctorName) {
      this.messageService.warn('Please search and select a doctor');
      return;
    }

    const selectedDetails = this.treatmentDetails.filter(d => d.selected);
    if (selectedDetails.length === 0) {
      this.messageService.warn('Please select at least one treatment / procedure from the grid');
      return;
    }

    if (Number(this.newBilling.Subtotal) <= 0) {
      this.messageService.warn('Subtotal must be greater than 0');
      return;
    }

    this.newBilling.TreatmentName = selectedDetails.map(d => d.Procedure || 'General Service').join(', ');
    if (this.newBilling.TreatmentName.length > 200) {
      this.newBilling.TreatmentName = this.newBilling.TreatmentName.substring(0, 197) + '...';
    }
    this.newBilling.TreatmentID = selectedDetails[0].PatientTreatmentID || selectedDetails[0].ID || 0;

    // Format dates and ensure numbers are properly parsed
    const billingToPost: BillingRecord = {
      ...this.newBilling,
      Subtotal: Number(this.newBilling.Subtotal),
      TaxTotal: Number(this.newBilling.TaxTotal),
      DiscountTotal: Number(this.newBilling.DiscountTotal),
      AdjustmentTotal: Number(this.newBilling.AdjustmentTotal),
      Total: Number(this.newBilling.Total),
      BalanceDue: Number(this.newBilling.BalanceDue),
      ServiceDate: new Date(this.newBilling.ServiceDate!).toISOString(),
      PostedDate: new Date().toISOString()
    };

    this.billingService.createBilling(billingToPost).subscribe({
      next: (createdRecord: BillingRecord) => {
        this.messageService.success('Billing record created successfully');
        this.formSubmitted = false;
        // Select the newly created record and navigate
        this.billingService.setSelectedBillingRecord(createdRecord);
        this.dataService.setBillingRecord(createdRecord);
        this.onBillingCreated.emit(createdRecord);
        this.router.navigate(['/billing/payment']);
        this.newBilling = this.initBillingRecord();
        this.selectedPatient = null;
        this.selectedDoctor = null;
        this.treatmentDetails = [];
        form.resetForm(this.newBilling);
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        this.messageService.error('Error creating billing record: ' + (err.message || err.statusText || err));
      }
    });
  }

  resetForm(form: any): void {
    this.newBilling = this.initBillingRecord();
    this.selectedPatient = null;
    this.selectedDoctor = null;
    this.treatmentDetails = [];
    this.formSubmitted = false;
    form.resetForm(this.newBilling);
    this.cdr.markForCheck();
  }
}
