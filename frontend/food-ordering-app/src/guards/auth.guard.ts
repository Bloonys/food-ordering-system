import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../app/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    // 1. Basic authentication check: redirect to login if no token is found
    if (!token) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    // 2. Authorization check: validate required role from route config
    // Example: data: { role: 'admin' } in app-routing.module.ts
    const expectedRole = route.data['role'];
    
    if (expectedRole && role !== expectedRole) {
      // If role does not match (e.g., user accessing admin page), redirect to profile or error page
      alert('Access Denied: Admins only');
      this.router.navigate(['/profile']);
      return false;
    }

    return true;
  }
}