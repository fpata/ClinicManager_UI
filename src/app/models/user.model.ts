import { Address } from './address.model';
import { BaseEntity } from './base.model';
import { Contact } from './contact.model';
import { Patient } from './patient.model';

export class User extends BaseEntity {
  FirstName?: string;
  MiddleName?: string;
  LastName?: string;
  UserName?: string;
  Password?: string;
  UserType?: UserType;
  Gender?: Gender;
  DateOfBirth?: string | null;
  Age?: number;
  LastLoginDate?: string; // set via UtilityService when needed
  Address?: Address;
  Patients?: any;
  Contact?: Contact;
  FullName?: string;
  Designation?: string;
  LicenseNumber?: string;
  Specialization?: string;
  LicenseExpiryDate?: Date | null;        
}

 export enum UserType
 {
     Patient = 1,
     Doctor = 2,
     Nurse = 3,
     Receptionist = 4,
     Administrator = 5,
     Technician = 6,
     Accountant = 7,
     DentalAssistant = 8
 }

 export enum Gender
 {
     Male = 1,
     Female = 2,
     Other = 3,
     PreferNotToSay = 4
 }
