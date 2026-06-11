import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PatientReport } from '../models/patient-report.model';
import { environment } from '../../environments/environment';
  
@Injectable({ providedIn: 'root' })
export class PatientReportService {
  private apiUrl = `${environment.API_BASE_URL}/PatientReport`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  getPatientReports(): Observable<PatientReport[]> {
    return this.http.get<PatientReport[]>(this.apiUrl, { headers: this.getAuthHeaders() });
  }

  getPatientReport(id: number): Observable<PatientReport> {
    return this.http.get<PatientReport>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  createPatientReport(report: PatientReport): Observable<PatientReport> {
    return this.http.post<PatientReport>(this.apiUrl, report, { headers: this.getAuthHeaders() });
  }

  updatePatientReport(id: number, report: PatientReport): Observable<PatientReport> {
    return this.http.put<PatientReport>(`${this.apiUrl}/${id}`, report, { headers: this.getAuthHeaders() });
  }

  deletePatientReport(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  downloadReport(filePath: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download`, {
      headers: this.getAuthHeaders(),
      params: { filePath },
      responseType: 'blob'
    });
  } 
}
