import { Component } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { map } from 'rxjs';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {

  // 登录状态（响应式）
  isLoggedIn$: Observable<boolean>;

  // 购物车数量（响应式）
  cartCount$: Observable<number>;

  constructor(
    private cart: CartService,
    public auth: AuthService
  ) {

    // 登录状态直接用 service 里的 observable
    this.isLoggedIn$ = this.auth.isLoggedIn$;

    // 购物车数量
    this.cartCount$ = this.cart.items$.pipe(
      map(items => items.reduce((s, e) => s + e.quantity, 0))
    );
  }

  logout() {
    this.auth.logout();
  }

  get role(): string | null {
    return localStorage.getItem('role');
  }
}