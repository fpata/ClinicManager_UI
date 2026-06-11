import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  private activeRequests = 0;
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  private timeoutId: any = null;

  get isLoading$(): Observable<boolean> {
    return this.isLoadingSubject.asObservable();
  }

  show(): void {
    this.activeRequests++;
    if (this.activeRequests === 1) {
      this.isLoadingSubject.next(true);
      this.startTimeout();
    }
  }

  hide(): void {
    if (this.activeRequests > 0) {
      this.activeRequests--;
    }
    if (this.activeRequests === 0) {
      this.isLoadingSubject.next(false);
      this.clearTimer();
    }
  }

  private startTimeout(): void {
    this.clearTimer();
    this.timeoutId = setTimeout(() => {
      this.activeRequests = 0;
      this.isLoadingSubject.next(false);
    }, 5000); // 10 seconds timeout
  }

  private clearTimer(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}
