import { Component, OnInit, Input } from '@angular/core'; // Added Input
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router'; // Added Router for navigation
import { map, Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  // Received from App Component via [showDot]="hasUnreadOrders()"
  @Input() showDot: boolean = false;

  isLoggedIn$: Observable<boolean>;
  cartCount$: Observable<number>;
  currentUser$: Observable<any>;

  showLocationModal = false;
  orderMode: 'delivery' | 'pickup' = 'delivery';
  tempAddress: string = '';
  shopAddress: string = 'Somewhere in Edmonton';

  constructor(
    private cart: CartService,
    public auth: AuthService,
    private router: Router // Injected Router
  ) {
    this.isLoggedIn$ = this.auth.isLoggedIn$;
    this.currentUser$ = this.auth.currentUser$;

    this.cartCount$ = this.cart.items$.pipe(
      map(items => items.reduce((s, e) => s + e.quantity, 0))
    );
  }

  ngOnInit(): void {
    this.auth.currentUser$.subscribe(user => {
      if (user && user.address) {
        this.tempAddress = user.address;
      }
    });
  }

  // Navigation specifically for orders (can be used to clear state if needed)
  navigateToOrders() {
    this.router.navigate(['/orders']);
  }

  toggleModal() {
    this.showLocationModal = !this.showLocationModal;
  }

  setOrderMode(mode: 'delivery' | 'pickup') {
    this.orderMode = mode;
  }

  confirmLocation() {
    if (this.orderMode === 'delivery' && this.tempAddress) {
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