import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:3000/auth';

  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$ = this.loggedIn.asObservable();

  constructor(private http: HttpClient) {}

  login(email: string, password: string) {
    return this.http.post<any>(`${this.apiUrl}/login`, {
      email,
      password
    });
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    this.loggedIn.next(false);
  }

  setLoggedIn(status: boolean) {
    this.loggedIn.next(status);
  }

  getProfile() {
    return this.http.get(`${this.apiUrl}/profile`);
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }
}