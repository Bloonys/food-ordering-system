import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  user: any;

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.getProfile().subscribe({
      next: (res: any) => {
        this.user = res.user;
      },
      error: (err: any) => {
        console.error(err);
      }
    });
  }

  logout() {
    // 清 token & role
    localStorage.removeItem('token');
    localStorage.removeItem('role');

    // 清购物车
    this.cartService.clear();

    // 通知 AuthService（header 更新）
    this.authService.logout();

    // 跳登录页
    this.router.navigate(['/login']);
  }
}