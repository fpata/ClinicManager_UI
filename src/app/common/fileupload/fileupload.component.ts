import { Component, EventEmitter, Output } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpEvent, HttpEventType } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-file-upload',
  templateUrl: './fileupload.component.html',
  styleUrls: ['./fileupload.component.css']
})
export class FileUploadComponent {
  @Output() uploadComplete = new EventEmitter<any>();

  selectedFile?: File;
  uploadProgress = 0;
  errorMessage = '';

  constructor(private http: HttpClient) {}

  // Handle file selection
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.errorMessage = '';
    }
  }

  // Upload file to backend
  uploadFile() {
    if (!this.selectedFile) {
      this.errorMessage = 'Please select a file first.';
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('description', 'Sample file upload'); // Example extra data

    this.http.post(`${environment.API_BASE_URL}/FileUpload`, formData, {
      reportProgress: true,
      observe: 'events'
    }).subscribe({
      next: (event: HttpEvent<any>) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.uploadProgress = Math.round((100 * event.loaded) / event.total);
        } else if (event.type === HttpEventType.Response) {
          this.uploadComplete.emit(event.body);
          this.uploadProgress = 0;
        }
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage = err.error?.message || 'File upload failed.';
        this.uploadProgress = 0;
      }
    });
  }
}
