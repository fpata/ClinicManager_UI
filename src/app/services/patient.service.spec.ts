import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PatientService } from './patient.service';
import { Patient } from '../models/patient.model';
import { User, UserType, Gender } from '../models/user.model';
import { environment } from '../../environments/environment';

describe('PatientService', () => {
  let service: PatientService;
  let httpMock: HttpTestingController;

  const mockPatient: Patient = {
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
    IsActive: 1
  };

  const mockUser: User = {
    ID: 1,
    FirstName: 'John',
    LastName: 'Doe',
    UserName: 'johndoe',
    UserType: UserType.Patient,
    Gender: Gender.Male,
    DateOfBirth: '1985-05-15',
    Age: 38,
    FullName: 'John Doe',
    CreatedDate: '2023-01-01T00:00:00Z',
    ModifiedDate: '2023-08-19T00:00:00Z',
    CreatedBy: 1,
    ModifiedBy: 1,
    IsActive: 1
  };

  const mockCompletePatient = {
    ...mockUser,
    Patients: [mockPatient]
  };

  const mockPatients: Patient[] = [
    mockPatient,
    {
      ...mockPatient,
      ID: 2,
      UserID: 2,
      Allergies: 'None',
      InsuranceProvider: 'Aetna',
      InsurancePolicyNumber: 'AET987654321'
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PatientService]
    });
    service = TestBed.inject(PatientService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.setItem('token', 'mock-bearer-token');
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('HTTP Headers', () => {
    it('should include Authorization header on getPatients', () => {
      service.getPatients().subscribe();
      const req = httpMock.expectOne(`${environment.API_BASE_URL}/patient`);
      expect(req.request.headers.get('Authorization')).toBe('Bearer mock-bearer-token');
      req.flush(mockPatients);
    });

    it('should include Authorization header on POST requests', () => {
      service.createPatient(mockPatient).subscribe();
      const req = httpMock.expectOne(`${environment.API_BASE_URL}/patient`);
      expect(req.request.headers.get('Authorization')).toBe('Bearer mock-bearer-token');
      req.flush(mockPatient);
    });
  });

  describe('Patient CRUD Operations', () => {
    it('should get all patients', () => {
      service.getPatients().subscribe(patients => {
        expect(patients).toEqual(mockPatients);
        expect(patients.length).toBe(2);
      });

      const req = httpMock.expectOne(`${environment.API_BASE_URL}/patient`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPatients);
    });

    it('should get patient by ID', () => {
      const patientId = 1;
      service.getPatient(patientId).subscribe(patient => {
        expect(patient).toEqual(mockPatient);
      });

      const req = httpMock.expectOne(`${environment.API_BASE_URL}/patient/${patientId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPatient);
    });

    it('should get complete patient data', () => {
      const patientId = 1;
      service.getCompletePatient(patientId).subscribe(patient => {
        expect(patient).toEqual(mockCompletePatient);
      });

      const req = httpMock.expectOne(`${environment.API_BASE_URL}/patient/Complete/${patientId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCompletePatient);
    });

    it('should create a new patient', () => {
      service.createPatient(mockPatient).subscribe(patient => {
        expect(patient).toEqual(mockPatient);
      });

      const req = httpMock.expectOne(`${environment.API_BASE_URL}/patient`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockPatient);
      req.flush(mockPatient);
    });

    it('should update an existing patient', () => {
      const updatedPatient = { ...mockPatient, Allergies: 'Updated allergies' };
      
      service.updatePatient(mockPatient.ID!, updatedPatient).subscribe(patient => {
        expect(patient).toEqual(updatedPatient);
      });

      const req = httpMock.expectOne(`${environment.API_BASE_URL}/patient/${mockPatient.ID}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedPatient);
      req.flush(updatedPatient);
    });

    it('should delete a patient', () => {
      const patientId = 1;
      
      service.deletePatient(patientId).subscribe(response => {
        expect(response).toBeNull();
      });

      const req = httpMock.expectOne(`${environment.API_BASE_URL}/patient/${patientId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 error when getting non-existent patient', () => {
      const patientId = 999;
      
      service.getPatient(patientId).subscribe(
        () => fail('Expected error'),
        error => {
          expect(error.status).toBe(404);
          expect(error.statusText).toBe('Not Found');
        }
      );

      const req = httpMock.expectOne(`${environment.API_BASE_URL}/patient/${patientId}`);
      req.flush('Patient not found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle validation error on create patient', () => {
      const invalidPatient: any = { ...mockPatient, UserID: undefined };
      
      service.createPatient(invalidPatient as Patient).subscribe(
        () => fail('Expected error'),
        error => {
          expect(error.status).toBe(400);
          expect(error.statusText).toBe('Bad Request');
        }
      );

      const req = httpMock.expectOne(`${environment.API_BASE_URL}/patient`);
      req.flush('Validation failed', { status: 400, statusText: 'Bad Request' });
    });

    it('should handle server error', () => {
      service.getPatients().subscribe(
        () => fail('Expected error'),
        error => {
          expect(error.status).toBe(500);
          expect(error.statusText).toBe('Internal Server Error');
        }
      );

      const req = httpMock.expectOne(`${environment.API_BASE_URL}/patient`);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('Authorization', () => {
    it('should handle unauthorized access', () => {
      localStorage.removeItem('token');
      
      service.getPatients().subscribe(
        () => fail('Expected error'),
        error => {
          expect(error.status).toBe(401);
        }
      );

      const req = httpMock.expectOne(`${environment.API_BASE_URL}/patient`);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });

    it('should handle forbidden access', () => {
      service.getPatients().subscribe(
        () => fail('Expected error'),
        error => {
          expect(error.status).toBe(403);
        }
      );

      const req = httpMock.expectOne(`${environment.API_BASE_URL}/patient`);
      req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty response', () => {
      service.getPatients().subscribe(patients => {
        expect(patients).toEqual([]);
      });

      const req = httpMock.expectOne(`${environment.API_BASE_URL}/patient`);
      req.flush([]);
    });

    it('should handle malformed response', () => {
      service.getPatients().subscribe(
        () => fail('Expected error'),
        error => {
          expect(error).toBeDefined();
        }
      );

      const req = httpMock.expectOne(`${environment.API_BASE_URL}/patient`);
      req.flush('invalid json', { status: 400, statusText: 'Bad Request' });
    });

    it('should handle network timeout', () => {
      service.getPatients().subscribe(
        () => fail('Expected error'),
        error => {
          expect(error).toBeDefined();
          expect(error.status).toBe(0);
        }
      );

      const req = httpMock.expectOne(`${environment.API_BASE_URL}/patient`);
      req.error(new ErrorEvent('timeout'), { status: 0, statusText: 'Unknown Error' });
    });
  });
});
