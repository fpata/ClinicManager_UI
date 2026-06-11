import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PatientTreatmentService } from './patient-treatment.service';


describe('PatientTreatmentService', () => {
  let service: PatientTreatmentService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PatientTreatmentService]
    });
    service = TestBed.inject(PatientTreatmentService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.setItem('token', 'token');
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should include Authorization header on getPatientTreatments', () => {
    service.getPatientTreatments().subscribe();
    const req = httpMock.expectOne(() => true);
    expect(req.request.headers.get('Authorization')).toContain('Bearer');
    req.flush([]);
  });
});
