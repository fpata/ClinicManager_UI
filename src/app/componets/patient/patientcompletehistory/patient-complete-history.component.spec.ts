import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError, BehaviorSubject } from 'rxjs';
import { PatientCompleteHistoryComponent } from './patient-complete-history.component';
import { DataService } from '../../../services/data.service';
import { PatientService } from '../../../services/patient.service';
import { PatientTreatmentService } from '../../../services/patient-treatment.service';
import { User, UserType, Gender } from '../../../models/user.model';
import { Patient } from '../../../models/patient.model';
import { PatientTreatment } from '../../../models/patient-treatment.model';

describe('PatientCompleteHistoryComponent', () => {
  let component: PatientCompleteHistoryComponent;
  let fixture: ComponentFixture<PatientCompleteHistoryComponent>;

  let dataServiceSpy: jasmine.SpyObj<DataService>;
  let patientServiceSpy: jasmine.SpyObj<PatientService>;
  let patientTreatmentServiceSpy: jasmine.SpyObj<PatientTreatmentService>;

  let mockUser: User;
  let mockPatient: Patient;
  let mockTreatments: PatientTreatment[];

  beforeEach(async () => {
    mockPatient = {
      ID: 456,
      UserID: 123,
      Allergies: 'Pollen',
      Medications: 'None',
      InsuranceProvider: 'Insurance Corp',
      InsurancePolicyNumber: 'POL987',
      Height: 170,
      Weight: 65,
      CreatedDate: '2026-05-26T00:00:00',
      ModifiedDate: '2026-05-26T00:00:00',
      CreatedBy: 1,
      ModifiedBy: 1,
      IsActive: 1
    };

    mockUser = {
      ID: 123,
      FirstName: 'Jane',
      LastName: 'Doe',
      UserName: 'janedoe',
      UserType: UserType.Patient,
      Gender: Gender.Female,
      DateOfBirth: '1995-05-05',
      Age: 31,
      FullName: 'Jane Doe',
      CreatedDate: '2026-05-26T00:00:00',
      ModifiedDate: '2026-05-26T00:00:00',
      CreatedBy: 1,
      ModifiedBy: 1,
      IsActive: 1,
      Patients: [mockPatient]
    };

    mockTreatments = [
      {
        ID: 1,
        UserID: 123,
        PatientID: 456,
        ChiefComplaint: 'Toothache',
        TreatmentPlan: 'Fill tooth',
        IsActive: 1,
        EstimatedCost: 200,
        ActualCost: 200
      }
    ];

    const userSubject = new BehaviorSubject<User | null>(mockUser);
    dataServiceSpy = jasmine.createSpyObj('DataService', ['getUser', 'setUser'], {
      user$: userSubject.asObservable()
    });
    dataServiceSpy.getUser.and.returnValue(mockUser);

    patientServiceSpy = jasmine.createSpyObj('PatientService', ['getPatient']);
    patientServiceSpy.getPatient.and.returnValue(of(mockPatient));

    patientTreatmentServiceSpy = jasmine.createSpyObj('PatientTreatmentService', ['getAllTreatmentsForUser']);
    patientTreatmentServiceSpy.getAllTreatmentsForUser.and.returnValue(of(mockTreatments));

    await TestBed.configureTestingModule({
      imports: [PatientCompleteHistoryComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: DataService, useValue: dataServiceSpy },
        { provide: PatientService, useValue: patientServiceSpy },
        { provide: PatientTreatmentService, useValue: patientTreatmentServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientCompleteHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch patient data and update user patients in dataService when OnPatientIdClick is called', () => {
    const newPatient: Patient = { ...mockPatient, ID: 456, Allergies: 'Peanuts' };
    patientServiceSpy.getPatient.and.returnValue(of(newPatient));
    
    component.OnPatientIdClick(456);

    expect(patientServiceSpy.getPatient).toHaveBeenCalledWith(456);
    expect(dataServiceSpy.getUser).toHaveBeenCalled();
    
    const updatedUser = dataServiceSpy.setUser.calls.mostRecent().args[0];
    expect(updatedUser.Patients[0]).toEqual(newPatient);
    expect(component.user).toEqual(updatedUser);
  });

  it('should handle patient fetch error in OnPatientIdClick', () => {
    spyOn(console, 'error');
    patientServiceSpy.getPatient.and.returnValue(throwError(() => new Error('Patient fetch failed')));

    component.OnPatientIdClick(456);

    expect(console.error).toHaveBeenCalled();
  });

  it('should fetch and update patient treatments when GetAllTreatmentsForUser is called', () => {
    component.GetAllTreatmentsForUser(123);

    expect(patientTreatmentServiceSpy.getAllTreatmentsForUser).toHaveBeenCalledWith(123);
    expect(component.patientTreatments).toEqual(mockTreatments);
  });

  it('should handle treatments fetch error in GetAllTreatmentsForUser', () => {
    spyOn(console, 'error');
    patientTreatmentServiceSpy.getAllTreatmentsForUser.and.returnValue(throwError(() => new Error('Treatments fetch failed')));

    component.GetAllTreatmentsForUser(123);

    expect(console.error).toHaveBeenCalled();
    expect(component.patientTreatments).toEqual([]);
  });
});
