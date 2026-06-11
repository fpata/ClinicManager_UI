import { Routes } from '@angular/router';
import { LoginComponent } from './componets/login/login.component';
import { PatientMasterComponent } from './componets/patient/patient-master/patient-master.component';
import { SchedulerComponent } from './common/scheduler/scheduler';
import { DashboardComponent } from './componets/dashboard/dashboard.component';
import { DoctorAppointmentsComponent } from './componets/doctor/doctorappointments/doctorappointments.component';
import { PatientCompleteHistoryComponent } from './componets/patient/patientcompletehistory/patient-complete-history.component';
import { UserMasterComponent } from './componets/user/user-master/user-master.component';
import { authGuard } from './guards/auth.guard';
import { PatientIdGuard } from './guards/patient-id.guard';
import { BillingrecordComponent } from './componets/billing/billingrecord.component/billingrecord.component';
import { CreateBillingComponent } from './componets/billing/create-billing.component/create-billing.component';
import { PaymentComponent } from './componets/billing/payment.component/payment.component';
import { AppconfigComponent } from './componets/appconfig/appconfig.component';
import { ForgotPasswordComponent } from './componets/login/forgotpassword/forgotpassword.component';
import { UserSearch } from './componets/user/user-search/user-search.component';
import { UserInfoComponent } from './componets/user/user-info/user-info.component';
import { UserQuickCreateComponent } from './componets/user/user-quick-create/user-quick-create.component';
import { PatientSearchComponent } from './componets/patient/patient-search/patient-search.component';
import { PatientVitalsComponent } from './componets/patient/patient-vitals/patient-vitals.component';
import { PatientHistoryComponent } from './componets/patient/patient-history/patient-history.component';
import { PatientTreatmentComponent } from './componets/patient/patient-treatment/patient-treatment.component';
import { PatientAppointmentComponent } from './componets/patient/patient-appointment/patient-appointment.component';
import { PatientReportComponent } from './componets/patient/patient-report/patient-report.component';
import { FinancialReportsComponent } from './componets/reports/financial-reports/financial-reports.component';
import { AppointmentReportsComponent } from './componets/reports/appointment-reports/appointment-reports.component';
import { ClinicalReportsComponent } from './componets/reports/clinical-reports/clinical-reports.component';


export const routes: Routes = [
  {
    path: 'login',
    children: [
      { path: 'forgotpassword', component: ForgotPasswordComponent },
      { path: '', component: LoginComponent }
    ]
  },
  {
    path: 'patient',
    canActivate: [authGuard],
    data: { expectedRoles: ['Admin', 'Administrator', 'Doctor', 'Nurse', 'Patient', 'Accountant'] },
    children: [
      { path: 'search', component: PatientSearchComponent, canActivate: [authGuard], data: { expectedRoles: ['Admin', 'Administrator', 'Doctor', 'Nurse', 'Accountant'] } },
      {
        path: ':patientId', canActivate: [PatientIdGuard],
        children: [
          { path: 'vitals', component: PatientVitalsComponent },
          { path: 'history', component: PatientHistoryComponent },
          { path: 'treatment', component: PatientTreatmentComponent },
          { path: 'appointment', component: PatientAppointmentComponent },
          { path: 'reports', component: PatientReportComponent },
          { path: 'previous-treatments', component: PatientCompleteHistoryComponent },
          { path: '', redirectTo: 'search', pathMatch: 'full' }
        ]
      },
      { path: '', redirectTo: 'search', pathMatch: 'full' }
    ]
  },
  { path: 'scheduler', component: SchedulerComponent, canActivate: [authGuard], data: { expectedRoles: ['Admin', 'Administrator', 'Doctor'] } },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard], data: { expectedRoles: ['Admin', 'Administrator', 'Doctor', 'Nurse'] } },
  { path: 'doctorAppointments', component: DoctorAppointmentsComponent, canActivate: [authGuard], data: { expectedRoles: ['Admin', 'Administrator', 'Doctor'] } },
  { path: 'patienthistory', component: PatientCompleteHistoryComponent, canActivate: [authGuard], data: { expectedRoles: ['Admin', 'Administrator', 'Doctor', 'Nurse', 'Patient', 'Accountant'] } },
  { path: 'user-search', component: UserSearch, canActivate: [authGuard], data: { expectedRoles: ['Admin', 'Administrator', 'Doctor'] } },
  { path: 'user-create', component: UserInfoComponent, canActivate: [authGuard], data: { expectedRoles: ['Admin', 'Administrator', 'Doctor', 'Patient'] } },
  { path: 'user-quick-create', component: UserQuickCreateComponent, canActivate: [authGuard], data: { expectedRoles: ['Admin', 'Administrator', 'Doctor'] } },
  {
    path: 'billing',
    canActivate: [authGuard],
    data: { expectedRoles: ['Admin', 'Administrator', 'Doctor', 'Accountant'] },
    children: [
      { path: 'records', component: BillingrecordComponent },
      { path: 'create', component: CreateBillingComponent },
      { path: 'payment', component: PaymentComponent },
      { path: '', redirectTo: 'records', pathMatch: 'full' }
    ]
  },
  { path: 'appconfig', component: AppconfigComponent, canActivate: [authGuard], data: { expectedRoles: ['Admin', 'Administrator', 'Doctor'] } },
  {
    path: 'reports',
    canActivate: [authGuard],
    data: { expectedRoles: ['Admin', 'Administrator', 'Doctor', 'Nurse', 'Accountant'] },
    children: [
      { path: 'financial', component: FinancialReportsComponent },
      { path: 'appointments', component: AppointmentReportsComponent },
      { path: 'clinical', component: ClinicalReportsComponent },
      { path: '', redirectTo: 'financial', pathMatch: 'full' }
    ]
  },
  // Add other routes here
];
