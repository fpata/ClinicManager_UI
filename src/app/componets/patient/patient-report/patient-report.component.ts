import { Component, ChangeDetectionStrategy, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { PatientReport } from '../../../models/patient-report.model';
import { User, UserType } from '../../../models/user.model';
import { DataService } from '../../../services/data.service';
import { UtilityService } from '../../../services/utility.service';
import { map, Observable } from 'rxjs';
import { Patient } from '../../../models/patient.model';
import { FormsModule } from '@angular/forms';
import { FileUploadComponent } from '../../../common/fileupload/fileupload.component';
import { TypeaheadComponent } from '../../../common/typeahead/typeahead';
import { SearchModel } from '../../../models/search.model';
import { SearchService } from '../../../services/search.service';
import { MessageService } from '../../../services/message.service';
import { PatientReportService } from '../../../services/patient-report.service';
import { PatientService } from '../../../services/patient.service';
import { PatientBaseComponent } from '../patient-base.component';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-patient-report',
  imports: [FormsModule, FileUploadComponent, TypeaheadComponent],
  templateUrl: './patient-report.component.html',
  styleUrls: ['./patient-report.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class PatientReportComponent extends PatientBaseComponent implements OnInit {
  reports: PatientReport[] = [];
  newReport: PatientReport | null = null;
  patientId: number | null = null;

  constructor(
    dataService: DataService,
    userService: UserService,
    patientService: PatientService,
    messageService: MessageService,
    router: Router,
    cdr: ChangeDetectorRef,
    private util: UtilityService,
    private searchService: SearchService,
    private reportService: PatientReportService
  ) {
    super(dataService, userService, patientService, messageService, router, cdr);
  }

  ngOnInit(): void {
    this.initPatientSubscription();
  }

  protected applyUserData(user: User): void {
    this.patient = user?.Patients?.[0] as Patient ?? null;
    this.reports = this.patient?.PatientReports?.length
      ? this.patient.PatientReports
      : [];
  }

  AddReport(): void {
    const user = this.dataService.getUser();
    this.newReport = <PatientReport>{
      ID: this.reports.length > 0 ? Math.min(...this.reports.map(r => r.ID)) - 1 : 0,
      UserID: user?.ID ?? 0,
      PatientID: this.patient?.ID ?? 0,
      IsActive: 1,
      ReportDate: this.util.formatDate(new Date(), 'yyyy-MM-dd'),
      ReportName: '',
      DoctorName: '',
      ReportDetails: '',
      CreatedBy: user?.ID ?? 0,
      ModifiedBy: user?.ID ?? 0,
      ModifiedDate: this.util.formatDate(new Date(), 'yyyy-MM-dd'),
      CreatedDate: this.util.formatDate(new Date(), 'yyyy-MM-dd')
    };
  }

  EditReport(reportId: number): void {
    this.newReport = <PatientReport>this.reports.find(x => x.ID === reportId);
  }

  DeleteReport(reportId: number): void {
    const idx = this.reports.findIndex(x => x.ID === reportId);
    if (idx > -1) {
      this.reports.splice(idx, 1);
      this.patient.PatientReports = this.reports;
    }
  }

  SaveReport(): void {
    if (!this.newReport) return;
    const idx = this.reports.findIndex(r => r.ID === this.newReport.ID);
    if (idx > -1) {
      this.reports[idx] = { ...this.newReport };
    } else {
      this.reports.push({ ...this.newReport });
    }
    this.newReport = null;
    this.patient.PatientReports = this.reports;
  }

  getDoctors = (name: string): Observable<SearchModel[]> => {
    const s = new SearchModel(this.util);
    s.UserType = UserType.Doctor;
    s.FirstName = name;
    return this.searchService.SearchUser(s).pipe(map(r => r.Results as SearchModel[]));
  };

  displayName(d: any): string {
    if (!d) return 'Unknown Patient';
    return ((d.FirstName ?? '') + ' ' + (d.LastName ?? '')).trim() || 'Unknown Patient';
  }

  onFileUploaded($event: any): void {
    this.newReport.ReportFilePath = $event.ReportFilePath;
    alert('File uploaded successfully.');
  }

  DownloadReport(filePath: string): void {
    if (!filePath) { alert('No file available for download.'); return; }
    this.reportService.downloadReport(filePath).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.util.getFileNameFromPath(filePath);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    });
  }

  /** Clear form: reload latest data from server */
  override onClear(): void {
    super.onClear();
  }

  /** Delete patient with confirmation */
  override onDelete(): void {
    super.onDelete();
  }

  onSave(): void {
    this.SaveReport();
    super.savePatient();
  }
}