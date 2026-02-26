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

    // 1. 基础检查：如果没有 Token，直接踢回登录页
    if (!token) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    // 2. 权限检查：检查路由配置中是否要求特定角色
    // 在 app-routing.module.ts 中可以配置 data: { role: 'admin' }
    const expectedRole = route.data['role'];
    
    if (expectedRole && role !== expectedRole) {
      // 如果角色不匹配（比如普通用户闯入管理页），跳回个人主页或报错页
      alert('Access Denied: Admins only');
      this.router.navigate(['/profile']);
      return false;
    }

    return true;
  }
}