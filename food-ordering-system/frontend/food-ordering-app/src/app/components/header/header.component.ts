import { Component, OnInit } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { map, Observable, take } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  isLoggedIn$: Observable<boolean>;
  cartCount$: Observable<number>;
  currentUser$: Observable<any>;

  // 控制小窗口显示
  showLocationModal = false;
  // 配送模式：delivery 或 pickup
  orderMode: 'delivery' | 'pickup' = 'delivery';
  // 弹窗中显示的临时地址（从用户资料获取）
  tempAddress: string = '';
  // 你的店铺固定地址
  shopAddress: string = '123 Pizza Avenue, Italian Quarter';

  constructor(
    private cart: CartService,
    public auth: AuthService
  ) {
    this.isLoggedIn$ = this.auth.isLoggedIn$;
    this.currentUser$ = this.auth.currentUser$;

    this.cartCount$ = this.cart.items$.pipe(
      map(items => items.reduce((s, e) => s + e.quantity, 0))
    );
  }

  ngOnInit(): void {
    // 初始订阅一次地址，用于弹窗默认值
    this.auth.currentUser$.subscribe(user => {
      if (user && user.address) {
        this.tempAddress = user.address;
      }
    });
  }

  toggleModal() {
    this.showLocationModal = !this.showLocationModal;
  }

  setOrderMode(mode: 'delivery' | 'pickup') {
    this.orderMode = mode;
  }

  confirmLocation() {
    // 如果是外送且地址发生了变化，可以同步更新后端（可选）
    if (this.orderMode === 'delivery' && this.tempAddress) {
      // 这里的逻辑可以根据你的需求调整，是否保存到数据库
      console.log('Confirming delivery to:', this.tempAddress);
    }
    this.showLocationModal = false;
  }

  logout() {
    this.auth.logout();
  }

  get role(): string | null {
    return localStorage.getItem('role');
  }
}