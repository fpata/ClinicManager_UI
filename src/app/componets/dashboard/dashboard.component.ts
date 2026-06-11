import { Component, OnInit, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import { SchedulerComponent } from "../../common/scheduler/scheduler";
import { AppointmentSearchResponse, PatientAppointment } from '../../models/patient-appointment.model';
import { PatientAppointmentService } from '../../services/patient-appointment.service';
import { DayPilot } from '@daypilot/daypilot-lite-angular';
import { PagingComponent } from "../../common/paging/paging.component";
import { DataService } from '../../services/data.service';
import { FormsModule } from '@angular/forms';
import { SearchService } from '../../services/search.service';
import { SearchModel, SearchResultModel } from '../../models/search.model';
import { MessageService } from '../../services/message.service';
import { UtilityService } from '../../services/utility.service';
import { UserType } from '../../models/user.model';
import { Patient } from '../../models/patient.model';
import { map, Observable } from 'rxjs';
import { TypeaheadComponent } from '../../common/typeahead/typeahead';
import { LoginResponse } from '../../services/login.service';
import { AppDatePipe } from '../../common/app-date.pipe';
import { AppointmentHelper } from '../../common/appointment-helper';
@Component({
   selector: 'app-dashboard',
   imports: [SchedulerComponent, PagingComponent, FormsModule, TypeaheadComponent, AppDatePipe],
   templateUrl: './dashboard.component.html',
   styleUrls: ['./dashboard.component.css'],
   providers: [],
   standalone: true,
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit, OnChanges {

   @Input() patient: Patient | null = null;
   @Input() patientId: number | null = null;
   @Input() patientName: string | null = null;
   @Input() isEmbedded: boolean = false;

   private isLocalUpdate = false;

   currentPage: number = 1;
   pageSize: number = 10;
   totalItems: number = 0;
   newAppointment: PatientAppointment | null = null;
   appointments: PatientAppointment[] = [];
   selectedPatient: any | null = null;
   selectedDoctor: any | null = null;
   doctors: SearchModel[] | null = null;
   newStartDateString: string = '';

   @ViewChild(SchedulerComponent) scheduler!: SchedulerComponent;

   get isPatientRole(): boolean {
      const loginUser = this.dataService.getLoginUser();
      const userType = loginUser?.user?.UserType as any;
      return userType === UserType.Patient || userType === 'Patient' || userType === 1 || userType === '1';
   }

   constructor(private patientAppointmentService: PatientAppointmentService,
      private dataService: DataService,
      private searchService: SearchService,
      private messageService: MessageService,
      private util: UtilityService,
      private cdr: ChangeDetectorRef
   ) {

   }

   ngOnInit(): void {
      this.pageSize = this.dataService.getConfig()?.pageSize || 10;
      this.loadDefaultAppointments();
   }

   ngOnChanges(changes: SimpleChanges): void {
      if (changes['patient'] && !changes['patient'].firstChange) {
         if (this.isLocalUpdate) {
            this.isLocalUpdate = false;
            return;
         }
         this.loadDefaultAppointments();
      }
   }

   onPageChange($event: number) {
      this.currentPage = $event;
      this.loadDefaultAppointments();
   }

   private loadDefaultAppointments(): void {

      this.loadAppointments(this.util.getDefaultStartDate(), this.util.getDefaultEndDate());
   }



   private loadAppointments(startDate: Date, endDate: Date): void {
      startDate = this.util.getDefaultStartDate();
      endDate = this.util.getDefaultEndDate();
      this.patientAppointmentService.getAppointments(this.dataService.getLoginUser().user.ID, this.dataService.getLoginUser().user.UserType, startDate, endDate, this.currentPage, this.pageSize)
         .subscribe({
            next: (results: AppointmentSearchResponse) => {
               if (results == null || results.PatientAppointments == null || results.PatientAppointments.length === 0) {
                  this.messageService.info('No appointments found.');
                  this.appointments = [];
                  this.totalItems = 0;
                  this.cdr.detectChanges();
               }
               else {
                  // this.messageService.success('Appointments loaded successfully.');
                  this.appointments = this.patientAppointmentService.setPatinetAppointmentTime(results.PatientAppointments);
                  this.totalItems = results.TotalCount;
                  this.addEventsToScheduler(this.appointments);
                  this.cdr.detectChanges();
               }
            },
            error: (error) => {
               console.error('Error fetching appointments:', error);
               this.messageService.error('Error fetching appointments:', error);
               this.appointments = [];
               this.totalItems = 0;
               this.cdr.detectChanges();
            }
         });

   }


   private addEventsToScheduler(appointments: PatientAppointment[]): void {
      if (appointments == null || appointments === undefined || appointments.length === 0) {
         return;
      }
      const events = AppointmentHelper.mapAppointmentsToEvents(appointments, !this.patientId);
      if (this.scheduler) this.scheduler.addEvents(events);
   }

   SaveAppointment() {
      // Create a temporary appointment object
      const appointmentToSave = { ...this.newAppointment };

      // Build StartDateTime from the date string and start time
      if (this.newStartDateString && this.newAppointment?.StartTime) {
         appointmentToSave.StartDateTime = this.util.createAppointmentDateTimeFromString(
            this.newStartDateString,
            this.newAppointment.StartTime
         );
      }

      // Build EndDateTime from the date string and end time
      if (this.newStartDateString && this.newAppointment?.EndTime) {
         appointmentToSave.EndDateTime = this.util.createAppointmentDateTimeFromString(
            this.newStartDateString,
            this.newAppointment.EndTime
         );
      }

      const appointmentPayload: any = {
         ...appointmentToSave,
         StartDateTime: appointmentToSave.StartDateTime ? this.util.toLocalDateTimeString(appointmentToSave.StartDateTime) : undefined,
         EndDateTime: appointmentToSave.EndDateTime ? this.util.toLocalDateTimeString(appointmentToSave.EndDateTime) : undefined
      };

      appointmentToSave.AppointmentStatus = 'Scheduled';
      appointmentToSave.IsActive = 1;

      if (this.isEmbedded && this.patient) {
         if (appointmentToSave.ID && appointmentToSave.ID !== 0) {
            // Update existing appointment
            const index = this.appointments.findIndex(a => a.ID === appointmentToSave.ID);
            if (index > -1) {
               this.appointments[index] = appointmentToSave;
            }
         } else {
            // Create new appointment
            const ids = this.appointments.map(a => a.ID).filter(id => id !== undefined);
            const minId = ids.length > 0 ? Math.min(...ids) : 0;
            appointmentToSave.ID = minId < 0 ? minId - 1 : -1;
            appointmentToSave.PatientID = this.patientId ?? this.patient.ID ?? 0;
            appointmentToSave.UserID = this.patient.UserID ?? 0;
            this.appointments.push(appointmentToSave);
         }

         // Format times for display and copy back to patient
         this.appointments = this.patientAppointmentService.setPatinetAppointmentTime(this.appointments);
         this.patient.PatientAppointments = [...this.appointments];
         this.totalItems = this.appointments.length;

         // Update user object in DataService
         const user = this.dataService.getUser();
         if (user && user.Patients && user.Patients.length > 0) {
            const pIdx = user.Patients.findIndex((p: any) => p.ID === this.patient!.ID);
            if (pIdx > -1) {
               user.Patients[pIdx] = this.patient;
               this.isLocalUpdate = true;
               this.dataService.setUser(user);
            }
         }

         this.messageService.success(appointmentToSave.ID > 0 ? 'Appointment updated locally.' : 'Appointment added locally.');
         this.addEventsToScheduler(this.appointments);
         this.cdr.detectChanges();
         return;
      }

      if (appointmentToSave.ID && appointmentToSave.ID > 0) {
         // Update existing appointment
         this.patientAppointmentService.updatePatientAppointment(appointmentToSave.ID, appointmentPayload)
            .subscribe({
               next: (result) => {
                  this.messageService.success('Appointment updated successfully.');
                  const index = this.appointments.findIndex(a => a.ID === result.ID);
                  if (index > -1) {
                     this.appointments[index] = result;
                  }
                  // Refresh scheduler events so the calendar shows the updated appointment
                  this.addEventsToScheduler(this.appointments);
                  // If the global user state contains this patient, update it so other components refresh
                  try {
                     const user: any = this.dataService.getUser();
                     if (user && user.Patients && user.Patients.length) {
                        const patient: any = user.Patients.find((p: any) => p.ID === result.PatientID);
                        if (patient) {
                           if (!patient.PatientAppointments) patient.PatientAppointments = [];
                           const pIndex = patient.PatientAppointments.findIndex((a: any) => a.ID === result.ID);
                           if (pIndex > -1) {
                              patient.PatientAppointments[pIndex] = result;
                           } else {
                              patient.PatientAppointments.push(result);
                           }
                           this.dataService.setUser(user);
                        }
                     }
                  } catch (e) {
                     // ignore if no global user
                  }
                  this.cdr.detectChanges();
               },
               error: (error) => {
                  this.messageService.error('Error updating appointment:');
                  console.error('Error updating appointment:', error);
               }
            });
      } else {
         // Continue with saving...
         this.patientAppointmentService.createPatientAppointment(appointmentPayload)
            .subscribe({
               next: (result) => {
                  this.messageService.success('Appointment saved successfully.');
                  if (this.appointments == null || this.appointments === undefined) {
                     this.appointments = [];
                  }
                  this.appointments.push(result);
                  this.totalItems = this.appointments.length;
                  this.addEventsToScheduler(this.appointments);
                  // Update global user/patient appointments if present
                  try {
                     const user: any = this.dataService.getUser();
                     if (user && user.Patients && user.Patients.length) {
                        const patient: any = user.Patients.find((p: any) => p.ID === result.PatientID);
                        if (patient) {
                           if (!patient.PatientAppointments) patient.PatientAppointments = [];
                           patient.PatientAppointments.push(result);
                           this.dataService.setUser(user);
                        }
                     }
                  } catch (e) {
                     // ignore
                  }
                  this.cdr.detectChanges();
               },
               error: (error) => {
                  this.messageService.error('Error saving appointment:');
                  console.error('Error saving appointment:', error);
                  this.cdr.detectChanges();
               }
            });
      }
   }


   getDoctors = (name: string): Observable<SearchModel[]> => {
      return AppointmentHelper.getDoctors(name, this.searchService, this.util);
   }

   onPatientSelected(patient: any | null) {
      if (!this.newAppointment) return;
      this.selectedPatient = patient;
      if (!patient) {
         this.newAppointment.PatientID = 0;
         this.newAppointment.PatientName = '';
         this.newAppointment.UserID = 0;
         return;
      }
      this.newAppointment.PatientID = patient.PatientID ?? patient.UserID ?? 0;
      this.newAppointment.PatientName = `${patient.FirstName || ''} ${patient.LastName || ''}`.trim();
      this.newAppointment.UserID = patient.UserID ?? this.newAppointment.UserID ?? 0;
   }

   onDoctorSelected(doctor: any | null) {
      if (!this.newAppointment) return;
      this.selectedDoctor = doctor;
      if (!doctor) {
         this.newAppointment.DoctorID = 0;
         this.newAppointment.DoctorName = '';
         return;
      }
      this.newAppointment.DoctorID = doctor.UserID ?? 0;
      this.newAppointment.DoctorName = `${doctor.FirstName || ''} ${doctor.LastName || ''}`.trim();
   }

   getPatients = (name: string): Observable<SearchModel[]> => {
      return AppointmentHelper.getPatients(name, this.searchService, this.util);
   }


   displayName(d: any): string {
      return AppointmentHelper.displayName(d);
   }

   InitializeNewAppointment() {
      const loginUser: LoginResponse = this.dataService.getLoginUser();
      this.newAppointment = new PatientAppointment();

      // Round current time to nearest 30-minute interval
      const now = this.util.roundToNearestInterval(new Date());
      const thirtyMinutesLater = new Date(now.getTime() + 30 * 60000);

      this.newAppointment.ID = 0;
      this.newAppointment.StartDateTime = now;
      this.newAppointment.EndDateTime = thirtyMinutesLater;
      this.newAppointment.CreatedDate = now.toISOString();
      this.newAppointment.ModifiedDate = now.toISOString();
      this.newAppointment.CreatedBy = loginUser?.user?.ID || 1;
      this.newAppointment.ModifiedBy = loginUser?.user?.ID || 1;
      this.newAppointment.IsActive = 1;
      this.newAppointment.AppointmentStatus = 'Scheduled';
      this.newStartDateString = now.toISOString().split('T')[0];
      // Format times for display
      const startTime = now.toLocaleTimeString('en-GB').slice(0, 5);
      const endTime = thirtyMinutesLater.toLocaleTimeString('en-GB').slice(0, 5);
      this.newAppointment.StartTime = startTime;
      this.newAppointment.EndTime = endTime;

      if (this.patientId) {
         const resolvedName = (this.patientName && this.patientName !== 'Unknown Patient')
            ? this.patientName
            : '';
         this.newAppointment.PatientID = this.patientId;
         this.newAppointment.PatientName = resolvedName;
         this.selectedPatient = {
            PatientID: this.patientId,
            FirstName: resolvedName.split(' ')[0] || '',
            LastName: resolvedName.split(' ').slice(1).join(' ') || ''
         };
      } else {
         this.selectedPatient = null;
      }

      this.selectedDoctor = null;

      const userType = loginUser?.user?.UserType as any;
      const isDoctor = userType === UserType.Doctor || userType === 'Doctor' || userType === 2 || userType === '2';
      if (isDoctor) {
         this.newAppointment.DoctorID = loginUser.user?.ID || 0;
         this.newAppointment.DoctorName = loginUser.user?.FirstName + ' ' + loginUser.user?.LastName;
         this.selectedDoctor = {
            UserID: loginUser.user?.ID,
            FirstName: loginUser.user?.FirstName,
            LastName: loginUser.user?.LastName
         };
      }
      this.cdr.detectChanges();
   }

   NavigationChange($event: { action: string; date: DayPilot.Date; }) {
      let startDate: Date;
      let endDate: Date;

      switch ($event.action) {
         case 'today':
         case 'previous-week':
         case 'next-week':
         case 'week':
            startDate = $event.date.firstDayOfWeek(1).toDate();
            endDate = $event.date.firstDayOfWeek(1).addDays(6).toDate();
            break;
         case 'previous-day':
         case 'next-day':
         case 'day':
            startDate = $event.date.toDate();
            endDate = $event.date.addHours(23).toDate();
            break;
         default:
            startDate = $event.date.toDate();
            endDate = $event.date.addDays(6).toDate();
      }

      // Reset page to 1 when navigation changes
      this.currentPage = 1;
      this.loadAppointments(startDate, endDate);
   }

    onTimeRangeSelectedEvent($event: any) {
      if (this.isPatientRole) {
         return;
      }
      document.getElementById('btnAddNewAppointment')!.click();
      this.newAppointment!.StartDateTime = $event.startDateTime.toDate();
      this.newAppointment!.EndDateTime = $event.endDateTime.toDate();
      // Set date and time strings for the modal inputs
      this.newStartDateString = this.util.format(this.newAppointment!.StartDateTime, 'yyyy-MM-dd');
      this.newAppointment!.StartTime = this.util.format(this.newAppointment!.StartDateTime, 'HH:mm');
      this.newAppointment!.EndTime = this.util.format(this.newAppointment!.EndDateTime, 'HH:mm');
      document.getElementById('appointmentDatePicker')!.setAttribute('value', this.util.formatAppointmentDateTime(this.newAppointment!.StartDateTime));
      this.cdr.detectChanges();
   }

   onStartTimeChanged(newTime: string) {
      if (!this.newAppointment) return;
      this.newAppointment.StartTime = newTime;

      // Update StartDateTime based on current selected date
      if (this.newStartDateString) {
         this.newAppointment.StartDateTime = this.util.createAppointmentDateTimeFromString(this.newStartDateString, newTime);
      } else if (this.newAppointment.StartDateTime) {
         this.newAppointment.StartDateTime = this.util.createAppointmentDateTime(this.newAppointment.StartDateTime, newTime);
      }

      // Ensure EndTime is after StartTime; default to +30 minutes if not
      const start = new Date(this.newAppointment.StartDateTime as any);
      let end: Date;
      if (this.newAppointment.EndTime) {
         end = this.util.createAppointmentDateTimeFromString(this.newStartDateString || this.util.format(this.newAppointment.StartDateTime, 'yyyy-MM-dd'), this.newAppointment.EndTime);
         if (end <= start) {
            end = new Date(start.getTime() + 30 * 60000);
            this.newAppointment.EndTime = this.util.format(end, 'HH:mm');
         }
      } else {
         end = new Date(start.getTime() + 30 * 60000);
         this.newAppointment.EndTime = this.util.format(end, 'HH:mm');
      }
      this.newAppointment.EndDateTime = end;
      this.cdr.detectChanges();
   }

   onEndTimeChanged(newTime: string) {
      if (!this.newAppointment) return;
      this.newAppointment.EndTime = newTime;

      if (this.newStartDateString) {
         this.newAppointment.EndDateTime = this.util.createAppointmentDateTimeFromString(this.newStartDateString, newTime);
      } else if (this.newAppointment.EndDateTime) {
         this.newAppointment.EndDateTime = this.util.createAppointmentDateTime(this.newAppointment.EndDateTime, newTime);
      }

      // If end is before or equal to start, push end to start + 30m
      const start = new Date(this.newAppointment.StartDateTime as any);
      const end = new Date(this.newAppointment.EndDateTime as any);
      if (end <= start) {
         const corrected = new Date(start.getTime() + 30 * 60000);
         this.newAppointment.EndDateTime = corrected;
         this.newAppointment.EndTime = this.util.format(corrected, 'HH:mm');
      }
      this.cdr.detectChanges();
   }

   onAppointmentDateChanged(newDate: string) {
      if (!newDate || !this.newAppointment) return;

      this.newStartDateString = newDate;

      // Update StartDateTime with the new date
      if (this.newAppointment.StartTime) {
         this.newAppointment.StartDateTime = this.util.createAppointmentDateTimeFromString(
            newDate,
            this.newAppointment.StartTime
         );
      } else {
         // If no time is set, set to midnight on the new date
         this.newAppointment.StartDateTime = new Date(newDate);
      }

      // Update EndDateTime with the new date
      if (this.newAppointment.EndTime) {
         this.newAppointment.EndDateTime = this.util.createAppointmentDateTimeFromString(
            newDate,
            this.newAppointment.EndTime
         );
      } else {
         // If no end time is set, set to 30 minutes after start time
         this.newAppointment.EndDateTime = new Date(this.newAppointment.StartDateTime.getTime() + 30 * 60000);
      }

      this.cdr.detectChanges();
   }

   EditAppointment(appointmentID: number) {
      const appointment = this.appointments.find(a => a.ID === appointmentID);
      if (appointment) {
         this.newAppointment = { ...appointment };
         this.newStartDateString = this.util.formatDate(appointment.StartDateTime, 'yyyy-MM-dd');
         this.selectedPatient = {
            PatientID: appointment.PatientID,
            UserID: appointment.UserID,
            FirstName: appointment.PatientName?.split(' ')[0] || '',
            LastName: appointment.PatientName?.split(' ').slice(1).join(' ') || ''
         };
         this.selectedDoctor = {
            UserID: appointment.DoctorID,
            FirstName: appointment.DoctorName?.split(' ')[0] || '',
            LastName: appointment.DoctorName?.split(' ').slice(1).join(' ') || ''
         };
      }
   }

   DeleteAppointment(appointmentID: number) {
      const msg = 'Are you sure you want to delete this appointment?';
      const confirmFn = (window as any).showConfirm || ((m: string) => Promise.resolve(confirm(m)));
      confirmFn(msg).then((confirmed: boolean) => {
         if (!confirmed) return;
         const index = this.appointments.findIndex(x => x.ID === appointmentID);
         if (index === -1) {
            this.messageService.error('Appointment not found.');
            return;
         }

         if (this.isEmbedded && this.patient) {
            this.appointments.splice(index, 1);
            this.patient.PatientAppointments = [...this.appointments];
            this.totalItems = this.appointments.length;

            // Update user object in DataService
            const user = this.dataService.getUser();
            if (user && user.Patients && user.Patients.length > 0) {
               const pIdx = user.Patients.findIndex((p: any) => p.ID === this.patient!.ID);
               if (pIdx > -1) {
                  user.Patients[pIdx] = this.patient;
                  this.isLocalUpdate = true;
                  this.dataService.setUser(user);
               }
            }
            try {
               this.scheduler.removeEventById(appointmentID.toString());
            } catch (e) {
               // ignore scheduler delete failures
            }
            this.messageService.success('Appointment deleted locally.');
            this.cdr.detectChanges();
            return;
         }

         this.patientAppointmentService.deletePatientAppointment(appointmentID).subscribe({
            next: () => {
               this.appointments.splice(index, 1);
               this.totalItems = this.appointments.length;
               try {
                  this.scheduler.removeEventById(appointmentID.toString());
               } catch (e) {
                  // ignore scheduler delete failures
               }
               try {
                  const user: any = this.dataService.getUser();
                  if (user && user.Patients && user.Patients.length) {
                     const patient = user.Patients.find((p: any) => p.PatientAppointments?.some((a: any) => a.ID === appointmentID));
                     if (patient && patient.PatientAppointments) {
                        patient.PatientAppointments = patient.PatientAppointments.filter((a: any) => a.ID !== appointmentID);
                        this.dataService.setUser(user);
                     }
                  }
               } catch (e) {
                  // ignore
               }
               this.messageService.success('Appointment deleted successfully.');
               this.cdr.detectChanges();
            },
            error: (error) => {
               this.messageService.error('Error deleting appointment:');
               console.error('Error deleting appointment:', error);
            }
         });
      });
   }

}
