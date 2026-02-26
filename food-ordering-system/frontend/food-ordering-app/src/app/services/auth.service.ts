import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/auth';

  // 1. 登录状态流
  private loggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$ = this.loggedInSubject.asObservable();

  // 2. 当前用户信息流 (初始为 null)
  private currentUserSubject = new BehaviorSubject<any>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // 如果页面刷新时已有 Token，尝试自动获取一次用户信息
    if (this.hasToken()) {
      this.getProfile().subscribe({
        next: (res: any) => this.currentUserSubject.next(res.user),
        error: () => this.logout() // Token 失效则自动登出
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
            
            // 更新状态
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
    this.currentUserSubject.next(null); // 清空用户信息
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  // 获取用户信息的 API 请求
  getProfile() {
    return this.http.get<any>(`${this.apiUrl}/profile`).pipe(
      tap(res => this.currentUserSubject.next(res.user))
    );
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }
}