import { Component,ChangeDetectionStrategy } from '@angular/core';
import { MessageService } from '../../../services/message.service';
import { FormsModule } from '@angular/forms';
import { UtilityService } from '../../../services/utility.service';

@Component({
  selector: 'app-forgotpassword.component',
  imports: [FormsModule],
  templateUrl: './forgotpassword.component.html',
  styleUrl: './forgotpassword.component.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ForgotPasswordComponent {
  constructor(private messageService: MessageService, private utilityService: UtilityService) { }
  email: string = '';
  mobile: string = '';
  error: string = '';
  ngOnInit() { }
  resetPassword() {
    if (this.email.trim() === '' && this.mobile.trim() === '') {
      this.error = 'Email and mobile fields both cannot be empty.';
      return;
    }
    if (this.email.trim() !== '' && !this.utilityService.validateEmail(this.email)) {
      this.error = 'Please enter a valid email address.';
      return;
    }
    if (this.mobile.trim() !== '' && !this.utilityService.validateMobile(this.mobile)) {
      this.error = 'Please enter a valid mobile number.';
      return;
    }
    if(this.email.trim() !== ''){
      this.messageService.sendMessage(this.email).subscribe({
        next: (response:string) => {
          // Handle successful response
          this.messageService.success(response.toString() || 'Password reset link sent to ' + this.email);
        },
        error: (error) => {
          // Handle error response
          this.messageService.error('Failed to send password reset link to ' + this.email);
        }
      });
    } else{
      this.messageService.sendMessage(this.mobile, true).subscribe({
        next: (response:string) => {
          // Handle successful response
          this.messageService.success(response.toString() || 'Password reset link sent to ' + this.mobile);
        },
        error: (error) => {
          // Handle error response
          this.messageService.error('Failed to send password reset link to ' + this.mobile);
        }
      });
    }
  }

}
