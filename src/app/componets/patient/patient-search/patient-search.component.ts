import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SearchModel, SearchResultModel } from '../../../models/search.model';
import { SearchService } from '../../../services/search.service';
import { PatientService } from '../../../services/patient.service';
import { DataService } from '../../../services/data.service';
import { Patient } from '../../../models/patient.model';
import { User, UserType } from '../../../models/user.model';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../../../services/user.service';
import { Router } from '@angular/router';
import { UtilityService } from '../../../services/utility.service';
import { MessageService } from '../../../services/message.service';
import { PagingComponent } from "../../../common/paging/paging.component";

@Component({
  selector: 'app-patient-search',
  standalone: true,
  imports: [CommonModule, FormsModule, PagingComponent],
  templateUrl: './patient-search.component.html',
  styleUrls: ['./patient-search.component.css'],
  providers: [HttpClient],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatientSearchComponent {

  currentPage: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  searchPatient: SearchModel;
  searchResult: SearchResultModel;
  searchLengthConstraintError: boolean = false;
  clearSearchClicked: boolean = false;

  constructor(private searchService: SearchService, private patientService: PatientService,
    private dataService: DataService, private userService: UserService, private router: Router, private util: UtilityService
    , private messageService: MessageService, private cdRef: ChangeDetectorRef
  ) {
    this.searchPatient = new SearchModel(this.util);
    this.searchPatient.EndDate = this.util.formatDate(new Date(), 'yyyy-MM-dd');
    this.searchPatient.StartDate = this.util.formatDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
    this.searchResult = new SearchResultModel();
  }

  ngOnInit() {
    this.clearSearchClicked = false;
    this.pageSize = this.dataService.getConfig()?.pageSize || 10;
  }

  validateSearchInput() {
    if (this.searchPatient != null && this.searchPatient != undefined
      && (this.searchPatient.FirstName === undefined || this.searchPatient.FirstName?.length < 3)
      && (this.searchPatient.LastName === undefined || this.searchPatient.LastName?.length < 3)
      && (this.searchPatient.PrimaryEmail === undefined || this.searchPatient.PrimaryEmail?.length < 3)
      && (this.searchPatient.PrimaryPhone === undefined || this.searchPatient.PrimaryPhone?.length < 3)) {
      this.searchLengthConstraintError = true;
      this.clearSearchClicked = false;
    } else {
      this.searchLengthConstraintError = false;
      this.clearSearchClicked = true;
    }
    this.cdRef.detectChanges();
  }

  SearchPatient() {
    this.validateSearchInput();
    if (this.searchLengthConstraintError) {
      return;
    }
    this.dataService.setQuickCreateMode(false);
    this.dataService.setUserId(0);
    this.searchPatient.UserType = UserType.Patient; // Set UserType to Admin for searching all patients
    this.searchService.SearchPatient(this.searchPatient).subscribe({
      next: (result: SearchResultModel) => {
        this.searchResult = result;
        this.totalItems = result.TotalCount || 0;
        this.clearSearchClicked = false;
        this.cdRef.detectChanges();
      },
      error: (err: any) => {
        // Optionally handle error
        alert('Error occurred while searching for patients.');
        console.error(err);
        this.searchResult = new SearchResultModel();
        this.clearSearchClicked = false;
        this.cdRef.detectChanges();
      }
    });
  }

  clearSearch() {
    this.searchLengthConstraintError = false;
    this.searchPatient.FirstName = '';
    this.searchPatient.LastName = '';
    this.searchPatient.PatientID = 0;
    this.searchPatient.PermCity = '';
    this.searchPatient.PrimaryEmail = '';
    this.searchPatient.PrimaryPhone = '';
    this.searchPatient.UserID = 0;
    this.searchPatient.UserName = '';
    this.searchPatient.UserType = 0;
    this.searchResult = new SearchResultModel();
    this.clearSearchClicked = true;
    this.dataService.setQuickCreateMode(false);
    this.dataService.setUserId(0);
    this.cdRef.detectChanges();
  }

  /*OnPatientIdClick(patientId: number, userId: number) {
    if (patientId === 0 || patientId === undefined || patientId === null) {
      // New patient flow
      this.userService.getUser(userId).subscribe({
        next: (user: User) => {
          this.dataService.setUser(user);
          this.dataService.setUserId(user.ID);

          // Navigate with patientId = 0
          this.router.navigate(['/patient', 0, 'treatment']);
        },
        error: (err: Error) => {
          console.error('Error fetching user data:', err);
          this.messageService.error('Error fetching user data. Please try again.');
          this.cdRef.detectChanges();
        }
      });
    }
  }*/

  AddNewUser() {
    this.router.navigate(['/user', 'new']);
  }


  DeletePatient(result: SearchModel) {
    const msg = `Are you sure you want to delete patient: ${result.FirstName} ${result.LastName}?`;
    const confirmFn = (window as any).showConfirm || ((m: string) => Promise.resolve(confirm(m)));
    confirmFn(msg).then((confirmed: boolean) => {
      if (!confirmed) return;
      if (result.PatientID === 0 || result.PatientID == null || result.PatientID == undefined) {
        this.messageService.error('There is no OPD or Procedures for User.\nNo Patient Information available to delete.');
        return;
      }
      this.patientService.deletePatient(result.PatientID).subscribe({
        next: () => {
          this.messageService.success('Patient deleted successfully');
          // Clear the patient from data service
          this.cdRef.detectChanges();
        },
        error: (error) => {
          console.error('Error deleting patient:', error);
          this.messageService.error('Error occurred while deleting patient. Please try again.');
          this.cdRef.detectChanges();
        }
      });
    });
  }



  UpdatePatient(result: SearchModel) {
    if (result.PatientID && result.PatientID > 0) {
      this.patientService.getCompletePatient(result.UserID).subscribe({
        next: (newUser: User) => {
          // Handle the patient data as needed
          this.dataService.setUser(newUser);
          this.dataService.setUserId(newUser.ID);
          if (newUser.Patients === undefined || newUser.Patients === null || newUser.Patients.length === 0) {
            this.messageService.error('No patient data found for the selected user.');
            return;
          }
          let index = newUser?.Patients?.length === 0 ? 0 : newUser?.Patients.length - 1;
          const patient = newUser?.Patients[index] || null;
          // Navigate with patient ID in URL
          this.router.navigate(['/patient', result.PatientID, 'treatment']);
        },
        error: (err) => {
          console.error('Error fetching patient data:', err);
          this.messageService.error('Error fetching patient data. Please try again.');
        }
      });
    } else {
      this.messageService.error('Patient ID not available. Please click on add patient info link to add patient information.');
    }
  }

  AddNewPatient(result: SearchModel, isQuickCreateMode: boolean) {
    const userId = result?.UserID || 0;
    this.dataService.setQuickCreateMode(isQuickCreateMode);
    this.dataService.setUserId(userId);

    // Fetch full user details first and navigate after initialization
    this.userService.getUser(userId).subscribe({
      next: (user: User) => {
        if (user) {
          this.dataService.setUser(user);
          try {
            this.patientService.AddNewPatient(user);
            this.router.navigate(['/patient', 0, 'treatment']);
          } catch (e) {
            console.error('Error adding new patient:', e);
          }
          this.cdRef.detectChanges();
        }
      },
      error: (err: Error) => {
        console.error('Error fetching user data:', err);
      }
    });
  }

  onPageChanged($event: number) {
    this.currentPage = $event;
    this.searchPatient.pageNumber = this.currentPage;
    this.SearchPatient();
    this.cdRef.detectChanges();
  }
}

