import { Component } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-cart',
  standalone: false,
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent {

  constructor(
    public cart: CartService,
    private orderService: OrderService
  ) {}

  checkout() {
    this.cart.items$.pipe(take(1)).subscribe(items => {
      if (!items || items.length === 0) {
        alert('Cart is empty');
        return;
      }

      this.orderService.createOrder(items).subscribe({
        next: () => {
          alert('Order success!');
          this.cart.clear();
        },
        error: (err) => {
          console.error(err);
          alert('Checkout failed');
        }
      });
    });
  }
}