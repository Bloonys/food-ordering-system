import { Component } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-cart',
  standalone: false,
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent {

  constructor(
    public cart: CartService,
    private http: HttpClient
  ) {}

  checkout() {
    this.cart.items$.subscribe(items => {
      if (!items || items.length === 0) {
        alert('Cart is empty');
        return;
      }

      const body = {
        userId: 1, // 后面改成登录用户ID
        totalPrice: this.cart.getTotal(),
        items: items.map(entry => ({
          foodId: entry.food.id,
          qty: entry.quantity,
          price: entry.food.price,
        })),
      };

      this.http.post('/api/orders/checkout', body)
        .subscribe({
          next: () => {
            alert('Checkout success!');
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