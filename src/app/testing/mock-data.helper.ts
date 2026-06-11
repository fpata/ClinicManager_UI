import { User, UserType, Gender } from '../models/user.model';
import { Patient } from '../models/patient.model';
import { PatientAppointment } from '../models/patient-appointment.model';
import { Address } from '../models/address.model';
import { Contact } from '../models/contact.model';
import { Message, MessageType } from '../models/message.model';

export class MockDataHelper {
  static createMockUser(overrides?: Partial<User>): User {
    return {
      ID: 1,
      FirstName: 'John',
      LastName: 'Doe',
      UserName: 'johndoe',
      UserType: UserType.Patient,
      Gender: Gender.Male,
      DateOfBirth: '1985-05-15',
      Age: 38,
      FullName: 'John Doe',
      Designation: 'Patient',
      CreatedDate: '2023-01-01T00:00:00Z',
      ModifiedDate: '2023-08-19T00:00:00Z',
      CreatedBy: 1,
      ModifiedBy: 1,
      IsActive: 1,
      ...overrides
    };
  }

  static createMockDoctor(overrides?: Partial<User>): User {
    return this.createMockUser({
      ID: 2,
      FirstName: 'Dr. Jane',
      LastName: 'Smith',
      UserName: 'drjanesmith',
      UserType: UserType.Doctor,
      FullName: 'Dr. Jane Smith',
      Designation: 'Cardiologist',
      LicenseNumber: 'LIC123456',
      Specialization: 'Cardiology',
      LicenseExpiryDate: new Date('2025-12-31'),
      ...overrides
    });
  }

  static createMockPatient(overrides?: Partial<Patient>): Patient {
    return {
      ID: 1,
      UserID: 1,
      Allergies: 'Peanuts, Shellfish',
      Medications: 'Aspirin 81mg daily',
      FatherMedicalHistory: 'Diabetes',
      MotherMedicalHistory: 'Hypertension',
      PersonalMedicalHistory: 'No significant history',
      InsuranceProvider: 'Blue Cross',
      InsurancePolicyNumber: 'BC123456789',
      Height: 175,
      Weight: 70,
      CreatedDate: '2023-01-01T00:00:00Z',
      ModifiedDate: '2023-08-19T00:00:00Z',
      CreatedBy: 1,
      ModifiedBy: 1,
      IsActive: 1,
      ...overrides
    };
  }


  static createMockAddress(overrides?: Partial<Address>): Address {
    return {
      ID: 1,
      PermAddress1: '123 Main St',
      PermAddress2: 'Apt 4B',
      PermCity: 'New York',
      PermState: 'NY',
      PermZipCode: '10001',
      PermCountry: 'USA',
      CorrAddress1: '123 Main St',
      CorrAddress2: 'Apt 4B',
      CorrCity: 'New York',
      CorrState: 'NY',
      CorrZipCode: '10001',
      CorrCountry: 'USA',
      AddressType: 'Permanent',
      UserID: 1,
      CreatedDate: '2023-01-01T00:00:00Z',
      ModifiedDate: '2023-08-19T00:00:00Z',
      CreatedBy: 1,
      ModifiedBy: 1,
      IsActive: 1,
      ...overrides
    };
  }

  static createMockContact(overrides?: Partial<Contact>): Contact {
    return {
      ID: 1,
      PrimaryPhone: '(555) 123-4567',
      SecondaryPhone: '(555) 987-6543',
      PrimaryEmail: 'john.doe@email.com',
      SecondaryEmail: 'johndoe.alt@email.com',
      RelativeName: 'Jane Doe',
      RelativeRealtion: 'Spouse',
      RelativePhone: '(555) 111-2222',
      RelativeEmail: 'jane.doe@email.com',
      UserID: 1,
      CreatedDate: '2023-01-01T00:00:00Z',
      ModifiedDate: '2023-08-19T00:00:00Z',
      CreatedBy: 1,
      ModifiedBy: 1,
      IsActive: 1,
      ...overrides
    };
  }

  static createMockMessage(overrides?: Partial<Message>): Message {
    return {
      id: 1,
      message: 'Test message',
      type: MessageType.Info,
      autoClose: false,
      keepAfterRouteChange: false,
      fade: false,
      ...overrides
    };
  }

  static createMockCompletePatient(userOverrides?: Partial<User>, patientOverrides?: Partial<Patient>) {
    const user = this.createMockUser(userOverrides);
    const patient = this.createMockPatient(patientOverrides);
    return {
      ...user,
      Patients: [patient],
      Address: this.createMockAddress(),
      Contact: this.createMockContact()
    };
  }
}
