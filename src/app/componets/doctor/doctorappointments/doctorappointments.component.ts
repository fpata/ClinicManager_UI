import { Component, ViewChild, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { AppointmentSearchResponse, PatientAppointment } from '../../../models/patient-appointment.model';
import { SchedulerComponent } from "../../../common/scheduler/scheduler";
import { DayPilot } from '@daypilot/daypilot-lite-angular';
import { PatientAppointmentService } from '../../../services/patient-appointment.service';
import { SearchModel, SearchResultModel } from '../../../models/search.model';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DataService } from '../../../services/data.service';
import { SearchService } from '../../../services/search.service';
import { TypeaheadComponent } from '../../../common/typeahead/typeahead';
import { Observable, tap, map } from 'rxjs';
import { MessageService } from '../../../services/message.service';
import { UtilityService } from '../../../services/utility.service';
import { UserType } from '../../../models/user.model';
import { PagingComponent } from '../../../common/paging/paging.component';
import { AppConfigService } from '../../../services/config.service';

@Component({
  selector: 'app-doctor-appointments',
  imports: [SchedulerComponent, FormsModule, TypeaheadComponent, PagingComponent],
  templateUrl: './doctorappointments.component.html',
  styleUrls: ['./doctorappointments.component.css'],
  providers: [HttpClient],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DoctorAppointmentsComponent {

  clearSearchClicked: boolean;
  searchResult: AppointmentSearchResponse;
  @ViewChild(SchedulerComponent) scheduler!: SchedulerComponent;
  searchPatient: SearchModel;
  searchLengthConstraintError: any;
  newAppointment: PatientAppointment = new PatientAppointment();
  doctors: SearchModel[] | null = null;
  currentPage: number = 1;
  pageSize: number = 3;
  totalItems: number = 0;
  appointmentDateString: string = '';

  constructor(private patientAppointmentService: PatientAppointmentService,
    private dataService: DataService,
    private searchService: SearchService,
    private messageService: MessageService,
    private util: UtilityService,
    private configService: AppConfigService,
    private cdrRef: ChangeDetectorRef
  ) {
    if (this.dataService.getConfig() == null) {
      this.configService.getConfigs().subscribe(config => {
        this.dataService.setConfig(config);
        this.pageSize = config.pageSize || 10;
      });
    }
    else {
      this.pageSize = this.dataService.getConfig()?.pageSize || 10;
    }
  }

  // Placeholder methods for the unimplemented methods
  validateSearchInput() {
    if (this.searchPatient != null && this.searchPatient != undefined && this.searchPatient.FirstName?.length < 3 && this.searchPatient.LastName?.length < 3 &&
      this.searchPatient.PrimaryEmail?.length < 3 && this.searchPatient.PermCity?.length < 3 &&
      this.searchPatient.PrimaryPhone?.length < 3 && this.searchPatient.DoctorName?.length < 3) {
      this.searchLengthConstraintError = true;
      this.clearSearchClicked = false;
    } else {
      this.searchLengthConstraintError = false;
      this.clearSearchClicked = true;
    }
    this.cdrRef.detectChanges();
  }
  SearchAppointments() {
    if (this.searchLengthConstraintError) {
      return;
    }
    this.searchPatient.pageSize = this.pageSize;
    this.searchPatient.pageNumber = this.currentPage;
    const startDate = this.util.getDefaultStartDate();
    const endDate = this.util.getDefaultEndDate();
    this.patientAppointmentService.getAppointments(this.dataService.getLoginUser().user.ID, this.dataService.getLoginUser().user.UserType, startDate, endDate,
      this.currentPage, this.pageSize).subscribe({
        next: (result: AppointmentSearchResponse) => {
          this.searchResult = result;
          this.clearSearchClicked = false;
          if (!this.searchResult.PatientAppointments || this.searchResult.PatientAppointments.length === 0) {
            this.messageService.info('No appointments found.');
            this.totalItems = 0;
          } else {
            this.totalItems = this.searchResult.TotalCount || 0;
            this.AddEventsToScheduler(this.searchResult.PatientAppointments);
          }
          this.cdrRef.detectChanges();
        },
        error: (err: any) => {
          // Optionally handle error
          this.messageService.error('Error occurred while searching for patients.');
          console.error(err);
          this.searchResult = null;
          this.clearSearchClicked = false;
          this.cdrRef.detectChanges();
        }
      });
  }

  getDoctors = (name: string): Observable<SearchModel[]> => {
    var searchModel: SearchModel = new SearchModel(this.util);
    searchModel.UserType = UserType.Doctor;
    searchModel.FirstName = name;
    this.cdrRef.detectChanges();
    return this.searchService.SearchUser(searchModel).pipe(map(result => result.Results as SearchModel[]));

  }

  getPatients = (name: string): Observable<SearchModel[]> => {
    const searchModel: SearchModel = new SearchModel(this.util);
    searchModel.UserType = UserType.Patient;
    searchModel.FirstName = name;
    return this.searchService.SearchPatient(searchModel).pipe(
      map(result => result.Results as SearchModel[])
    );
    this.cdrRef.detectChanges();
  }

  displayName(d: any): string {
    if (!d) return 'Unknown Patient';
    const first = d.FirstName || '';
    const last = d.LastName || '';
    const name = (first + ' ' + last).trim();
    return name.length ? name : 'Unknown Patient';
  }

  clearSearch() {
    this.searchPatient = new SearchModel(this.util);
    this.clearSearchClicked = true;
    this.searchLengthConstraintError = false;
    this.searchResult = null;
    // this.scheduler.clearEvents();
  }

  AddNewAppointment() {
    const now = this.util.roundToNearestInterval(new Date());
    const thirtyMinutesLater = new Date(now.getTime() + 30 * 60000);
    this.appointmentDateString = this.util.formatDate(new Date(), 'yyyy-MM-dd');
    this.newAppointment = new PatientAppointment();
    this.newAppointment.ID = 0;
    this.newAppointment.StartDateTime = new Date();
    this.newAppointment.StartTime = now.toTimeString().substring(0, 5); // "HH:MM"
    this.newAppointment.EndDateTime = new Date();
    this.newAppointment.EndTime = thirtyMinutesLater.toTimeString().substring(0, 5); // "HH:MM"
  }

  EditAppointment(ID: number) {
    this.newAppointment = Object.assign({}, this.searchResult.PatientAppointments?.find(a => a.ID === ID));
    this.appointmentDateString = this.util.formatDate(this.newAppointment.StartDateTime, 'yyyy-MM-dd');
    this.newAppointment.StartTime = this.util.formatDate(this.newAppointment.StartDateTime, 'HH:mm');
    this.newAppointment.EndTime = this.util.formatDate(this.newAppointment.EndDateTime, 'HH:mm');
    this.newAppointment.PatientName = this.newAppointment.PatientName || 'Unknown Patient';
    this.newAppointment.PatientID = this.newAppointment.PatientID || 0;
    this.newAppointment.DoctorName = this.newAppointment.DoctorName || 'General';
    this.newAppointment.DoctorID = this.newAppointment.DoctorID || 0;
  }

  DeleteAppointment(ID: number) {
    const msg = 'Are you sure you want to delete this appointment?';
    const confirmFn = (window as any).showConfirm || ((m: string) => Promise.resolve(confirm(m)));
    confirmFn(msg).then((confirmed: boolean) => {
      if (!confirmed) return;
      this.patientAppointmentService.deletePatientAppointment(ID).subscribe({
        next: (result: any) => {
          this.messageService.success('Appointment deleted successfully.');
          this.searchResult.PatientAppointments = this.searchResult.PatientAppointments?.filter(a => a.ID !== ID) || null;
          // Keep the search result total count in sync with the delete
          if (this.searchResult.TotalCount != null && this.searchResult.TotalCount > 0) {
            this.searchResult.TotalCount -= 1;
          }
          this.totalItems = this.searchResult.TotalCount || this.searchResult.PatientAppointments?.length || 0;
          try {
            this.scheduler.removeEventById(ID.toString());
          } catch (e) {
            this.AddEventsToScheduler(this.searchResult.PatientAppointments || []);
          }
          this.cdrRef.detectChanges();
        },
        error: (err: any) => {
          console.error(err);
          this.messageService.error('Error occurred while deleting appointment.');
        }
      });
    });
  }

  SaveAppointment() {
    // Implement save logic here
    const appointmentToSave = { ...this.newAppointment };
    appointmentToSave.StartDateTime = this.util.createAppointmentDateTimeFromString(this.appointmentDateString, appointmentToSave.StartTime + ':00');
    appointmentToSave.EndDateTime = this.util.createAppointmentDateTimeFromString(this.appointmentDateString, appointmentToSave.EndTime + ':00');
    if (appointmentToSave.ID === 0) {
      this.patientAppointmentService.createPatientAppointment(appointmentToSave).subscribe({
        next: (result: PatientAppointment) => {
          this.messageService.success('Appointment created successfully.');
          // Call API with the populated appointment BEFORE clearing the form
          if (this.searchResult.PatientAppointments == null || this.searchResult.PatientAppointments == undefined)
            this.searchResult.PatientAppointments = [];
          this.searchResult.PatientAppointments?.push(result);
          // Keep the search result total count in sync with the add
          this.searchResult.TotalCount = (this.searchResult.TotalCount || 0) + 1;
          this.totalItems = this.searchResult.TotalCount;
          try {
            const appt: any = result;
            const ev: DayPilot.EventData = {
              id: appt.ID.toString(),
              text: appt.PatientName || 'Unknown Patient',
              start: new DayPilot.Date(new Date(appt.StartDateTime), true),
              end: new DayPilot.Date(new Date(appt.EndDateTime), true),
              resource: appt.DoctorName || 'General',
              backColor: '#3c8dbc'
            };
            this.scheduler.addEvent(ev);
          } catch (e) {
            this.AddEventsToScheduler(this.searchResult.PatientAppointments || []);
          }
          this.cdrRef.detectChanges();
        },
        error: (err: any) => {
          this.messageService.error('Error occurred while creating appointment.');
          console.error(err);
        }
      });
    }
    else {
      this.patientAppointmentService.updatePatientAppointment(appointmentToSave.ID, appointmentToSave).subscribe({
        next: (result: PatientAppointment) => {
          this.messageService.success('Appointment updated successfully.');
          // Call API with the populated appointment BEFORE clearing the form
          const index = this.searchResult.PatientAppointments?.findIndex(a => a.ID === appointmentToSave.ID);
          if (index !== undefined && index >= 0 && this.searchResult.PatientAppointments) {
            this.searchResult.PatientAppointments[index] = appointmentToSave;
            try {
              const appt: any = appointmentToSave;
              const ev: DayPilot.EventData = {
                id: appt.ID.toString(),
                text: appt.PatientName || 'Unknown Patient',
                start: new DayPilot.Date(new Date(appt.StartDateTime), true),
                end: new DayPilot.Date(new Date(appt.EndDateTime), true),
                resource: appt.DoctorName || 'General',
                backColor: '#3c8dbc'
              };
              this.scheduler.updateEvent(ev);
            } catch (e) {
              this.AddEventsToScheduler(this.searchResult.PatientAppointments || []);
            }
            this.cdrRef.detectChanges();
          }
        },
        error: (err: any) => {
          this.messageService.error('Error occurred while updating appointment.');
          console.error(err);
          // Keep the form values so user can retry
        }
      });
    }
  }


  AddEventsToScheduler(this: any, appointments: PatientAppointment[]) {
    var events: DayPilot.EventData[] = [];
    if (appointments == null || appointments.length == 0) {
      this.scheduler.clearEvents();
      return;
    }
    appointments.forEach(appointment => {
      events.push({
        id: appointment.ID.toString(),
        text: appointment.PatientName || 'Unknown Patient',
        start: new DayPilot.Date(new Date(appointment.StartDateTime), true),
        end: new DayPilot.Date(new Date(appointment.EndDateTime), true),
        resource: appointment.DoctorName || 'General',
        backColor: '#3c8dbc',
      });
    });
    this.scheduler.addEvents(events);
  }

  ngOnInit() {
    this.clearSearch();
  }

  displayPatientName(d: any): string {
    if (!d) return 'Unknown Patient';
    const first = d.FirstName || '';
    const last = d.LastName || '';
    const name = (first + ' ' + last).trim();
    return name.length ? name : 'Unknown Patient';
  }

  onPageChanged($event: number) {
    this.currentPage = $event;
    this.searchPatient.pageNumber = this.currentPage;
    this.SearchAppointments();
  }
}
