import { Payment } from "./payment.model";
import { BaseEntity } from "./base.model";

export class BillingRecord extends BaseEntity {
  TreatmentID: number;

  Status?: BillingStatus;
  Subtotal?: number;
  TaxTotal?: number;
  DiscountTotal?: number;
  Total?: number;                  // (Subtotal + Tax - Discount + Adjustment)
  AmountPaid?: number;
  BalanceDue?: number;

  Payments: Payment[] = [];
  Notes?: string;

  PageNumber: number = 1;
  PageSize: number = 10;

  // UI-only properties (Not mapped in the server-side BillingRecord database schema)
  PatientID?: number;
  DoctorID?: number;
  PatientName?: string;
  DoctorName?: string;
  TreatmentName?: string;
  ServiceDate?: string;            // ISO date (from StartApptDate)
  PostedDate?: string;             // When the bill was generated
  AdjustmentTotal?: number;
  Insurance?: InsuranceSegment;
  StartDate?: string;
  EndDate?: string;
}

export enum BillingStatus {
  Draft = 'Draft',
  Submitted = 'Submitted',
  PartiallyPaid = 'PartiallyPaid',
  Paid = 'Paid',
  Voided = 'Voided',
  Adjusted = 'Adjusted'
}

export class InsuranceSegment {
  PayerName?: string;
  PolicyNumber?: string;
  GroupNumber?: string;
  CoveragePercent?: number;     // e.g. 0.8 for 80%
  DeductibleApplied?: number;
  CopayAmount?: number;
  CoinsuranceAmount?: number;
  InsurancePortion?: number;    // Calculated
  PatientPortion?: number;      // Calculated
  AdjudicationRef?: string;
  Status?: InsuranceStatus;
}

export enum InsuranceStatus {
  Pending = 'Pending',
  Submitted = 'Submitted',
  Denied = 'Denied',
  Paid = 'Paid',
  Partial = 'Partial'
}

export class SearchResultBillingRecord {
  TotalCount: number = 0;
  HasMoreRecords: boolean = false;
  Message: string = '';
  billingRecords: BillingRecord[] = [];  
}