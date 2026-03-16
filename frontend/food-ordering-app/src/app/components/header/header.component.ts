import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { map, Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  // Input to show notification dot for admins
  @Input() showDot: boolean = false;
  // Output event to notify parent when admin clicks orders
  @Output() markAsRead = new EventEmitter<void>(); 

  isLoggedIn$: Observable<boolean>;
  cartCount$: Observable<number>;
  currentUser$: Observable<any>;

  showLocationModal = false;
  orderMode: 'delivery' | 'pickup' = 'delivery';
  tempAddress: string = 'Select Address'; // Initial placeholder
  shopAddress: string = 'Somewhere in Edmonton';

  constructor(
    private cart: CartService,
    public auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef // Inject ChangeDetectorRef for safety
  ) {
    this.isLoggedIn$ = this.auth.isLoggedIn$;
    this.currentUser$ = this.auth.currentUser$;

    // Calculate total quantity of items in the cart
    this.cartCount$ = this.cart.items$.pipe(
      map(items => items.reduce((s, e) => s + e.quantity, 0))
    );
  }

  ngOnInit(): void {
    // Subscribe to user data to sync address
    this.auth.currentUser$.subscribe(user => {
      if (user && user.address) {
        /**
         * FIX for NG0100:
         * We wrap the assignment in setTimeout to push the change 
         * to the next microtask. This prevents the "Expression Changed 
         * After It Has Been Checked" error during initialization.
         */
        setTimeout(() => {
          this.tempAddress = user.address;
          this.cdr.detectChanges(); // Manually trigger refresh
        });
      }
    });
  }

  /**
   * Navigate to orders page and emit event to clear admin notification dot
   */
  navigateToOrders() {
    this.markAsRead.emit(); 
    this.router.navigate(['/orders']);
  }

  /**
   * Open or close the location selection modal
   */
  toggleModal() {
    this.showLocationModal = !this.showLocationModal;
  }

  /**
   * Switch between Delivery and Pickup modes
   */
  setOrderMode(mode: 'delivery' | 'pickup') {
    this.orderMode = mode;
  }

  /**
   * Close modal after user confirms location
   */
  confirmLocation() {
    this.showLocationModal = false;
  }

  /**
   * Log out the current user and redirect to login page
   */
  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  /**
   * Retrieve user role from local storage
   */
  get role(): string | null {
    return localStorage.getItem('role');
  }
}