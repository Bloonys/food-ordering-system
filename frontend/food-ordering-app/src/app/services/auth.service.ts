import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { CartService } from './cart.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Base API URL (proxied via proxy.conf.json)
  private apiUrl = `${environment.apiUrl}/auth`;

  // Track authentication state reactively
  private loggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$ = this.loggedInSubject.asObservable();

  // Store current user state
  private currentUserSubject = new BehaviorSubject<any>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private cartService: CartService 
  ) {
    // On app initialization, restore user session if token exists
    if (this.hasToken()) {
      this.getProfile().subscribe({
        next: (res: any) => {
          if (res?.user) {
            this.currentUserSubject.next(res.user);
          }
        },
        error: () => this.logout()
      });
    }
  }

  login(email: string, password: string): Observable<any> {
    // Request is proxied:
    // /api/auth/login → http://localhost:3001/api/auth/login
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(res => {
          if (res?.token) {
            // Persist token for authenticated requests
            localStorage.setItem('token', res.token);

            // Store user role (fallback to 'customer' if missing)
            const role = res.user?.role || 'customer';
            localStorage.setItem('role', role);
            
            // Update reactive auth state
            this.loggedInSubject.next(true);
            this.currentUserSubject.next(res.user); 
          }
        })
      );
  }

  logout() {
    // Clear authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('role');

    // Reset auth state
    this.loggedInSubject.next(false);
    this.currentUserSubject.next(null);
    
    // Clear cart on logout to prevent data leakage between sessions
    this.cartService.clear(); 
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  getProfile(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/profile`).pipe(
      tap(res => {
        if (res?.user) {
          // Sync user state with backend response
          this.currentUserSubject.next(res.user);
        }
      })
    );
  }

  updateProfile(data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/profile`, data).pipe(
      tap(res => {
        if (res?.user) {
          // Update local user state after profile update
          this.currentUserSubject.next(res.user);
        }
      })
    );
  }

  setCurrentUser(user: any) {
    // Manually update current user state
    this.currentUserSubject.next(user);
  }

  private hasToken(): boolean {
    // Check if auth token exists in storage
    return !!localStorage.getItem('token');
  }
}