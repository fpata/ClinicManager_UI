import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { UserSearch } from "../user-search/user-search.component";
import { UserInfoComponent } from "../user-info/user-info.component";
import { UserQuickCreateComponent } from "../user-quick-create/user-quick-create.component";
import { DataService } from '../../../services/data.service';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user.model';
import { Address } from '../../../models/address.model';
import { Contact } from '../../../models/contact.model';
import { HttpClient } from '@angular/common/http';
import { MessageService } from '../../../services/message.service';

@Component({
  selector: 'app-user-master',
  standalone: true,
  imports: [UserSearch, UserInfoComponent, UserQuickCreateComponent],
  templateUrl: './user-master.component.html',
  styleUrls: ['./user-master.component.css'],
  providers: [HttpClient],
  changeDetection:ChangeDetectionStrategy.OnPush  
})
export class UserMasterComponent {


  isSearchTabSelected: boolean = true;
  selectedTab: string = 'tbUserSearch';
  @ViewChild(UserQuickCreateComponent) quickCreateComponent!: UserQuickCreateComponent;
  @ViewChild(UserInfoComponent) userInfoComponent!: UserInfoComponent;

  constructor(private dataService: DataService, private userService: UserService, private messageService: MessageService) { }


  ngAfterViewInit() {
    this.ShowHideNavs("navUserSearch");
  }
  tabSelectedEvent(event: MouseEvent) {
    // Logic to handle tab selection
    var targetId = (event.currentTarget as Element).id;
    if (targetId.startsWith('tbUserSearch')) {
      this.isSearchTabSelected = true;
    } else {
      this.isSearchTabSelected = false;
    }
    this.selectedTab = targetId;
  }

  ClearUserInformation() {
    this.dataService.setUser(null);
  }

  DeleteUserInformation() {
    const currentUser = this.dataService.getUser();

    if (!currentUser || !currentUser.ID) {
      this.messageService.warn('No user selected for deletion');
      return;
    }

    const msg = `Are you sure you want to delete user: ${currentUser.FirstName} ${currentUser.LastName}?`;
    const confirmFn = (window as any).showConfirm || ((m: string) => Promise.resolve(confirm(m)));
    confirmFn(msg).then((confirmed: boolean) => {
      if (!confirmed) return;
      this.userService.deleteUser(currentUser.ID).subscribe({
        next: () => {
          this.messageService.success('User deleted successfully');
          this.ClearUserInformation(); // Clear the user from data service
        },
        error: (error) => {
          this.messageService.error('Error deleting user: ' + error.message);
        }
      });
    });
  }

  AddNewUser() {
    this.ClearUserInformation();
    var user: User = new User();
    user.Address = new Address();
    user.Contact = new Contact();
    this.dataService.setUser(user);
    this.isSearchTabSelected = false;
    this.ShowHideNavs("navPersonalInfo");
    document.getElementById('tbPersonalInfo-tab')?.click();
  }

  SaveUserInformation() {
    var currentUser: User;
    if (this.selectedTab.startsWith('tbQuickCreate')) {
      currentUser = this.quickCreateComponent.user
    }
    else {
      // Validate form before saving
      if (!this.userInfoComponent.userForm || !this.userInfoComponent.userForm.valid) {
        this.messageService.warn('Please fill out all required fields correctly');
        return;
      }

      currentUser = this.dataService.getUser();
    }
    if (!currentUser) {
      this.messageService.warn('No user data to save');
      return;
    }

    if (!currentUser.ID || currentUser.ID === 0) {
      // Create new user (POST)
      this.userService.createUser(currentUser).subscribe({
        next: (newUser) => {
          this.messageService.success('User created successfully');
          this.dataService.setUser(newUser); // Update with the new user data including ID
        },
        error: (error) => {
          this.messageService.error('Error creating user: ' + error.message);
        }
      });
    } else {
      // Update existing user (PUT)
      this.userService.updateUser(currentUser.ID, currentUser).subscribe({
        next: (updatedUser) => {
          this.messageService.success('User updated successfully');
          this.dataService.setUser(updatedUser); // Update with the latest user data
        },
        error: (error) => {
          this.messageService.error('Error updating user: ' + error.message);
        }
      });
    }
  }

  QuickCreateUser() {
    // Navigate to the quick create tab
    this.isSearchTabSelected = false;
    // Switch to quick create tab
    setTimeout(() => {
      this.ShowHideNavs("navQuickCreate");
      const quickCreateTab = document.getElementById('tbQuickCreate-tab');
      if (quickCreateTab) {
        quickCreateTab.click();
      }
    }, 100);
  }

  mobileTabSelectedEvent($event: Event) {
    const target = $event.target as HTMLSelectElement;
    const targetValue = target.value;
    if (targetValue.startsWith('tbUserSearch')) {
      this.isSearchTabSelected = true;
    } else {
      this.isSearchTabSelected = false;
    }
    this.selectedTab = targetValue;
    document.getElementById(targetValue + "-tab")?.click();
  }


  ShowHideNavs(showTab: string = "") {
    switch (showTab) {
      case "navUserSearch": {
        document.getElementById("navUserSearch")?.classList.remove("d-none");
        document.getElementById("navPersonalInfo")?.classList.add("d-none");
        document.getElementById("navQuickCreate")?.classList.add("d-none");
        this.isSearchTabSelected = true;
        break;
      }
      case "navPersonalInfo": {
        document.getElementById("navPersonalInfo")?.classList.remove("d-none");
        document.getElementById("navUserSearch")?.classList.add("d-none");
        document.getElementById("navQuickCreate")?.classList.add("d-none");
        this.isSearchTabSelected = false;
        break;
      }
      case "navQuickCreate": {
        document.getElementById("navQuickCreate")?.classList.remove("d-none");
        document.getElementById("navUserSearch")?.classList.add("d-none");
        document.getElementById("navPersonalInfo")?.classList.add("d-none");
        this.isSearchTabSelected = false;
        break;
      }
      default: {
        // default code block
        break;
      }
    }

  }
}


