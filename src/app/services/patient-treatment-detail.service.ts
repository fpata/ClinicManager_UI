import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PatientTreatmentDetail } from '../models/patient-treatment-detail.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PatientTreatmentDetailService {
  private apiUrl = `${environment.API_BASE_URL}/patient-treatment-details`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  getPatientTreatmentDetails(): Observable<PatientTreatmentDetail[]> {
    return this.http.get<PatientTreatmentDetail[]>(this.apiUrl, { headers: this.getAuthHeaders() });
  }

  getPatientTreatmentDetail(id: number): Observable<PatientTreatmentDetail> {
    return this.http.get<PatientTreatmentDetail>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  createPatientTreatmentDetail(detail: PatientTreatmentDetail): Observable<PatientTreatmentDetail> {
    return this.http.post<PatientTreatmentDetail>(this.apiUrl, detail, { headers: this.getAuthHeaders() });
  }

  updatePatientTreatmentDetail(id: number, detail: PatientTreatmentDetail): Observable<PatientTreatmentDetail> {
    return this.http.put<PatientTreatmentDetail>(`${this.apiUrl}/${id}`, detail, { headers: this.getAuthHeaders() });
  }

  deletePatientTreatmentDetail(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }
}
