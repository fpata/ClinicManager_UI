import { TestBed } from '@angular/core/testing';
import { DataService } from './data.service';
import { Patient } from '../models/patient.model';
import { User } from '../models/user.model';


describe('DataService', () => {
  let service: DataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set/get patient and user', () => {
    const p = new Patient();
    const u = new User();
    service.setPatient(p);
    service.setUser(u);
    expect(service.getPatient()).toBe(p);
    expect(service.getUser()).toBe(u);
  });
});
