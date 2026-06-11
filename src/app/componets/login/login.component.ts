import { ChangeDetectionStrategy, Component, ChangeDetectorRef } from '@angular/core';
import { RouterModule,Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoginService, LoginResponse } from '../../services/login.service';
import { DataService } from '../../services/data.service';
import { AppConfigService } from '../../services/config.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [FormsModule, CommonModule, RouterModule],
  standalone: true,
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';

  constructor(
    private loginService: LoginService,
    private router: Router,
    private dataService: DataService,
    private authService:AuthService,
    private configService: AppConfigService,
    private cdRef: ChangeDetectorRef
  ) {}

  login(): void {
    if(!this.username || !this.password) {
      this.error = 'Username and password are required';
      this.cdRef.detectChanges();
      return;
    }
    if(this.username.length < 3 || this.password.length < 3) {
      this.error = 'Username and password must be at least 3 characters long';
      this.cdRef.detectChanges();
      return;
    }
    this.loginService.login(this.username, this.password).subscribe({
      next: (res: LoginResponse) => {
        // loginService.login() already handles role-based navigation internally.
        // Here we only load app config and update the shared login user state.
        this.configService.getConfigs().subscribe(config => {
          this.dataService.setConfig(config);
          this.dataService.setLoginUser(res.user as any);
        });
        this.error = '';
        this.cdRef.detectChanges();
      },
      error: (err) => {
        this.handleLoginError(err);
      }
    });
  }

  private handleLoginError(err: any): void {
    switch (err.status) {
      case 401:
        this.error = 'Invalid username or password';
        break;
      case 0:
        this.error = 'Network error. Please try again later.';
        break;
      case 500:
        this.error = 'Server error. Please try again later.';
        break;
      case 403:
        this.error = 'Access denied. You do not have permission to access this resource.';
        break;
      default:
        this.error = 'An unexpected error occurred. Please try again.';
    }
    console.error('Login error:', err);
    this.cdRef.detectChanges();
  }
}
