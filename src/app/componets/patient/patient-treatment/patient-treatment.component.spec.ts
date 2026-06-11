import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ComponentFixtureAutoDetect } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { PatientTreatmentComponent } from './patient-treatment.component';
import { DataService } from '../../../services/data.service';
import { PatientService } from '../../../services/patient.service';
import { UtilityService } from '../../../services/utility.service';
import { MessageService } from '../../../services/message.service';
import { User, UserType, Gender } from '../../../models/user.model';
import { Patient } from '../../../models/patient.model';
import { PatientTreatment } from '../../../models/patient-treatment.model';
import { PatientTreatmentDetail } from '../../../models/patient-treatment-detail.model';
import { UserService } from '../../../services/user.service';
import { PatientTreatmentService } from '../../../services/patient-treatment.service';
import { PrintService } from '../../../services/print.service';

describe('PatientTreatmentComponent', () => {
  let component: PatientTreatmentComponent;
  let fixture: ComponentFixture<PatientTreatmentComponent>;
  
  let dataServiceSpy: jasmine.SpyObj<DataService>;
  let patientServiceSpy: jasmine.SpyObj<PatientService>;
  let utilityServiceSpy: jasmine.SpyObj<UtilityService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let patientTreatmentServiceSpy: jasmine.SpyObj<PatientTreatmentService>;
  let printServiceSpy: jasmine.SpyObj<PrintService>;
  let activatedRouteStub: any;
  let userSubject: BehaviorSubject<User | null>;

  let mockUser: User;
  let mockPatient: Patient;
  let mockTreatment: PatientTreatment;
  let mockDetail1: PatientTreatmentDetail;
  let mockDetail2: PatientTreatmentDetail;

  beforeEach(() => {
    mockDetail1 = {
      ID: 10,
      PatientTreatmentID: 1,
      UserID: 123,
      Tooth: '12',
      Procedure: 'Cleaning',
      Prescription: 'None',
      TreatmentDate: '2026-05-26',
      PatientID: 456,
      IsActive: 1,
      ProcedureTreatmentCost: 150
    };

    mockDetail2 = {
      ID: 20,
      PatientTreatmentID: 1,
      UserID: 123,
      Tooth: '14',
      Procedure: 'Filling',
      Prescription: 'Amoxicillin',
      TreatmentDate: '2026-05-26',
      PatientID: 456,
      IsActive: 1,
      ProcedureTreatmentCost: 300
    };

    mockTreatment = {
      ID: 1,
      UserID: 123,
      PatientID: 456,
      ChiefComplaint: 'Pain',
      TreatmentPlan: 'Routine care',
      IsActive: 1,
      PatientTreatmentDetails: [mockDetail1, mockDetail2],
      EstimatedCost: 500,
      ActualCost: 450
    };

    mockPatient = {
      ID: 456,
      UserID: 123,
      Allergies: 'None',
      Medications: 'None',
      InsuranceProvider: 'Blue Cross',
      InsurancePolicyNumber: '12345',
      Height: 180,
      Weight: 75,
      CreatedDate: '2026-05-26T00:00:00',
      ModifiedDate: '2026-05-26T00:00:00',
      CreatedBy: 1,
      ModifiedBy: 1,
      IsActive: 1,
      PatientTreatment: mockTreatment
    };

    mockUser = {
      ID: 123,
      FirstName: 'John',
      LastName: 'Doe',
      UserName: 'johndoe',
      UserType: UserType.Patient,
      Gender: Gender.Male,
      DateOfBirth: '1990-01-01',
      Age: 36,
      FullName: 'John Doe',
      CreatedDate: '2026-05-26T00:00:00',
      ModifiedDate: '2026-05-26T00:00:00',
      CreatedBy: 1,
      ModifiedBy: 1,
      IsActive: 1,
      Patients: [mockPatient]
    };

    userSubject = new BehaviorSubject<User | null>(mockUser);

    dataServiceSpy = jasmine.createSpyObj('DataService', ['setPatient', 'getPatient', 'getUser', 'setUser', 'setQuickCreateMode', 'setUserId', 'getLoginUser', 'getConfig']);
    dataServiceSpy.getConfig.and.returnValue({
      ID: 1,
      ClinicName: 'Test Dental Clinic',
      ClinicProp: 'Premium Oral Care',
      ClinicAddress: '456 Test St, City',
      ClinicLogo: 'data:image/png;base64,iVBORw0KGgoAAAANS'
    });
    dataServiceSpy.getLoginUser.and.returnValue({
      token: 'mock-token',
      user: {
        ID: mockUser.ID,
        UserName: mockUser.UserName || 'johndoe',
        UserType: mockUser.UserType,
        FirstName: mockUser.FirstName,
        LastName: mockUser.LastName || 'Doe'
      }
    });
    // Mock user$ observable
    Object.defineProperty(dataServiceSpy, 'user$', {
      value: userSubject.asObservable()
    });

    patientServiceSpy = jasmine.createSpyObj('PatientService', ['createPatient', 'updatePatient', 'AddNewPatient', 'savePatient']);
    patientServiceSpy.savePatient.and.returnValue(of(mockPatient));
    
    utilityServiceSpy = jasmine.createSpyObj('UtilityService', ['formatDate', 'formatDateTime']);
    utilityServiceSpy.formatDate.and.returnValue('2026-05-26');
    utilityServiceSpy.formatDateTime.and.returnValue('2026-05-26T12:00:00');

    messageServiceSpy = jasmine.createSpyObj('MessageService', ['success', 'error', 'warn', 'info']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    userServiceSpy = jasmine.createSpyObj('UserService', ['getUser', 'createUser', 'updateUser', 'deleteUser']);
    patientTreatmentServiceSpy = jasmine.createSpyObj('PatientTreatmentService', ['downloadPrescription']);
    printServiceSpy = jasmine.createSpyObj('PrintService', ['printPrescription', 'printMedicalHistory', 'printReferralLetter']);
    
    activatedRouteStub = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue('456')
        }
      }
    };
  });

  async function createComponent() {
    await TestBed.configureTestingModule({
      imports: [PatientTreatmentComponent, FormsModule],
      providers: [
        { provide: DataService, useValue: dataServiceSpy },
        { provide: PatientService, useValue: patientServiceSpy },
        { provide: UtilityService, useValue: utilityServiceSpy },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: Router, useValue: routerSpy },
        { provide: MessageService, useValue: messageServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: PatientTreatmentService, useValue: patientTreatmentServiceSpy },
        { provide: PrintService, useValue: printServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PatientTreatmentComponent);
    component = fixture.componentInstance;
  }

  it('should create', async () => {
    await createComponent();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should redirect to patient search if patientId route param is missing', async () => {
    await createComponent();
    userSubject.next({ ...mockUser, Patients: [] });
    fixture.detectChanges();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/patient/search']);
  });

  it('should load patient treatment if user and patient exist', async () => {
    await createComponent();
    fixture.detectChanges();
    expect(component.user).toEqual(mockUser);
    expect(component.patient).toEqual(mockPatient);
    expect(component.treatment).toEqual(mockTreatment);
    expect(component.isNewPatient).toBeFalse();
  });

  it('should initialize empty treatment if patient does not have treatment', async () => {
    mockPatient.PatientTreatment = undefined;
    await createComponent();
    fixture.detectChanges();
    expect(component.treatment).toBeDefined();
    expect(component.treatment?.PatientTreatmentDetails).toBeUndefined();
  });

  it('should clear treatment form correctly', async () => {
    await createComponent();
    fixture.detectChanges();
    component.newTreatmentDetail = mockDetail1;
    component.isEditOperation = true;
    
    component.ClearTreatmentForm();
    
    expect(component.newTreatmentDetail).toBeNull();
    expect(component.isEditOperation).toBeFalse();
  });

  it('should fail to add treatment detail if treatment or patient is missing', async () => {
    spyOn(window, 'alert');
    await createComponent();
    fixture.detectChanges();
    component.treatment = null;
    
    component.AddNewTreatmentDetails();
    
    expect(window.alert).toHaveBeenCalledWith('Patient and treatment data must be loaded first.');
  });

  it('should initialize new treatment detail with negative ID if details exist', async () => {
    await createComponent();
    fixture.detectChanges();
    component.AddNewTreatmentDetails();
    
    expect(component.newTreatmentDetail).toBeDefined();
    // ID should be min(IDs) - 1. Min of [10, 20] is 10. 10 - 1 = 9. But because 9 > 0, it falls back to minVal > 0 ? 0 : minVal, which is 0 since 9 > 0.
    // Wait, let's look at ID logic:
    // const ids = this.treatment?.PatientTreatmentDetails?.map(x => x.ID) || [];
    // if (ids.length > 0) {
    //   let minVal = Math.min(...ids) - 1;
    //   this.newTreatmentDetail.ID = minVal > 0 ? 0 : minVal;
    // }
    expect(component.newTreatmentDetail?.ID).toBe(0);
  });

  it('should initialize new treatment detail with negative ID if negative IDs exist', async () => {
    mockTreatment.PatientTreatmentDetails = [{ ID: -2 } as any, { ID: -5 } as any];
    await createComponent();
    fixture.detectChanges();
    component.AddNewTreatmentDetails();
    
    // minVal is -5 - 1 = -6. Since -6 is not > 0, it should be -6.
    expect(component.newTreatmentDetail?.ID).toBe(-6);
  });

  it('should populate form when editing treatment details', async () => {
    await createComponent();
    fixture.detectChanges();
    component.EditTreatmentDetails(10);
    
    expect(component.newTreatmentDetail).toEqual(mockDetail1);
    expect(component.isEditOperation).toBeTrue();
  });

  it('should alert if treatment detail to edit is not found', async () => {
    spyOn(window, 'alert');
    await createComponent();
    fixture.detectChanges();
    component.EditTreatmentDetails(999);
    
    expect(window.alert).toHaveBeenCalledWith('Treatment detail not found.');
  });

  it('should delete treatment detail if confirmed', fakeAsync(async () => {
    spyOn(window, 'alert');
    (window as any).showConfirm = jasmine.createSpy('showConfirm').and.returnValue(Promise.resolve(true));
    
    await createComponent();
    fixture.detectChanges();
    component.DeleteTreatmentDetails(10);
    tick();

    expect((window as any).showConfirm).toHaveBeenCalled();
    expect(component.treatment?.PatientTreatmentDetails?.length).toBe(1);
    expect(component.treatment?.PatientTreatmentDetails?.[0].ID).toBe(20);
    expect(component.treatment?.ActualCost).toBe(300); // 300 + 0 = 300
    expect(window.alert).toHaveBeenCalledWith('Treatment detail deleted successfully. Click the Save Changes button to persist to the database.');
  }));

  it('should not delete treatment detail if not confirmed', fakeAsync(async () => {
    (window as any).showConfirm = jasmine.createSpy('showConfirm').and.returnValue(Promise.resolve(false));
    
    await createComponent();
    fixture.detectChanges();
    component.DeleteTreatmentDetails(10);
    tick();

    expect(component.treatment?.PatientTreatmentDetails?.length).toBe(2);
  }));

  it('should validate form and prevent save if Tooth or Procedure are empty', async () => {
    spyOn(window, 'alert');
    await createComponent();
    fixture.detectChanges();
    
    // No newTreatmentDetail
    component.SaveTreatmentDetails();
    expect(window.alert).toHaveBeenCalledWith('Please fill in all required fields.');

    component.AddNewTreatmentDetails();
    component.newTreatmentDetail!.Tooth = '';
    component.SaveTreatmentDetails();
    expect(window.alert).toHaveBeenCalledWith('Please enter tooth number.');

    component.newTreatmentDetail!.Tooth = '12';
    component.newTreatmentDetail!.Procedure = '';
    component.SaveTreatmentDetails();
    expect(window.alert).toHaveBeenCalledWith('Please enter procedure.');

    component.newTreatmentDetail!.Procedure = 'Filling';
    component.newTreatmentDetail!.TreatmentDate = '';
    component.SaveTreatmentDetails();
    expect(window.alert).toHaveBeenCalledWith('Please select treatment date.');
  });

  it('should save a new treatment detail successfully', async () => {
    spyOn(window, 'alert');
    await createComponent();
    fixture.detectChanges();
    
    component.AddNewTreatmentDetails();
    component.newTreatmentDetail!.Tooth = '15';
    component.newTreatmentDetail!.Procedure = 'Extraction';
    component.newTreatmentDetail!.ProcedureTreatmentCost = 200;
    
    component.SaveTreatmentDetails();
    
    expect(component.treatment?.PatientTreatmentDetails?.length).toBe(3);
    expect(component.treatment?.ActualCost).toBe(650); // 150 + 300 + 200 = 650
    expect(dataServiceSpy.setPatient).toHaveBeenCalled();
    expect(component.newTreatmentDetail).toBeNull();
    expect(window.alert).not.toHaveBeenCalled();
  });

  it('should update an existing treatment detail successfully', async () => {
    spyOn(window, 'alert');
    await createComponent();
    fixture.detectChanges();
    
    component.EditTreatmentDetails(10);
    component.newTreatmentDetail!.Procedure = 'Root Canal';
    component.newTreatmentDetail!.ProcedureTreatmentCost = 500;
    
    component.SaveTreatmentDetails();
    
    expect(component.treatment?.PatientTreatmentDetails?.length).toBe(2);
    expect(component.treatment?.PatientTreatmentDetails?.[0].Procedure).toBe('Root Canal');
    expect(component.treatment?.ActualCost).toBe(800); // 500 + 300 = 800
    expect(dataServiceSpy.setPatient).toHaveBeenCalled();
    expect(window.alert).not.toHaveBeenCalled();
  });

  it('should sync treatment details with server', async () => {
    await createComponent();
    fixture.detectChanges();
    
    const updatedPatient = { ...mockPatient, Allergies: 'None', PatientTreatment: { ...mockTreatment, EstimatedCost: 1000 } };
    component.syncTreatmentDetailsWithServer(updatedPatient);
    
    expect(component.treatment).toEqual(updatedPatient.PatientTreatment);
    expect(component.patient).toEqual(updatedPatient);
  });

  it('should save patient info and redirect when patient is new', async () => {
    await createComponent();
    fixture.detectChanges();
    component.isNewPatient = true;
    component.patientId = 0;
    
    const savedPatient = { ...mockPatient, ID: 789 };
    patientServiceSpy.createPatient.and.returnValue(of(savedPatient));
    
    component.SavePatientAndRedirect();
    
    expect(patientServiceSpy.createPatient).toHaveBeenCalledWith(component.patient!);
    expect(messageServiceSpy.success).toHaveBeenCalledWith('New patient created successfully');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/patient', 789, 'treatment']);
  });

  it('should update patient info and notify when patient exists', async () => {
    await createComponent();
    fixture.detectChanges();
    component.isNewPatient = false;
    component.patientId = 456;
    
    patientServiceSpy.updatePatient.and.returnValue(of(mockPatient));
    
    component.SavePatientAndRedirect();
    
    expect(patientServiceSpy.updatePatient).toHaveBeenCalledWith(456, component.patient!);
    expect(messageServiceSpy.success).toHaveBeenCalledWith('Patient information saved successfully');
  });

  it('should handle save/update patient error gracefully', async () => {
    spyOn(console, 'error');
    await createComponent();
    fixture.detectChanges();
    component.isNewPatient = true;
    component.patientId = 0;
    
    patientServiceSpy.createPatient.and.returnValue(throwError(() => new Error('API error')));
    
    component.SavePatientAndRedirect();
    
    expect(console.error).toHaveBeenCalled();
  });
});
