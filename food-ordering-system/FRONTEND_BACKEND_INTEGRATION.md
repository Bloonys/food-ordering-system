# Frontend-Backend Integration Guide

## Overview

This guide shows how to integrate the Angular frontend with the Node.js backend authentication system.

---

## Step 1: Update Angular Service

Create or update `src/app/services/auth.service.ts`:

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
  expiresIn?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/auth'; // Backend URL
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
    // Restore user from localStorage on service init
    this.restoreUser();
  }

  /**
   * Register new user
   */
  register(
    username: string,
    email: string,
    password: string,
    confirmPassword: string
  ): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, {
      username,
      email,
      password,
      confirmPassword
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Login user
   */
  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, {
      email,
      password
    }).pipe(
      tap(response => {
        if (response.success && response.token) {
          // Store token in localStorage
          localStorage.setItem('token', response.token);
          // Store expiration time
          const expiresAt = new Date().getTime() + (response.expiresIn || 7200) * 1000;
          localStorage.setItem('expiresAt', expiresAt.toString());
          // Update user subject
          this.userSubject.next(response.user || null);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get user profile (protected route)
   */
  getProfile(): Observable<AuthResponse> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No token found'));
    }

    return this.http.get<AuthResponse>(`${this.apiUrl}/profile`).pipe(
      tap(response => {
        if (response.success && response.user) {
          this.userSubject.next(response.user);
          localStorage.setItem('user', JSON.stringify(response.user));
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Logout user
   */
  logout(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('expiresAt');
        localStorage.removeItem('user');
        this.userSubject.next(null);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get stored token
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(): boolean {
    const expiresAt = localStorage.getItem('expiresAt');
    if (!expiresAt) return true;
    return new Date().getTime() > parseInt(expiresAt);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken() && !this.isTokenExpired();
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.userSubject.value;
  }

  /**
   * Restore user from localStorage
   */
  private restoreUser(): void {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        this.userSubject.next(JSON.parse(user));
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
        localStorage.removeItem('user');
      }
    }
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage = error.error?.message || `Error: ${error.status}`;
    }

    console.error('Auth Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
```

---

## Step 2: Create HTTP Interceptor

Create `src/app/services/auth.interceptor.ts`:

```typescript
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  /**
   * Automatically add JWT token to all HTTP requests
   */
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.authService.getToken();

    // Add token to Authorization header if it exists
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Handle 401 Unauthorized (token expired or invalid)
        if (error.status === 401) {
          // Clear stored token and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('expiresAt');
          localStorage.removeItem('user');
          this.router.navigate(['/login']);
        }

        return throwError(() => error);
      })
    );
  }
}
```

---

## Step 3: Create Auth Guard

Create `src/app/guards/auth.guard.ts`:

```typescript
import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (this.authService.isAuthenticated()) {
      return true;
    }

    // Not logged in, redirect to login page
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}
```

---

## Step 4: Update App Module

Update `src/app/app.module.ts`:

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { AuthInterceptor } from './services/auth.interceptor';
import { AuthService } from './services/auth.service';

@NgModule({
  declarations: [
    AppComponent,
    // ... other components
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    // ... other imports
  ],
  providers: [
    AuthService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

---

## Step 5: Update Login Component

Update `src/app/pages/login/login.component.ts`:

```typescript
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, AuthResponse } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Redirect if already logged in
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
    }
  }

  /**
   * Handle login form submission
   */
  onLogin(): void {
    // Validation
    if (!this.email || !this.password) {
      this.errorMessage = 'Email and password are required';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.login(this.email, this.password).subscribe({
      next: (response: AuthResponse) => {
        if (response.success) {
          this.successMessage = 'Login successful! Redirecting...';
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 1500);
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Login failed. Please try again.';
        this.isLoading = false;
      }
    });
  }

  /**
   * Navigate to register page
   */
  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}
```

---

## Step 6: Create Register Component

Create `src/app/pages/register/register.component.ts`:

```typescript
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, AuthResponse } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  username: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Redirect if already logged in
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
    }
  }

  /**
   * Handle registration form submission
   */
  onRegister(): void {
    // Validation
    if (!this.username || !this.email || !this.password || !this.confirmPassword) {
      this.errorMessage = 'All fields are required';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    if (this.password.length < 8) {
      this.errorMessage = 'Password must be at least 8 characters';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.register(this.username, this.email, this.password, this.confirmPassword)
      .subscribe({
        next: (response: AuthResponse) => {
          if (response.success) {
            this.successMessage = 'Registration successful! Redirecting to login...';
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 1500);
          }
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = error.message || 'Registration failed. Please try again.';
          this.isLoading = false;
        }
      });
  }

  /**
   * Navigate to login page
   */
  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
```

---

## Step 7: Update Routes

Update `src/app/app.routes.ts`:

```typescript
import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'category/:name',
    component: HomeComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];
