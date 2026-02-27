import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { CartService } from './cart.service'; // 确保路径正确

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/auth';

  private loggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$ = this.loggedInSubject.asObservable();

  private currentUserSubject = new BehaviorSubject<any>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private cartService: CartService // 1. 注入 CartService
  ) {
    if (this.hasToken()) {
      this.getProfile().subscribe({
        next: (res: any) => this.currentUserSubject.next(res.user),
        error: () => this.logout()
      });
    }
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(res => {
          if (res?.token) {
            localStorage.setItem('token', res.token);
            localStorage.setItem('role', res.user.role);
            this.loggedInSubject.next(true);
            this.currentUserSubject.next(res.user); 
          }
        })
      );
  }

  // 2. 统一清理逻辑：在这里处理所有登出相关的清理
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    this.loggedInSubject.next(false);
    this.currentUserSubject.next(null);
    
    // ✅ 关键：在这里清空购物车，这样管理员登出也会生效
    this.cartService.clear(); 
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  getProfile() {
    return this.http.get<any>(`${this.apiUrl}/profile`).pipe(
      tap(res => this.currentUserSubject.next(res.user))
    );
  }
  updateProfile(data: any) {
    return this.http.put<any>(`${this.apiUrl}/profile`, data).pipe(
      tap(res => this.currentUserSubject.next(res.user))
    );
  }

  setCurrentUser(user: any) {
    this.currentUserSubject.next(user);
  }
  

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }
}