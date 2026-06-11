import { User } from './user.model';
import { Patient } from './patient.model';
import { PatientTreatmentDetail } from './patient-treatment-detail.model';
export class PatientTreatment {
  ID: number;
  UserID: number;
  ChiefComplaint: string;
  TreatmentPlan: string;
  PatientID?: number;
  IsActive?: number ;
  CreatedDate?: string; // set via UtilityService
  CreatedBy?: number ;
  ModifiedDate?: string; // set via UtilityService
  ModifiedBy?: number;
  TreatmentDate?: string ;
  user?: User;
  patient?: Patient;
  PatientTreatmentDetails?: PatientTreatmentDetail[];
  EstimatedCost: number;
  ActualCost?: number;
  ClinicalFindings?: string;
  Diagnosis?: string;
  Prescription?: string;
  PaymentStatus?: string;
  AppointmentID?: number;
  DoctorID?: number;
}
