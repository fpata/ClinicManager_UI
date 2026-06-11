import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (!authService.isLoggedIn) {
    authService.redirectToLogin();
    return false;
  }

  const access = authService.getAllowedAccess();
  if (access) {
    const path = state?.url || '';
    if (path.startsWith('/dashboard') && !access.canAccessDashboard) {
      router.navigate([authService.getDefaultRouteForRole(authService.getUserRole())]);
      return false;
    }
    if (path.startsWith('/billing') && !access.canAccessBilling) {
      router.navigate([authService.getDefaultRouteForRole(authService.getUserRole())]);
      return false;
    }
    if (path.startsWith('/appconfig') && !access.canAccessConfig) {
      router.navigate([authService.getDefaultRouteForRole(authService.getUserRole())]);
      return false;
    }
    if (path.startsWith('/scheduler') && !access.canAccessConfig) {
      router.navigate([authService.getDefaultRouteForRole(authService.getUserRole())]);
      return false;
    }
    if (path.startsWith('/doctorAppointments') && !access.canAccessConfig) {
      router.navigate([authService.getDefaultRouteForRole(authService.getUserRole())]);
      return false;
    }
    if (path.startsWith('/user-') && !access.canAccessConfig) {
      router.navigate([authService.getDefaultRouteForRole(authService.getUserRole())]);
      return false;
    }
    if (path.startsWith('/patient') && !access.canAccessPatient) {
      router.navigate([authService.getDefaultRouteForRole(authService.getUserRole())]);
      return false;
    }
  }

  const expectedRoles = route.data?.['expectedRoles'] as Array<string>;
  if (expectedRoles && expectedRoles.length > 0) {
    const userRole = authService.getUserRole();
    const hasRole = expectedRoles.some(role => {
      if (!userRole) return false;
      const r = role.toLowerCase();
      const ur = userRole.toString().toLowerCase();
      if (r === 'admin' || r === 'administrator') {
        return ur === 'admin' || ur === 'administrator' || ur === '5';
      }
      if (r === 'doctor') return ur === 'doctor' || ur === '2';
      if (r === 'nurse') return ur === 'nurse' || ur === '3';
      if (r === 'patient') return ur === 'patient' || ur === '1';
      if (r === 'accountant') return ur === 'accountant';
      return ur === r;
    });

    if (!hasRole) {
      router.navigate([authService.getDefaultRouteForRole(userRole)]);
      return false;
    }
  }

  return true;
};
