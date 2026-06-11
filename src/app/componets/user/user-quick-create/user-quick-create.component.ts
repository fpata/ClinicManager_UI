import { ChangeDetectionStrategy, Component, ChangeDetectorRef, NgZone, ViewChild } from '@angular/core';
import { User, UserType } from '../../../models/user.model';
import { Address } from '../../../models/address.model';
import { Contact } from '../../../models/contact.model';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { MessageService } from '../../../services/message.service';
import { DataService } from '../../../services/data.service';

@Component({
  selector: 'app-user-quick-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-quick-create.component.html',
  styleUrls: ['./user-quick-create.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserQuickCreateComponent {

  @ViewChild('quickForm') quickForm!: NgForm;
  user: User | null = null;
  formSubmitted = false;

  constructor(private dataService: DataService, private messageService: MessageService, private userService: UserService,
    private cdRef: ChangeDetectorRef, private ngZone: NgZone
  ) {
    this.InitializeNewUser();
  }

  ngAfterViewInit() {
    // Reset form after view initialization to clear any validation marks
    if (this.quickForm) {
      this.quickForm.resetForm();
    }
    this.formSubmitted = false;
    this.cdRef.detectChanges();
  }

  onUserTypeChange($event: any) {
    if (this.user) {
      this.user.UserType = Number($event);
    }
  }

  ClearUserInformation() {
    this.dataService.setUser(null);
    this.InitializeNewUser();
    this.formSubmitted = false;
    if (this.quickForm) {
      this.quickForm.resetForm();
    }
    this.cdRef.detectChanges();
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
          this.ClearUserInformation();
          this.cdRef.detectChanges();
        },
        error: (error) => {
          this.messageService.error('Error deleting user: ' + error.message);
          this.cdRef.detectChanges();
        }
      });
    });
    this.InitializeNewUser();
  }

  SaveUserInformation() {
    this.formSubmitted = true;

    // Validate form before saving
    if (!this.quickForm || !this.quickForm.valid) {
      this.messageService.warn('Please fill out all required fields correctly');
      this.cdRef.detectChanges();
      return;
    }

    if (!this.user?.ID || this.user.ID === 0) {
      // Create new user (POST)
      this.userService.createUser(this.user!).subscribe({
        next: (newUser) => {
          this.ngZone.run(() => {
            this.messageService.success('User created successfully');
            this.dataService.setUser(newUser);
            this.formSubmitted = false;
            this.cdRef.detectChanges();
          });
        },
        error: (error) => {
          this.ngZone.run(() => {
            this.messageService.error('Error creating user: ' + error.message);
            this.formSubmitted = false;
            this.cdRef.detectChanges();
          });
        }
      });
    } else {
      // Update existing user (PUT)
      this.userService.updateUser(this.user!.ID, this.user!).subscribe({
        next: (updatedUser) => {
          this.ngZone.run(() => {
            this.messageService.success('User updated successfully');
            this.dataService.setUser(updatedUser);
            this.formSubmitted = false;
            this.cdRef.detectChanges();
          });
        },
        error: (error) => {
          this.ngZone.run(() => {
            this.messageService.error('Error updating user: ' + error.message);
            this.formSubmitted = false;
            this.cdRef.detectChanges();
          });
        }
      });
    }
  }

  InitializeNewUser() {
    this.user = new User();
    this.user.Address = new Address();
    this.user.Contact = new Contact();
    this.user.ID = 0;
    this.user.Address.ID = 0;
    this.user.Contact.ID = 0;
    this.formSubmitted = false;
  }
}
