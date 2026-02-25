import { Component, OnInit, OnDestroy } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { map, Subscription } from 'rxjs';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {

  cartCount$!: Observable<number>;
  isLoggedIn = false;
  role: string | null = null;

  private authSub!: Subscription;

  constructor(
    private cart: CartService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {

    // cart count
    this.cartCount$ = this.cart.items$.pipe(
      map(items => items.reduce((s, e) => s + e.quantity, 0))
    );

    // listen auth changes
    this.authSub = this.auth.isLoggedIn$.subscribe(() => {
      this.updateAuthState();
    });

    // init state
    this.updateAuthState();
  }

  updateAuthState() {
    this.isLoggedIn = !!localStorage.getItem('token');
    this.role = localStorage.getItem('role');
  }

  logout() {
    this.auth.logout();
    this.updateAuthState();
  }

  ngOnDestroy(): void {
    this.authSub?.unsubscribe();
  }
}