import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { DataService } from '../services/data.service';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class PatientIdGuard implements CanActivate {
  
  constructor(
    private router: Router,
    private dataService: DataService,
    private authService: AuthService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const userRole = this.authService.getUserRole();
    const isPatient = userRole && (userRole.toString().toLowerCase() === 'patient' || userRole.toString() === '1');
    
    if (isPatient) {
      const patientIdParam = Number(route.paramMap.get('patientId'));
      const loggedInPatientId = this.authService.getLoggedInPatientId();
      
      if (loggedInPatientId !== null && patientIdParam !== loggedInPatientId) {
        this.router.navigate(['/patient', loggedInPatientId, 'treatment']);
        return false;
      }
    }
    return true;
  }
}
