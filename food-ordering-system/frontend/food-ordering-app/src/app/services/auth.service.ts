import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { CartService } from './cart.service';
import { environment } from '../../enviroments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // 这里的 apiUrl 可以直接写成 '/api/auth'，因为 proxy.conf.json 已经配置了转发
  private apiUrl = `${environment.apiUrl}/auth`;

  private loggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$ = this.loggedInSubject.asObservable();

  private currentUserSubject = new BehaviorSubject<any>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private cartService: CartService 
  ) {
    if (this.hasToken()) {
      // 初始化时获取用户信息
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
    // 这里的请求会自动变成 http://localhost:4200/api/auth/login
    // 然后被 proxy.conf.json 转发到 http://localhost:3001/api/auth/login
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(res => {
          if (res?.token) {
            localStorage.setItem('token', res.token);
            // 建议存储角色前做空值校验
            const role = res.user?.role || 'customer';
            localStorage.setItem('role', role);
            
            this.loggedInSubject.next(true);
            this.currentUserSubject.next(res.user); 
          }
        })
      );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    this.loggedInSubject.next(false);
    this.currentUserSubject.next(null);
    
    // 清空购物车
    this.cartService.clear(); 
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  getProfile(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/profile`).pipe(
      tap(res => {
        if (res?.user) {
          this.currentUserSubject.next(res.user);
        }
      })
    );
  }

  updateProfile(data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/profile`, data).pipe(
      tap(res => {
        if (res?.user) {
          this.currentUserSubject.next(res.user);
        }
      })
    );
  }

  setCurrentUser(user: any) {
    this.currentUserSubject.next(user);
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }
}