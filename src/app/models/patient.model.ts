import { User } from './user.model';
import { PatientAppointment } from './patient-appointment.model';
import { PatientReport } from './patient-report.model';
import { PatientTreatment } from './patient-treatment.model';
import { BaseEntity } from './base.model';
import { PatientVitals } from './patient-vitals.model';

export class Patient extends BaseEntity {
  UserID?: number;
  Allergies: string;
  Medications?: string;
  FatherMedicalHistory?: string;
  MotherMedicalHistory?: string;
  PersonalMedicalHistory?: string;
  InsuranceProvider:string;
  InsurancePolicyNumber:string;
  Height :number; // in cm
  Weight :number; // in kg

  user?: User;
  PatientAppointments?: PatientAppointment[];
  PatientReports?: PatientReport[];
  PatientTreatment?: PatientTreatment;
  PatientVitals?: PatientVitals[];
}
