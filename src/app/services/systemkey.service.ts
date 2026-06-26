import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SystemKey } from '../models/systemkey.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SystemKeyService {
  private apiUrl = `${environment.API_BASE_URL}/SystemKeys`;

  constructor(private http: HttpClient) {}

  getKeys(): Observable<SystemKey[]> {
    return this.http.get<SystemKey[]>(this.apiUrl);
  }

  getKey(id: number): Observable<SystemKey> {
    return this.http.get<SystemKey>(`${this.apiUrl}/${id}`);
  }

  createKey(key: { KeyName: string; KeyValue: string }): Observable<SystemKey> {
    return this.http.post<SystemKey>(this.apiUrl, key);
  }

  updateKey(id: number, key: { KeyName?: string; KeyValue?: string }): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, key);
  }

  deleteKey(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
