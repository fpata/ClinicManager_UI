import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppointmentSearchResponse, PatientAppointment } from '../models/patient-appointment.model';
import { SearchModel } from '../models/search.model';
import { environment } from '../../environments/environment';
import { UtilityService } from './utility.service';
import { UserType } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class PatientAppointmentService {

  private readonly apiUrl = `${environment.API_BASE_URL}/PatientAppointment`;

  constructor(private http: HttpClient, private util: UtilityService) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  private prepareAppointmentPayload(appt: PatientAppointment): any {
    const payload: any = { ...appt };

    if (appt.StartDateTime) {
      payload.StartDateTime = this.util.toLocalDateTimeString(appt.StartDateTime);
    }
    if (appt.EndDateTime) {
      payload.EndDateTime = this.util.toLocalDateTimeString(appt.EndDateTime);
    }

    return payload;
  }

  createPatientAppointment(appt: PatientAppointment): Observable<PatientAppointment> {
    return this.http.post<PatientAppointment>(this.apiUrl, this.prepareAppointmentPayload(appt), { headers: this.getAuthHeaders() });
  }

  updatePatientAppointment(id: number, appt: PatientAppointment): Observable<PatientAppointment> {
    return this.http.put<PatientAppointment>(`${this.apiUrl}/${id}`, this.prepareAppointmentPayload(appt), { headers: this.getAuthHeaders() });
  }

  deletePatientAppointment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }


  getAppointments(userId: number, userType: UserType, startDate: Date, endDate: Date, currentPage: number, pageSize: number) {
    const sDate = startDate ? (startDate instanceof Date ? startDate : new Date(startDate)) : new Date();
    const eDate = endDate ? (endDate instanceof Date ? endDate : new Date(endDate)) : new Date();
    const params = {
      userId: userId,
      userType: userType,
      startDate: sDate.toISOString(),
      endDate: eDate.toISOString(),
      pageNumber: currentPage,
      pageSize: pageSize
    };
    return this.http.get<AppointmentSearchResponse>(`${this.apiUrl}`, { headers: this.getAuthHeaders(), params });
  }

  setPatinetAppointmentTime(appointments: PatientAppointment[]): PatientAppointment[] {
    for (let appt of appointments) {
      const startDate = new Date(appt.StartDateTime);
      const endDate = new Date(appt.EndDateTime);
      const formatTime = (date: Date) => {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
      };
      appt.StartTime = formatTime(startDate);
      appt.EndTime = formatTime(endDate);
    }
    return appointments;
  }
}
