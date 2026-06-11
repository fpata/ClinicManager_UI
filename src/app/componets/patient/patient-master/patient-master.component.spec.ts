import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BehaviorSubject } from 'rxjs';

import { PatientMasterComponent } from './patient-master.component';
import { DataService } from '../../../services/data.service';
import { User } from '../../../models/user.model';
import { UserType } from '../../../models/user.model';

describe('PatientMasterComponent', () => {
  let component: PatientMasterComponent;
  let fixture: ComponentFixture<PatientMasterComponent>;
  let dataService: jasmine.SpyObj<DataService>;
  let userSubject: BehaviorSubject<User | null>;

  const mockUser: User = {
    ID: 1,
    FirstName: 'John',
    LastName: 'Doe',
    UserName: 'johndoe',
    UserType: UserType.Doctor,
    CreatedDate: '2023-01-01',
    ModifiedDate: '2023-01-01',
    CreatedBy: 1,
    ModifiedBy: 1,
    IsActive: 1
  };

  beforeEach(async () => {
    userSubject = new BehaviorSubject<User | null>(null);
    const dataServiceSpy = jasmine.createSpyObj('DataService', ['getConfig', 'setQuickCreateMode', 'setUserId'], {
      user$: userSubject.asObservable()
    });
    dataServiceSpy.getConfig.and.returnValue(null);

    await TestBed.configureTestingModule({
      imports: [PatientMasterComponent, HttpClientTestingModule],
      providers: [
        { provide: DataService, useValue: dataServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PatientMasterComponent);
    component = fixture.componentInstance;
    dataService = TestBed.inject(DataService) as jasmine.SpyObj<DataService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should subscribe to user changes on init', () => {
    component.ngOnInit();
    userSubject.next(mockUser);
    expect(component.user).toEqual(mockUser);
  });

  it('should unsubscribe on destroy', () => {
    component.ngOnInit();
    spyOn(component['subscriptions'][0], 'unsubscribe');
    component.ngOnDestroy();
    expect(component['subscriptions'][0].unsubscribe).toHaveBeenCalled();
  });
});
