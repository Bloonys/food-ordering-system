import { Component } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  readonly cartCount$;

  constructor(
    private cart: CartService,
    public auth: AuthService
  ) {
    this.cartCount$ = this.cart.items$.pipe(
      map(items => items.reduce((s, e) => s + e.quantity, 0))
    );
  }

  logout() {
    this.auth.logout();
  }
}
