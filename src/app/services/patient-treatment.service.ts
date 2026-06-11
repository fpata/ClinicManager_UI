import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PatientTreatment } from '../models/patient-treatment.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PatientTreatmentService {

  private apiUrl = `${environment.API_BASE_URL}/patienttreatment`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  getPatientTreatments(): Observable<PatientTreatment[]> {
    return this.http.get<PatientTreatment[]>(this.apiUrl, { headers: this.getAuthHeaders() });
  }

  getPatientTreatment(id: number): Observable<PatientTreatment> {
    return this.http.get<PatientTreatment>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  createPatientTreatment(treatment: PatientTreatment): Observable<PatientTreatment> {
    return this.http.post<PatientTreatment>(this.apiUrl, treatment, { headers: this.getAuthHeaders() });
  }

  updatePatientTreatment(id: number, treatment: PatientTreatment): Observable<PatientTreatment> {
    return this.http.put<PatientTreatment>(`${this.apiUrl}/${id}`, treatment, { headers: this.getAuthHeaders() });
  }

  deletePatientTreatment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  getAllTreatmentsForUser(userId: number): Observable<PatientTreatment[]> {
    return this.http.get<PatientTreatment[]>(`${this.apiUrl}/user/${userId}`, { headers: this.getAuthHeaders() });
  }

  downloadPrescription(treatmentId: number, treatmentDetailId?: number, includeHeader: boolean = true, doctorNotes?: string): Observable<Blob> {
    let url = `${this.apiUrl}/${treatmentId}/prescription/print?includeHeader=${includeHeader}`;
    if (treatmentDetailId) {
      url += `&treatmentDetailId=${treatmentDetailId}`;
    }
    if (doctorNotes) {
      url += `&doctorNotes=${encodeURIComponent(doctorNotes)}`;
    }
    return this.http.get(url, { headers: this.getAuthHeaders(), responseType: 'blob' });
  }
}
