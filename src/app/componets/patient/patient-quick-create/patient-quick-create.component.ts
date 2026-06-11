import { Component, OnInit,ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '../../../models/user.model';
import { Patient } from '../../../models/patient.model';
import { PatientTreatment } from '../../../models/patient-treatment.model';
import { Address } from '../../../models/address.model';
import { DataService } from '../../../services/data.service';
import { PatientService } from '../../../services/patient.service';
import { UserService } from '../../../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-patient-quick-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patient-quick-create.component.html',
  styleUrls: ['./patient-quick-create.component.css'],
  providers: [],
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class PatientQuickCreateComponent implements OnInit {
  patient: Patient = new Patient();

  constructor(
    private dataService: DataService,
    private patientService: PatientService,
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initializeModels();
  }

  initializeModels(): void {
    this.patient = new Patient();
    this.patient.UserID = this.dataService.getUser()?.ID || 0;
    this.patient.PatientTreatment = new PatientTreatment();
    this.patient.PatientTreatment.UserID = this.dataService.getUser()?.ID || 0;
  }



  private validatePatient(): boolean {
    if (!this.patient.Allergies?.trim()) {
      alert('Please enter allergies information');
      return false;
    }

    if (!this.patient.PatientTreatment?.ChiefComplaint?.trim()) {
      alert('Please enter chief complaint');
      return false;
    }

    if (!this.patient.PatientTreatment?.TreatmentPlan?.trim()) {
      alert('Please enter treatment plan');
      return false;
    }

    return true;
  }


}
