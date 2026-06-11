import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Message, MessageType } from '../models/message.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MessageService {
  
    private subject = new Subject<Message>();
    private defaultId:number = 1;
    constructor(private http: HttpClient) { }

    // enable subscribing to alerts observable
    onMessage(id = this.defaultId): Observable<Message> {
        return this.subject.asObservable().pipe(filter(x => x && x.id === id));
    }

    // convenience methods
    success(message: string, options?: any) {
        this.message(new Message({ ...options, type: MessageType.Success, message, autoClose: true, autoCloseTimeout: 10000 }));
    }

    error(message: string, options?: any) {
        this.message(new Message({ ...options, type: MessageType.Error, message, autoClose: false }));
    }

    info(message: string, options?: any) {
        this.message(new Message({ ...options, type: MessageType.Info, message, autoClose: true, autoCloseTimeout: 10000 }));
    }

    warn(message: string, options?: any) {
        this.message(new Message({ ...options, type: MessageType.Warning, message, autoClose: true, autoCloseTimeout: 15000 }));
    }

    // main alert method    
    message(message: Message) {
        message.id = message.id || this.defaultId;
        this.subject.next(message);
    }

    // clear alerts
    clear(id = this.defaultId) {
        this.subject.next(new Message({ id }));
    }

    sendMessage(sendTo: string, ismobile: boolean = false) {
        var apiUrl = `${environment.API_BASE_URL}/login/forgotpassword`;
        if (ismobile) {
            apiUrl += `?sendTo=${sendTo}&isMobile=${ismobile}`;
        }
        else {
            apiUrl += `?sendTo=${sendTo}&isMobile=${ismobile}`;
        }
        // Here you would typically make an HTTP request to your backend API
        return this.http.get(apiUrl, { responseType: 'text' });
    }
}