```

---

## Step 8: Update Header Component

Update `src/app/components/header/header.component.ts`:

```typescript
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  isAuthenticated: boolean = false;
  cartCount$: Observable<number>;
  username: string | null = null;

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private router: Router
  ) {
    this.cartCount$ = this.cartService.items$.pipe(
      map(items => items.reduce((s, e) => s + e.qty, 0))
    );
  }

  ngOnInit(): void {
    // Subscribe to authentication state
    this.authService.user$.subscribe(user => {
      this.isAuthenticated = !!user;
      this.username = user?.username || null;
    });

    // Check if already authenticated
    if (this.authService.isAuthenticated()) {
      const user = this.authService.getCurrentUser();
      if (user) {
        this.isAuthenticated = true;
        this.username = user.username;
      }
    }
  }

  /**
   * Handle logout
   */
  onLogout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        // Even if logout fails, clear local storage
        localStorage.removeItem('token');
        localStorage.removeItem('expiresAt');
        localStorage.removeItem('user');
        this.router.navigate(['/login']);
      }
    });
  }

  /**
   * Navigate to login
   */
  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
```

---

## Step 9: Update Header Template

Update `src/app/components/header/header.component.html`:

```html
<header class="app-header">
  <!-- Top name bar -->
  <div class="brand-bar">
    <div class="container-fluid px-3 py-2 d-flex align-items-center justify-content-center">
      <a class="brand-link" routerLink="/">
        <i class="bi bi-pizza brand-icon-small"></i>
        <span class="brand-name">Somehowpizza</span>
      </a>
    </div>
  </div>

  <!-- Main header row -->
  <div class="main-header">
    <div class="container-fluid px-3 py-2 d-flex align-items-center justify-content-between">
      <!-- Left: Login/User -->
      <div class="header-action">
        <ng-container *ngIf="isAuthenticated; else notLoggedIn">
          <div class="d-flex align-items-center gap-2">
            <span class="text-white me-2">{{ username }}</span>
            <a class="btn-icon-text" (click)="onLogout()" style="cursor: pointer;" aria-label="Logout">
              <i class="bi bi-box-arrow-right"></i>
              <span class="action-label d-none d-sm-inline">Logout</span>
            </a>
          </div>
        </ng-container>
        <ng-template #notLoggedIn>
          <a class="btn-icon-text" routerLink="/login" aria-label="Login">
            <i class="bi bi-person-fill"></i>
            <span class="action-label d-none d-sm-inline">Login</span>
          </a>
        </ng-template>
      </div>

      <!-- Right: Cart -->
      <div class="header-action">
        <a class="btn-icon-text cart-button" routerLink="#" aria-label="Cart">
          <i class="bi bi-cart-fill"></i>
          <span *ngIf="(cartCount$ | async) as c" class="cart-badge">{{ c }}</span>
          <span class="action-label d-none d-sm-inline ms-2">Cart</span>
        </a>
      </div>
    </div>
  </div>
</header>
```

---

## Step 10: Environment Configuration

Create `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000'
};
```

Create `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.yourdomain.com'  // Update with production URL
};
```

---

## API Integration Testing Checklist

- [ ] **Register**
  - [ ] Can create new user account
  - [ ] Validation errors display correctly
  - [ ] Duplicate email/username shows error
  - [ ] Redirects to login after success

- [ ] **Login**
  - [ ] Can login with valid credentials
  - [ ] Token is stored in localStorage
  - [ ] Invalid credentials show error
  - [ ] Redirects to home after success

- [ ] **Protected Routes**
  - [ ] Redirects to login if not authenticated
  - [ ] Allows access if authenticated
  - [ ] Redirects to login when token expires

- [ ] **Cart Integration**
  - [ ] Cart persists with authentication
  - [ ] Can add/remove items when logged in

- [ ] **Header**
  - [ ] Shows login button when not authenticated
  - [ ] Shows username and logout when authenticated
  - [ ] Logout clears token and redirects

---

## Troubleshooting

### CORS Error
```
Access to XMLHttpRequest at 'http://localhost:3000/...' from origin 
'http://localhost:4200' has been blocked by CORS policy
```
**Solution**: Ensure `.env` has `FRONTEND_URL=http://localhost:4200`

### Token Not Being Sent
**Solution**: Check that `AuthInterceptor` is registered in `AppModule` with `multi: true`

### Infinite Redirect Loop
**Solution**: Make sure login/register routes are NOT protected by `AuthGuard`

### localStorage Not Working
**Solution**: Check browser console for errors, ensure not in private/incognito mode

---

## Conclusion

The frontend is now fully integrated with the backend authentication system:
- ✅ User registration and login
- ✅ JWT token storage and management
- ✅ Automatic token injection into requests
- ✅ Protected routes with AuthGuard
- ✅ User context display in header
- ✅ Logout functionality

**Ready for production use!**
