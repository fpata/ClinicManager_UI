import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Patient } from '../models/patient.model';
import { User, UserType, Gender } from '../models/user.model';
import { DayPilot } from '@daypilot/daypilot-lite-angular';
import { LoginResponse } from './login.service';
import { Contact } from '../models/contact.model';
import { Address } from '../models/address.model';
import { AppConfig } from '../models/appconfig.model';
import { AuthService } from './auth.service';
import { Token } from '@angular/compiler';
import { BillingRecord } from '../models/billing.model';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private patientSource = new BehaviorSubject<Patient | null>(null);
  private userSource = new BehaviorSubject<User | null>(null);
  private calendarEvents = new BehaviorSubject<DayPilot.EventData[]>([]);
  private loginUserSource = new BehaviorSubject<LoginResponse | null>(null);
  private configSource = new BehaviorSubject<AppConfig | null>(null);
  private userId = new BehaviorSubject<number | null>(null);
  private IsQuickCreateMode = new BehaviorSubject<boolean>(false);
  private billingRecordSource = new BehaviorSubject<BillingRecord | null>(null);

  readonly patient$: Observable<Patient> = this.patientSource.asObservable();
  readonly user$: Observable<User> = this.userSource.asObservable();
  readonly calendarEvents$: Observable<DayPilot.EventData[]> = this.calendarEvents.asObservable();
  readonly loginUser$: Observable<LoginResponse> = this.loginUserSource.asObservable();
  readonly config$: Observable<AppConfig> = this.configSource.asObservable();
  readonly userId$: Observable<number | null> = this.userId.asObservable();
  readonly IsQuickCreateMode$: Observable<boolean> = this.IsQuickCreateMode.asObservable();
  readonly billingRecord$: Observable<BillingRecord | null> = this.billingRecordSource.asObservable();

  private tokenKey = 'token';
  private userKey = 'user';
  private patientKey = 'patientId';



  setUser(newUser: User | null): void {
    if (newUser) {
      newUser.Gender = this.mapGender(newUser.Gender);
      newUser.UserType = this.mapUserType(newUser.UserType);
      if (newUser.Patients && Array.isArray(newUser.Patients)) {
        newUser.Patients.forEach(p => {
          if (p && p.user) {
            p.user.Gender = this.mapGender(p.user.Gender);
            p.user.UserType = this.mapUserType(p.user.UserType);
          }
        });
      }
    }
    this.userSource.next(newUser);
  }

  private mapGender(gender: any): any {
    if (gender === undefined || gender === null) {
      return gender;
    }
    if (typeof gender === 'number') {
      return gender;
    }
    if (typeof gender === 'string') {
      const g = gender.trim().toLowerCase();
      if (g === 'male' || g === '1') return Gender.Male;
      if (g === 'female' || g === '2') return Gender.Female;
      if (g === 'other' || g === '3') return Gender.Other;
      if (g === 'prefernot' || g === 'prefernottosay' || g === 'prefer not to say' || g === '4') return Gender.PreferNotToSay;
    }
    return gender;
  }

  private mapUserType(userType: any): any {
    if (userType === undefined || userType === null) {
      return userType;
    }
    if (typeof userType === 'number') {
      return userType;
    }
    if (typeof userType === 'string') {
      const u = userType.trim().toLowerCase();
      if (u === 'patient' || u === '1') return UserType.Patient;
      if (u === 'doctor' || u === '2') return UserType.Doctor;
      if (u === 'nurse' || u === '3') return UserType.Nurse;
      if (u === 'receptionist' || u === '4') return UserType.Receptionist;
      if (u === 'administrator' || u === 'admin' || u === '5') return UserType.Administrator;
      if (u === 'technician' || u === '6') return UserType.Technician;
      if (u === 'accountant' || u === '7') return UserType.Accountant;
      if (u === 'dentalassistant' || u === 'dental assistant' || u === '8') return UserType.DentalAssistant;
    }
    return userType;
  }

  getUser(): User | null {
    return this.userSource.value;
  }

  setPatient(newPatient: Patient): void {
    this.patientSource.next(newPatient);
  }

  getPatient(): Patient | null {
    return this.patientSource.value;
  }

  getCalendarEvents(): DayPilot.EventData[] {
    return this.calendarEvents.value;
  }

  setCalendarEvents(events: DayPilot.EventData[]): void {
    this.calendarEvents.next(events);
  }

  getLoginUser(): LoginResponse {
    if (this.loginUserSource.value === null) {
      var response = new LoginResponse();
      response.token = localStorage.getItem(this.tokenKey);
      response.user = JSON.parse(localStorage.getItem(this.userKey));
      this.setLoginUser(response);
    }
    return this.loginUserSource.value;
  }

  setLoginUser(user: LoginResponse): void {
    this.loginUserSource.next(user);
  }

  getConfig(): AppConfig | null {
    return this.configSource.value;
  }
  setConfig(config: AppConfig): void {
    this.configSource.next(config);
  }

  setUserId(id: number | null): void {
    this.userId.next(id);
  }

  getUserId(): number | null {
    return this.userId.value;
  }

  setQuickCreateMode(isQuickCreate: boolean): void {
    this.IsQuickCreateMode.next(isQuickCreate);
  }

  getQuickCreateMode(): boolean {
    return this.IsQuickCreateMode.value;
  }

  setBillingRecord(record: BillingRecord | null): void {
    this.billingRecordSource.next(record);
  }

  getBillingRecord(): BillingRecord | null {
    return this.billingRecordSource.value;
  }
}
