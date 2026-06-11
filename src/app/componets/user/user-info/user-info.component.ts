import { ChangeDetectionStrategy, Component, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User, UserType } from '../../../models/user.model';
import { Address } from '../../../models/address.model';
import { Contact } from '../../../models/contact.model';
import { DataService } from '../../../services/data.service';
import { Subscription } from 'rxjs';
import { FormsModule, NgForm } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { MessageService } from '../../../services/message.service';


@Component({
  selector: 'app-user-info',
  imports: [FormsModule, CommonModule],
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserInfoComponent {

  @ViewChild('userForm') userForm!: NgForm;
  @ViewChild('userForm', { read: ElementRef }) userFormElement!: ElementRef<HTMLFormElement>;

  user: User | null = null;
  formSubmitted = false;

  private userSubscription: Subscription;

  get isPatientRole(): boolean {
    const loginUser = this.dataService.getLoginUser();
    const userType = loginUser?.user?.UserType as any;
    return userType === UserType.Patient || userType === 'Patient' || userType === 1 || userType === '1';
  }

  constructor(private dataService: DataService, private messageService: MessageService, private userService: UserService,
    private cdRef: ChangeDetectorRef
  ) {
    // Don't initialize with new objects - wait for actual data
    this.user = null;
  }

  ngOnInit() {
    this.userSubscription = this.dataService.user$.subscribe({
      next: (updatedUser: User | null | undefined) => {
        if (!updatedUser) {
          this.InitializeNewUser();
        } else {
          // Simply assign the updated user without overriding nested objects
          this.user = updatedUser;
        }
        this.formSubmitted = false;
        this.cdRef.detectChanges();
      },
      error: (err: Error) => {
        console.error('Error occurred while updating user data:', err);
        this.cdRef.detectChanges();
      },
      complete: () => {
        console.log('User subscription completed');
      }
    });
  }

  ngOnDestroy() {
    // Clean up subscription to prevent memory leaks
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  CopyAddress() {
    if (this.user && this.user.Address) {
      this.user.Address.CorrAddress1 = this.user.Address.PermAddress1;
      this.user.Address.CorrAddress2 = this.user.Address.PermAddress2;
      this.user.Address.CorrCity = this.user.Address.PermCity;
      this.user.Address.CorrState = this.user.Address.PermState;
      this.user.Address.CorrCountry = this.user.Address.PermCountry;
      this.user.Address.CorrZipCode = this.user.Address.PermZipCode;
      this.cdRef.detectChanges();
    }
  }

  onUserTypeChange($event: any) {
    if (this.user) {
      this.user.UserType = $event ? Number($event) : undefined;
    }
  }

  ClearUserInformation() {
    this.dataService.setUser(null);
    this.InitializeNewUser();
    this.formSubmitted = false;
    if (this.userForm) {
      this.userForm.resetForm();
    }
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
          this.cdRef.detectChanges();
        },
        error: (error) => {
          this.messageService.error('Error deleting user: ' + error.message);
        }
      });
    });
  }

  SaveUserInformation() {
    this.formSubmitted = true;

    if (!this.userForm || !this.userForm.valid) {
      this.messageService.warn('Please fill out all required fields correctly');
      this.cdRef.detectChanges();
      // After view updates, open accordion containing first invalid field and focus it
      setTimeout(() => this.focusFirstInvalidField(), 0);
      return;
    }

    if (!this.user.ID || this.user.ID === 0) {
      // Create new user (POST)
      this.userService.createUser(this.user).subscribe({
        next: (newUser) => {
          this.messageService.success('User created successfully');
          this.dataService.setUser(newUser); // Update with the new user data including ID
          this.formSubmitted = false;
          this.cdRef.detectChanges();
        },
        error: (error) => {
          this.messageService.error('Error creating user: ' + error.message);
          this.cdRef.detectChanges();
        }
      });
    } else {
      // Update existing user (PUT)
      this.userService.updateUser(this.user.ID, this.user).subscribe({
        next: (updatedUser) => {
          this.messageService.success('User updated successfully');
          this.dataService.setUser(updatedUser); // Update with the latest user data
          this.formSubmitted = false;
          this.cdRef.detectChanges();
        },
        error: (error) => {
          this.messageService.error('Error updating user: ' + error.message);
          this.cdRef.detectChanges();
        }
      });
    }
  }

  InitializeNewUser() {
    this.user = new User();
    this.user.Address = new Address();
    this.user.Contact = new Contact();
    this.user.ID = 0; // Indicate new user
    this.user.Address.ID = 0;
    this.user.Contact.ID = 0;
    this.cdRef.detectChanges();
  }

  private focusFirstInvalidField() {
    try {
      const formEl: HTMLElement | undefined = this.userFormElement?.nativeElement;
      if (!formEl) return;

      // Find the first invalid control inside the form
      const invalidEl = formEl.querySelector('.ng-invalid') as HTMLElement | null;
      if (!invalidEl) return;

      // If it's inside a collapsed accordion, open that accordion pane
      const collapse = invalidEl.closest('.accordion-collapse') as HTMLElement | null;
      if (collapse) {
        // Find the toggle button that targets this collapse
        const toggle = formEl.querySelector(`[data-bs-target="#${collapse.id}"]`) as HTMLElement | null;
        if (toggle && !collapse.classList.contains('show')) {
          // Trigger the button to let Bootstrap handle opening animation and aria states
          toggle.click();
        }
      }

      // Focus the most relevant input inside the nearest form-group
      const formGroup = (invalidEl.closest('.form-group') as HTMLElement) || invalidEl;
      const focusable = formGroup.querySelector('input:not([type=hidden]), select, textarea, button, [tabindex]') as HTMLElement | null;
      if (focusable && typeof focusable.focus === 'function') {
        focusable.focus();
        focusable.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        if (typeof (invalidEl as any).focus === 'function') {
          (invalidEl as any).focus();
        }
        invalidEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } catch (err) {
      console.error('Error while focusing first invalid field', err);
    }
  }
}
