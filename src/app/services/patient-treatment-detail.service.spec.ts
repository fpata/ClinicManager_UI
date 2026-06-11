import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PatientTreatmentDetailService } from './patient-treatment-detail.service';


describe('PatientTreatmentDetailService', () => {
  let service: PatientTreatmentDetailService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PatientTreatmentDetailService]
    });
    service = TestBed.inject(PatientTreatmentDetailService);
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

  it('should include Authorization header on getPatientTreatmentDetails', () => {
    service.getPatientTreatmentDetails().subscribe();
    const req = httpMock.expectOne(() => true);
    expect(req.request.headers.get('Authorization')).toContain('Bearer');
    req.flush([]);
  });
});
