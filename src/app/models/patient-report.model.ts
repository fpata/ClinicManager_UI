import { User } from './user.model';
import { Patient } from './patient.model';
export class PatientReport {
  ID: number;
  UserID?: number;
  ReportName?: string;
  ReportDetails?: string;
  ReportFilePath?: string;
  DoctorID?: number;
  DoctorName?: string;
  ReportDate?: string;
  PatientID?: number;
  IsActive?: number = 1;
  CreatedDate?: string; // set via UtilityService
  CreatedBy?: number = 1;
  ModifiedDate?: string; // set via UtilityService
  ModifiedBy?: number = 1;
  user?: User;
  patient?: Patient;
}
