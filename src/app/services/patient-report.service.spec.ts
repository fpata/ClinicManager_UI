import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PatientReportService } from './patient-report.service';


describe('PatientReportService', () => {
  let service: PatientReportService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PatientReportService]
    });
    service = TestBed.inject(PatientReportService);
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

  it('should include Authorization header on getPatientReports', () => {
    service.getPatientReports().subscribe();
    const req = httpMock.expectOne(() => true);
    expect(req.request.headers.get('Authorization')).toContain('Bearer');
    req.flush([]);
  });
});
