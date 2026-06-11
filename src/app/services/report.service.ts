import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly apiUrl = `${environment.API_BASE_URL}/Reports`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  downloadRevenueReport(startDate?: string, endDate?: string): Observable<Blob> {
    let url = `${this.apiUrl}/revenue`;
    const params: string[] = [];
    if (startDate) params.push(`startDate=${startDate}`);
    if (endDate) params.push(`endDate=${endDate}`);
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    return this.http.get(url, { headers: this.getAuthHeaders(), responseType: 'blob' });
  }

  downloadOutstandingBalancesReport(): Observable<Blob> {
    const url = `${this.apiUrl}/outstanding-balances`;
    return this.http.get(url, { headers: this.getAuthHeaders(), responseType: 'blob' });
  }

  downloadAppointmentReport(startDate?: string, endDate?: string, status?: string, doctorId?: number): Observable<Blob> {
    let url = `${this.apiUrl}/appointments`;
    const params: string[] = [];
    if (startDate) params.push(`startDate=${startDate}`);
    if (endDate) params.push(`endDate=${endDate}`);
    if (status && status !== 'All') params.push(`status=${status}`);
    if (doctorId) params.push(`doctorId=${doctorId}`);
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    return this.http.get(url, { headers: this.getAuthHeaders(), responseType: 'blob' });
  }

  downloadMedicalHistory(patientId: number): Observable<Blob> {
    const url = `${this.apiUrl}/patient-medical-history/${patientId}`;
    return this.http.get(url, { headers: this.getAuthHeaders(), responseType: 'blob' });
  }

  downloadReferralLetter(patientId: number, referredToDoctor: string, referredToClinic: string, reason: string): Observable<Blob> {
    const url = `${this.apiUrl}/referral-letter?patientId=${patientId}&referredToDoctor=${encodeURIComponent(referredToDoctor)}&referredToClinic=${encodeURIComponent(referredToClinic)}&reason=${encodeURIComponent(reason)}`;
    return this.http.get(url, { headers: this.getAuthHeaders(), responseType: 'blob' });
  }
}
