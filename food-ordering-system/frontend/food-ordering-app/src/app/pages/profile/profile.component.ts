import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { Router } from '@angular/router';
import { take } from 'rxjs/operators';

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
    private router: Router,
    private cdr: ChangeDetectorRef // 注入变更检测
  ) {}

  ngOnInit(): void {
    // 1. 首先尝试从 AuthService 订阅用户信息
    this.authService.currentUser$.subscribe(userData => {
      if (userData) {
        this.user = userData;
        this.cdr.detectChanges(); // 强制刷新视图
      } else {
        // 2. 如果当前没有用户信息（例如刷新页面），手动触发一次加载
        this.loadProfileFromServer();
      }
    });
  }

  loadProfileFromServer() {
    this.authService.getProfile().subscribe({
      next: (res: any) => {
        this.user = res.user;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Failed to load profile:', err);
        // 如果 401 或报错，可能 token 过期，跳回登录
        this.router.navigate(['/login']);
      }
    });
  }

  logout() {
    // 执行清理逻辑
    this.cartService.clear();
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}