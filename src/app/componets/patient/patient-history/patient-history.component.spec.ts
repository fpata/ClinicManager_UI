import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { PatientHistoryComponent } from './patient-history.component';
import { DataService } from '../../../services/data.service';
import { User, UserType } from '../../../models/user.model';
import { Patient } from '../../../models/patient.model';

describe('PatientHistoryComponent', () => {
  let component: PatientHistoryComponent;
  let fixture: ComponentFixture<PatientHistoryComponent>;
  let dataServiceSpy: jasmine.SpyObj<DataService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockPatient: Patient = {
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
    IsActive: 1
  };

  const mockUser: User = {
    ID: 123,
    FirstName: 'John',
    LastName: 'Doe',
    UserName: 'johndoe',
    UserType: UserType.Patient,
    CreatedDate: '2026-05-26T00:00:00',
    ModifiedDate: '2026-05-26T00:00:00',
    CreatedBy: 1,
    ModifiedBy: 1,
    IsActive: 1,
    Patients: [mockPatient]
  };

  beforeEach(async () => {
    dataServiceSpy = jasmine.createSpyObj('DataService', ['getUser']);
    Object.defineProperty(dataServiceSpy, 'user$', {
      value: of(mockUser)
    });

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [PatientHistoryComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: DataService, useValue: dataServiceSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => '456'
              }
            }
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
