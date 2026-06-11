import { Component , ChangeDetectionStrategy,ChangeDetectorRef} from '@angular/core';
import { UtilityService } from '../../../services/utility.service';
import { SearchModel, SearchResultModel} from '../../../models/search.model';
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel binding 
import { SearchService } from '../../../services/search.service';
import { DataService } from '../../../services/data.service';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user.model';
import { Address } from '../../../models/address.model';
import { Contact } from '../../../models/contact.model';
import { MessageService } from '../../../services/message.service';
import { Router } from '@angular/router';
import { PagingComponent } from '../../../common/paging/paging.component';   

@Component({
  selector: 'app-user-search',
  standalone: true,
  imports: [FormsModule, PagingComponent],
  templateUrl: './user-search.component.html',
  styleUrls: ['./user-search.component.css'],
  providers: [SearchService, UserService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserSearch {

 currentPage: number = 1;
  pageSize: number = 5;
   totalItems: number = 0;
  searchPatient: SearchModel;
  searchResult: SearchResultModel;
  searchLengthConstraintError: boolean = false;
  clearSearchClicked: boolean = false;

  constructor(private searchService: SearchService, private dataService: DataService, private userService: UserService,
    private util: UtilityService, private messageService: MessageService, private router: Router, private cdRef: ChangeDetectorRef ) {
    this.searchPatient = new SearchModel(this.util);
    this.searchPatient.EndDate = this.util.formatDate(new Date((Date.now() + 180 * 24 * 60 * 60 * 1000)), 'yyyy-MM-dd'); // Default to 180 days from now
    this.searchPatient.StartDate = this.util.formatDate(new Date((Date.now() - 365 * 24 * 60 * 60 * 1000)), 'yyyy-MM-dd'); // 365 days ago
    this.searchResult = new SearchResultModel();
  }


validateSearchInput() {
    if (this.searchPatient != null && this.searchPatient != undefined && this.searchPatient.FirstName?.length < 3 && this.searchPatient.LastName?.length < 3 &&
      this.searchPatient.PrimaryEmail?.length < 3 && this.searchPatient.PermCity?.length < 3 &&
      this.searchPatient.PrimaryPhone?.length < 3) {
      this.searchLengthConstraintError = true;
      this.clearSearchClicked = false;
    } else {
      this.searchLengthConstraintError = false;
      this.clearSearchClicked = true;
    }
    this.cdRef.detectChanges();
  }

  SearchUser() {
    if (this.searchLengthConstraintError) {
      return;
    }
    this.searchPatient.StartDate = '2022-01-01';
    // Ensure paging parameters are sent with the search so initial load respects pageSize
    this.searchPatient.pageNumber = this.currentPage;
    this.searchPatient.pageSize = this.pageSize;
    this.searchService.SearchUser(this.searchPatient).subscribe({
      next: (result:any) => {
        this.searchResult = result;
        this.clearSearchClicked = false;
        this.totalItems = this.searchResult.TotalCount || 0;
        this.cdRef.detectChanges();
      },
      error: (err:any) => {
        // Optionally handle error
        this.messageService.error('Error occurred while searching for users.');
        console.error(err);
        this.searchResult.Results = [];
        this.clearSearchClicked = false;
        this.cdRef.detectChanges();
      }
    });
  }

  clearSearch() {
    this.searchLengthConstraintError = false;
    this.searchPatient = new SearchModel(this.util);
    this.searchResult = new SearchResultModel();
    this.clearSearchClicked = true;
    this.cdRef.detectChanges();
  }

  

  OnUserIdClick(userId: number) {
    this.userService.getUser(userId).subscribe({
      next: (user: User) => {
        if(user.Address == null || user.Address == undefined) {
          user.Address = new Address();
        }
        if(user.Contact == null || user.Contact == undefined) {
          user.Contact = new Contact();
        }
        this.dataService.setUser(user);
        this.router.navigate(['/user-create']);

      },
      error: (err: any) => {
       this.messageService.error('Error fetching user data:', err);
       this.cdRef.detectChanges();
      }
    });
    this.router.navigate(['/user-info', userId]);
  }

  EditUser(userId: number) {
    this.OnUserIdClick(userId);
  }

  DeleteUser(userId: number, userName: string) {
    const msg = `Are you sure you want to delete user: ${userName}?`;
    const confirmFn = (window as any).showConfirm || ((m: string) => Promise.resolve(confirm(m)));
    confirmFn(msg).then((confirmed: boolean) => {
      if (!confirmed) return;
      this.userService.deleteUser(userId).subscribe({
        next: () => {
          this.messageService.success('User deleted successfully');
          this.SearchUser();
          this.cdRef.detectChanges();
        },
        error: (err: any) => {
          this.messageService.error('Error occurred while deleting user');
          console.error(err);
          this.cdRef.detectChanges();
        }
      });
    });
  }

    QuickCreateUser() {
 
    this.dataService.setUser(null);
    var user: User = new User();
    user.Address = new Address();
    user.Contact = new Contact();
    this.dataService.setUser(user);
   this.router.navigate(['/user-quick-create']);
   
  }

  AddNewUser() {
    this.dataService.setUser(null);
    var user: User = new User();
    user.Address = new Address();
    user.Contact = new Contact();
    this.dataService.setUser(user);
   this.router.navigate(['/user-create']);
  }

    ClearUserInformation() {
    this.dataService.setUser(null);
    this.cdRef.detectChanges();
  }

  onPageChange($event: number) {
    this.currentPage = $event;
    this.searchPatient.pageNumber = this.currentPage;
    this.searchPatient.pageSize = this.pageSize;
    this.SearchUser();
    // Implement logic to fetch data for the new page if necessary
  }

  
   ngOnInit(): void {
      this.pageSize = this.dataService.getConfig()?.pageSize || 5;
   }
}
/*
private mapToUserModel(response: any): User {
    const user = new User();
    
    // Map basic properties
    user.ID = response.ID;
    user.FirstName = response.FirstName;
    user.MiddleName = response.MiddleName;
    user.LastName = response.LastName;
    user.UserName = response.UserName;
    user.Password = response.Password;
    user.UserType = response.UserType;
    user.Gender = response.Gender;
    user.DOB = response.DOB;
    user.Age = response.Age;
    user.LastLoginDate = response.LastLoginDate;
    user.CreatedDate = response.CreatedDate;
    user.ModifiedDate = response.ModifiedDate;
    user.CreatedBy = response.CreatedBy;
    user.ModifiedBy = response.ModifiedBy;
    user.IsActive = response.IsActive;
    user.Patients = response.Patients;
    
    // Map Address if present
    if (response.Address) {
      const address = new Address();
      Object.assign(address, response.Address);
      user.Address = address;
    }
    
    // Map Contact if present
    if (response.Contact) {
      const contact = new Contact();
      Object.assign(contact, response.Contact);
      user.Contact = contact;
    }
    
    return user;
  }*/