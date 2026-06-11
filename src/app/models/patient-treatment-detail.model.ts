import { User } from './user.model';
import { PatientTreatment } from './patient-treatment.model';
export class PatientTreatmentDetail {
  ID: number;
  PatientTreatmentID: number;
  UserID?: number;
  Tooth?: string;
  Procedure?: string;
  Prescription?: string;
  TreatmentDate?: string;
  PatientID?: number;
  IsActive?: number = 1;
  CreatedDate?: string; // set via UtilityService
  CreatedBy?: number = 1;
  ModifiedDate?: string; // set via UtilityService
  ModifiedBy?: number = 1;
  user?: User;
  patientTreatment?: PatientTreatment;
  FollowUpInstructions?: string;
  FollowUpDate?: string;
  ProcedureTreatmentCost?: number;
}
