import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { BillingrecordComponent } from './billingrecord.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BillingRecord, BillingStatus } from '../../../models/billing.model';
import { ChangeDetectionStrategy } from '@angular/core';
import { PatientTreatmentService } from '../../../services/patient-treatment.service';
import { of } from 'rxjs';

describe('BillingrecordComponent', () => {
  let component: BillingrecordComponent;
  let fixture: ComponentFixture<BillingrecordComponent>;
  let mockPatientTreatmentService: jasmine.SpyObj<PatientTreatmentService>;

  const mockBillingRecord: BillingRecord = {
    ID: 1,
    PatientName: 'John Doe',
    DoctorName: 'Dr. Smith',
    TreatmentName: 'Check-up',
    ServiceDate: new Date('2025-08-19').toDateString(),
    Status: BillingStatus.PartiallyPaid,
    Subtotal: 100,
    TaxTotal: 10,
    DiscountTotal: 5,
    Total: 105,
    AmountPaid: 50,
    BalanceDue: 55,
    Notes: 'Annual check-up.',
    IsActive: 1,
    CreatedBy: 1,
    ModifiedBy: 1,
    CreatedDate: new Date().toDateString(),
    ModifiedDate: new Date().toDateString(),
    TreatmentID: 0,
    Payments: [],
    PageNumber: 1,
    PageSize: 10
  };

  beforeEach(async () => {
    mockPatientTreatmentService = jasmine.createSpyObj('PatientTreatmentService', ['getPatientTreatment']);
    mockPatientTreatmentService.getPatientTreatment.and.returnValue(of({} as any));

    await TestBed.configureTestingModule({
      imports: [ BillingrecordComponent, FormsModule, HttpClientTestingModule ],
      providers: [
        { provide: PatientTreatmentService, useValue: mockPatientTreatmentService }
      ]
    })
    .overrideComponent(BillingrecordComponent, {
      set: { changeDetection: ChangeDetectionStrategy.Default }
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BillingrecordComponent);
    component = fixture.componentInstance;
    component.billingRecord = { ...mockBillingRecord };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display billing record data in form fields', async () => {
    await fixture.whenStable();
    fixture.detectChanges();
    const patientNameInput: HTMLInputElement = fixture.debugElement.query(By.css('#txtPatientName')).nativeElement;
    const doctorNameInput: HTMLInputElement = fixture.debugElement.query(By.css('#txtDoctorName')).nativeElement;
    const treatmentNameInput: HTMLInputElement = fixture.debugElement.query(By.css('#txtTreatmentName')).nativeElement;

    expect(patientNameInput.value).toBe(mockBillingRecord.PatientName || '');
    expect(doctorNameInput.value).toBe(mockBillingRecord.DoctorName || '');
    expect(treatmentNameInput.value).toBe(mockBillingRecord.TreatmentName || '');
  });

  it('should update the component model when patient name is changed', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    const patientNameInput: HTMLInputElement = fixture.debugElement.query(By.css('#txtPatientName')).nativeElement;
    const newPatientName = 'Jane Doe';

    patientNameInput.value = newPatientName;
    patientNameInput.dispatchEvent(new Event('input'));
    
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.billingRecord.PatientName).toBe(newPatientName);
  });

  it('should update the component model when doctor name is changed', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    const doctorNameInput: HTMLInputElement = fixture.debugElement.query(By.css('#txtDoctorName')).nativeElement;
    const newDoctorName = 'Dr. House';

    doctorNameInput.value = newDoctorName;
    doctorNameInput.dispatchEvent(new Event('input'));

    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.billingRecord.DoctorName).toBe(newDoctorName);
  });

  it('should update the component model when treatment name is changed', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    const treatmentNameInput: HTMLInputElement = fixture.debugElement.query(By.css('#txtTreatmentName')).nativeElement;
    const newTreatmentName = 'Root Canal';

    treatmentNameInput.value = newTreatmentName;
    treatmentNameInput.dispatchEvent(new Event('input'));

    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.billingRecord.TreatmentName).toBe(newTreatmentName);
  });

  it('should call patientTreatmentService.getPatientTreatment and set selectedTreatment when viewTreatmentDetails is called', () => {
    const testRecord = { ...mockBillingRecord, TreatmentID: 42 };
    const mockTreatment = { ID: 42, ChiefComplaint: 'Pain' };
    mockPatientTreatmentService.getPatientTreatment.and.returnValue(of(mockTreatment as any));

    component.viewTreatmentDetails(testRecord);

    expect(mockPatientTreatmentService.getPatientTreatment).toHaveBeenCalledWith(42);
    expect(component.selectedTreatment).toEqual(mockTreatment as any);
    expect(component.selectedBillingRecord).toEqual(testRecord);
  });
});
