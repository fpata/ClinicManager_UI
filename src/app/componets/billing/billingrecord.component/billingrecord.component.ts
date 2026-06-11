import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { AppDatePipe } from '../../../common/app-date.pipe';
import { BillingRecord, SearchResultBillingRecord, BillingStatus } from '../../../models/billing.model';
import { FormsModule } from '@angular/forms';
import { BillingService } from '../../../services/blling.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DataService } from '../../../services/data.service';
import { PatientTreatmentService } from '../../../services/patient-treatment.service';
import { PatientTreatment } from '../../../models/patient-treatment.model';

@Component({
  selector: 'app-billingrecord',
  imports: [FormsModule, CurrencyPipe, AppDatePipe, CommonModule],
  templateUrl: './billingrecord.component.html',
  styleUrl: './billingrecord.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BillingrecordComponent {
  billingRecord: BillingRecord = new BillingRecord();
  searchResult: SearchResultBillingRecord = new SearchResultBillingRecord();
  billingStatuses = Object.values(BillingStatus);
  selectedBillingRecord: BillingRecord | null = null;
  selectedTreatment: PatientTreatment | null = null;

  @Output() onRecordSelected = new EventEmitter<BillingRecord>();

  constructor(
    private billingService: BillingService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private dataService: DataService,
    private patientTreatmentService: PatientTreatmentService
  ) {}

  Search(): void {
    this.billingService.searchBillings(this.billingRecord).subscribe((result: SearchResultBillingRecord) => {
      this.searchResult = result;
      this.cdr.markForCheck();
    });
  }

  Clear(): void {
    this.billingRecord = new BillingRecord();
    this.searchResult = new SearchResultBillingRecord();
    this.cdr.markForCheck();
  }

  selectRecord(record: BillingRecord): void {
    this.billingService.setSelectedBillingRecord(record);
    this.dataService.setBillingRecord(record);
    this.onRecordSelected.emit(record);
    this.router.navigate(['/billing/payment']);
  }

  viewTreatmentDetails(record: BillingRecord): void {
    if (!record.TreatmentID) return;
    this.selectedBillingRecord = record;
    this.selectedTreatment = null;
    this.cdr.markForCheck();
    
    this.patientTreatmentService.getPatientTreatment(record.TreatmentID).subscribe({
      next: (treatment: PatientTreatment) => {
        this.selectedTreatment = treatment;
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        console.error('Error fetching treatment details:', err);
      }
    });
  }
}
