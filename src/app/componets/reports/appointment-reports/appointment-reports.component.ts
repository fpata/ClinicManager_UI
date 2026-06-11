import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../../services/report.service';
import { UserService } from '../../../services/user.service';
import { MessageService } from '../../../services/message.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-appointment-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './appointment-reports.component.html',
  styleUrl: './appointment-reports.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppointmentReportsComponent implements OnInit {
  appointmentStart = '';
  appointmentEnd = '';
  appointmentStatus = 'All';
  appointmentDoctorId: number | null = null;
  isAppointmentLoading = false;
  
  doctors: User[] = [];

  appointmentStatuses = [
    { value: 'All', label: 'All Statuses' },
    { value: 'Scheduled', label: 'Scheduled' },
    { value: 'Confirmed', label: 'Confirmed' },
    { value: 'InProgress', label: 'In Progress' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Cancelled', label: 'Cancelled' },
    { value: 'NoShow', label: 'No Show' },
    { value: 'Rescheduled', label: 'Rescheduled' }
  ];

  constructor(
    private reportService: ReportService,
    private userService: UserService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    this.appointmentStart = this.formatDate(firstDay);
    this.appointmentEnd = this.formatDate(now);

    this.loadDoctors();
  }

  private formatDate(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private loadDoctors(): void {
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.doctors = users.filter(u => 
          u.UserType === 2 || 
          u.UserType?.toString() === 'Doctor' || 
          (u.Specialization && u.Specialization.trim() !== '')
        );
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error fetching doctors for reporting:', err);
        this.messageService.error('Could not load doctors list.');
      }
    });
  }

  downloadAppointments(): void {
    this.isAppointmentLoading = true;
    this.cdr.markForCheck();

    const docId = this.appointmentDoctorId ? Number(this.appointmentDoctorId) : undefined;
    this.reportService.downloadAppointmentReport(
      this.appointmentStart,
      this.appointmentEnd,
      this.appointmentStatus,
      docId
    ).subscribe({
      next: (blob) => {
        this.saveBlob(blob, `appointments_report_${this.appointmentStart}_to_${this.appointmentEnd}.csv`);
        this.messageService.success('Appointments report downloaded successfully.');
        this.isAppointmentLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Appointments report error:', err);
        this.messageService.error('Failed to generate appointments report.');
        this.isAppointmentLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  clearFilters(): void {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    this.appointmentStart = this.formatDate(firstDay);
    this.appointmentEnd = this.formatDate(now);
    this.appointmentStatus = 'All';
    this.appointmentDoctorId = null;
    this.cdr.markForCheck();
  }

  private saveBlob(blob: Blob, defaultFilename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = defaultFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}
