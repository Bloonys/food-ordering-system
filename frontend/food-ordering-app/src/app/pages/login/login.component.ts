import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  @ViewChild('loginForm') loginForm!: NgForm;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    if (this.loginForm.invalid) return;

    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: (res: any) => {

        // 根据角色跳转
        if (res.user.role === 'admin') {
          this.router.navigate(['/admin/foods']);
        } else {
          this.router.navigate(['/profile']);
        }

      },
      error: (err) => {
        console.error(err);
        alert(err.error?.message || 'Login failed');
      }
    });
  }
}