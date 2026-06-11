import { Observable, map } from 'rxjs';
import { DayPilot } from '@daypilot/daypilot-lite-angular';
import { SearchModel } from '../models/search.model';
import { UserType } from '../models/user.model';
import { PatientAppointment } from '../models/patient-appointment.model';
import { SearchService } from '../services/search.service';
import { UtilityService } from '../services/utility.service';

export class AppointmentHelper {
  private static readonly eventColors = ['#88bddb', '#a0d4bd', '#8a6d69', '#70624c', '#bc9fc7', '#8295a8'];

  static getRandomColor(): string {
    return this.eventColors[Math.floor(Math.random() * this.eventColors.length)];
  }

  static displayName(d: any): string {
    if (!d) return 'Unknown Patient';
    const first = d.FirstName || '';
    const last = d.LastName || '';
    const name = (first + ' ' + last).trim();
    return name.length ? name : 'Unknown Patient';
  }

  static getDoctors(name: string, searchService: SearchService, util: UtilityService): Observable<SearchModel[]> {
    const searchModel = new SearchModel(util);
    searchModel.UserType = UserType.Doctor;
    searchModel.FirstName = name;
    return searchService.SearchUser(searchModel).pipe(
      map(result => result.Results as SearchModel[])
    );
  }

  static getPatients(name: string, searchService: SearchService, util: UtilityService): Observable<SearchModel[]> {
    const searchModel = new SearchModel(util);
    searchModel.UserType = UserType.Patient;
    searchModel.FirstName = name;
    return searchService.SearchPatient(searchModel).pipe(
      map(result => result.Results as SearchModel[])
    );
  }

  static mapAppointmentsToEvents(appointments: PatientAppointment[], colors: boolean = true): DayPilot.EventData[] {
    if (!appointments) return [];
    return appointments.map(appt => {
      const text = appt.TreatmentName 
        ? `${appt.PatientName} : ${appt.TreatmentName}` 
        : (appt.PatientName || 'Unknown Patient');
      return {
        id: appt.ID.toString(),
        text: text,
        start: DayPilot?.Date ? new DayPilot.Date(new Date(appt.StartDateTime), true) : appt.StartDateTime as any,
        end: DayPilot?.Date ? new DayPilot.Date(new Date(appt.EndDateTime), true) : appt.EndDateTime as any,
        resource: appt.DoctorName || 'General',
        backColor: colors ? this.getRandomColor() : '#3c8dbc'
      };
    });
  }
}
