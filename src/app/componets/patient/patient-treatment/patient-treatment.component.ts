import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PatientTreatment } from '../../../models/patient-treatment.model';
import { DataService } from '../../../services/data.service';
import { PatientService } from '../../../services/patient.service';
import { UtilityService } from '../../../services/utility.service';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { PatientTreatmentDetail } from '../../../models/patient-treatment-detail.model';
import { Patient } from '../../../models/patient.model';
import { PatientBaseComponent } from '../patient-base.component';
import { MessageService } from '../../../services/message.service';
import { User } from '../../../models/user.model';
import { UserService } from '../../../services/user.service';
import { PatientTreatmentService } from '../../../services/patient-treatment.service';
import { PrintService } from '../../../services/print.service';

@Component({
  selector: 'app-patient-treatment',
  imports: [FormsModule],
  templateUrl: './patient-treatment.component.html',
  styleUrls: ['./patient-treatment.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatientTreatmentComponent extends PatientBaseComponent implements OnInit {

  treatment: PatientTreatment | null = null;
  patientId: number | null = null;
  isNewPatient = false;
  isEditOperation = false;
  newTreatmentDetail: PatientTreatmentDetail | null = null;
  util: UtilityService;
  // Subscription to handle patient changes

  constructor(
    dataService: DataService,
    userService: UserService,
    patientService: PatientService,
    private patientTreatmentService: PatientTreatmentService,
    private printService: PrintService,
    router: Router,
    cdr: ChangeDetectorRef,
    messageService: MessageService,
    util: UtilityService,
    route: ActivatedRoute
  ) {
    super(dataService, userService, patientService, messageService, router, cdr);
    this.util = util;
  }

  ngOnInit() {
    // Subscribe to patient changes from the data service
    this.initPatientSubscription();
    this.loadPatientInformation();
  }

  ClearTreatmentForm() {
    this.newTreatmentDetail = null;
    this.isEditOperation = false;
    this.cdr.markForCheck();
  }

  AddNewTreatmentDetails() {
    if (!this.treatment || !this.patient) {
      alert('Patient and treatment data must be loaded first.');
      console.error('Missing patient or treatment data');
      return;
    }

    this.newTreatmentDetail = new PatientTreatmentDetail();

    // Calculate ID for new treatment detail (use negative IDs for unsaved records)
    const ids = this.treatment?.PatientTreatmentDetails?.map(x => x.ID) || [];
    if (ids.length > 0) {
      let minVal = Math.min(...ids) - 1;
      this.newTreatmentDetail.ID = minVal > 0 ? 0 : minVal;
    }
    else {
      this.newTreatmentDetail.ID = 0;
    }

    this.newTreatmentDetail.IsActive = 1;
    // Set PatientTreatmentID - will be 0 for new patients, updated after save
    this.newTreatmentDetail.PatientTreatmentID = this.treatment.ID || 0;
    this.newTreatmentDetail.UserID = this.patient.UserID;
    this.newTreatmentDetail.PatientID = this.patient.ID || 0;
    this.newTreatmentDetail.Tooth = '';
    this.newTreatmentDetail.Procedure = '';
    this.newTreatmentDetail.Prescription = '';
    this.newTreatmentDetail.FollowUpInstructions = '';
    this.newTreatmentDetail.TreatmentDate = this.util.formatDate(new Date(), 'yyyy-MM-dd');
    this.newTreatmentDetail.CreatedBy = this.patient.UserID;
    this.newTreatmentDetail.CreatedDate = this.util.formatDateTime(new Date(), 'yyyy-MM-ddTHH:mm:ss');
    this.newTreatmentDetail.ModifiedBy = this.patient.UserID;
    this.newTreatmentDetail.ModifiedDate = this.util.formatDateTime(new Date(), 'yyyy-MM-ddTHH:mm:ss');
    this.newTreatmentDetail.ProcedureTreatmentCost = 0;
    this.isEditOperation = false;

    console.log('New treatment detail initialized:', this.newTreatmentDetail);
    this.cdr.markForCheck();
  }


  EditTreatmentDetails(treatmentdetailID: number) {
    if (this.treatment && this.treatment.PatientTreatmentDetails && this.treatment.PatientTreatmentDetails.length > 0) {
      const index = this.treatment.PatientTreatmentDetails.findIndex(x => x.ID === treatmentdetailID);
      if (index > -1) {
        this.newTreatmentDetail = { ...this.treatment.PatientTreatmentDetails[index] };
        this.isEditOperation = true;
        this.cdr.markForCheck();
      } else {
        alert('Treatment detail not found.');
      }
    }
  }

  DeleteTreatmentDetails(treatmentdetailID: number) {
    const msg = 'Are you sure you want to delete this treatment detail?';
    const confirmFn = (window as any).showConfirm || ((m: string) => Promise.resolve(confirm(m)));
    confirmFn(msg).then((confirmed: boolean) => {
      if (!confirmed) return;
      var index = this.treatment.PatientTreatmentDetails.findIndex(x => x.ID === treatmentdetailID);
      if (index > -1) {
        const deletedDetail = this.treatment.PatientTreatmentDetails[index];
        this.treatment.PatientTreatmentDetails.splice(index, 1);
        this.treatment.ActualCost = this.calculateTotalCost();

        if (this.patient) {
          const updatedPatient = JSON.parse(JSON.stringify(this.patient));
          updatedPatient.PatientTreatment = this.treatment;

          this.dataService.setPatient(updatedPatient);
          if (this.user) {
            const updatedUser = JSON.parse(JSON.stringify(this.user));
            if (updatedUser.Patients && updatedUser.Patients.length > 0) {
              updatedUser.Patients[0] = updatedPatient;
            }
            this.dataService.setUser(updatedUser);
          }
        }

        console.log('Deleted treatment detail:', deletedDetail);
        alert('Treatment detail deleted successfully. Click the Save Changes button to persist to the database.');
        this.cdr.markForCheck();
      } else {
        alert('Treatment detail not found.');
      }
    });
  }

  SaveTreatmentDetails() {
    if (!this.newTreatmentDetail) {
      alert('Please fill in all required fields.');
      return;
    }

    // Validate required fields
    if (!this.newTreatmentDetail.Tooth || this.newTreatmentDetail.Tooth.trim() === '') {
      alert('Please enter tooth number.');
      return;
    }

    if (!this.newTreatmentDetail.Procedure || this.newTreatmentDetail.Procedure.trim() === '') {
      alert('Please enter procedure.');
      return;
    }

    if (!this.newTreatmentDetail.TreatmentDate) {
      alert('Please select treatment date.');
      return;
    }

    // Ensure treatment has details array
    if (!this.treatment.PatientTreatmentDetails) {
      this.treatment.PatientTreatmentDetails = [];
    }

    if (this.newTreatmentDetail.ID < 1 && this.isEditOperation === false) {
      // Add new treatment detail - create a complete copy
      const newDetail = JSON.parse(JSON.stringify(this.newTreatmentDetail));
      this.treatment.PatientTreatmentDetails.push(newDetail);
      console.log('Added new treatment detail:', newDetail);
      console.log('Total treatment details now:', this.treatment.PatientTreatmentDetails.length);
    } else {
      // Update existing treatment detail
      const index = this.treatment.PatientTreatmentDetails.findIndex(x => x.ID === this.newTreatmentDetail.ID);
      if (index > -1) {
        const updatedDetail = JSON.parse(JSON.stringify(this.newTreatmentDetail));
        this.treatment.PatientTreatmentDetails[index] = updatedDetail;
        console.log('Updated treatment detail at index:', index, updatedDetail);
      }
    }

    // Update actual cost
    this.treatment.ActualCost = this.calculateTotalCost();

    // Ensure patient reference is updated
    if (!this.patient) {
      console.error('Patient is null!');
      alert('Patient data is missing. Please reload and try again.');
      return;
    }

    // Create a new patient object to ensure change detection
    const updatedPatient = JSON.parse(JSON.stringify(this.patient));
    updatedPatient.PatientTreatment = this.treatment;

    this.dataService.setPatient(updatedPatient);
    if (this.user) {
      const updatedUser = JSON.parse(JSON.stringify(this.user));
      if (updatedUser.Patients && updatedUser.Patients.length > 0) {
        updatedUser.Patients[0] = updatedPatient;
      }
      this.dataService.setUser(updatedUser);
    }

    this.newTreatmentDetail = null;
    this.isEditOperation = false;
    this.cdr.markForCheck();
  }

  private calculateTotalCost(): number {
    let totalCost = 0;
    if (this.treatment.PatientTreatmentDetails && this.treatment.PatientTreatmentDetails.length > 0) {
      for (let detail of this.treatment.PatientTreatmentDetails) {
        totalCost += detail.ProcedureTreatmentCost || 0;
      }
    }
    return totalCost;
  }

  // Method to sync treatment details with server-generated IDs after patient save
  syncTreatmentDetailsWithServer(updatedPatient: Patient): void {
    if (updatedPatient && updatedPatient.PatientTreatment && updatedPatient.PatientTreatment.PatientTreatmentDetails) {
      // Update the treatment details with server-generated IDs
      this.treatment = updatedPatient.PatientTreatment;
      this.patient = updatedPatient;
      this.isNewPatient = (this.patient?.ID === 0);
      // ensure data service is updated with server-saved patient
      this.cdr.markForCheck();
    }
  }

  // Method to save patient and handle redirect for new patients
  SavePatientAndRedirect(): void {
    if (!this.patient) {
      alert('No patient data to save');
      return;
    }
    if (this.isNewPatient) {
      this.patientService.createPatient(this.patient).subscribe({
        next: (savedPatient: Patient) => {
          this.messageService.success('New patient created successfully');
          if (this.user) {
            const updatedUser = JSON.parse(JSON.stringify(this.user));
            if (!updatedUser.Patients) updatedUser.Patients = [];
            if (updatedUser.Patients.length > 0) {
              updatedUser.Patients[0] = savedPatient;
            } else {
              updatedUser.Patients.push(savedPatient);
            }
            this.dataService.setUser(updatedUser);
          }
          this.router.navigate(['/patient', savedPatient.ID, 'treatment']);
        },
        error: (error) => {
          console.error('Error creating patient:', error);
          this.messageService.error('Failed to create patient');
        }
      });
    } else {
      this.patientService.updatePatient(this.patient.ID, this.patient).subscribe({
        next: (savedPatient: Patient) => {
          this.messageService.success('Patient information saved successfully');
          if (this.user) {
            const updatedUser = JSON.parse(JSON.stringify(this.user));
            if (!updatedUser.Patients) updatedUser.Patients = [];
            if (updatedUser.Patients.length > 0) {
              updatedUser.Patients[0] = savedPatient;
            } else {
              updatedUser.Patients.push(savedPatient);
            }
            this.dataService.setUser(updatedUser);
          }
        },
        error: (error) => {
          console.error('Error updating patient:', error);
          this.messageService.error('Failed to update patient');
        }
      });
    }
    this.cdr.markForCheck();
  }

  protected applyUserData(user: User): void {
    if (!user) { this.router.navigate(['/dashboard']); return; }
    if (!user.Patients?.length) { this.router.navigate(['/patient/search']); return; }

    this.patient = user.Patients[0] as Patient;
    this.isNewPatient = (this.patient?.ID === 0);
    if (this.patient && this.patient.PatientTreatment) {
      this.treatment = this.patient.PatientTreatment;
    } else {
      this.treatment = new PatientTreatment();
      if (this.patient) this.patient.PatientTreatment = this.treatment;
    }
    this.cdr.markForCheck();
  }

  printPrescription(treatmentDetailId?: number) {
    if (!this.treatment || !this.treatment.ID || !this.patient) {
      alert('Please save the treatment record before printing the prescription.');
      return;
    }

    try {
      const config = this.dataService.getConfig();
      this.printService.printPrescription(this.patient, this.treatment, config, treatmentDetailId);
      this.messageService.success('Prescription print view loaded.');
    } catch (err) {
      console.error('Error printing prescription:', err);
      this.messageService.error('Failed to generate prescription print view.');
    }
  }
}
