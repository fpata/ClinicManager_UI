import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PatientAppointmentService } from './patient-appointment.service';
import { UserType } from '../models/user.model';


describe('PatientAppointmentService', () => {
  let service: PatientAppointmentService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PatientAppointmentService]
    });
    service = TestBed.inject(PatientAppointmentService);
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

  it('should include Authorization header on getPatientAppointments', () => {
    service.getAppointments(1, UserType.Doctor, new Date(), new Date(), 1, 10).subscribe();
    const req = httpMock.expectOne(() => true);
    expect(req.request.headers.get('Authorization')).toContain('Bearer');
    req.flush([]);
  });
});
