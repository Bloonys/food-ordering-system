import { Component } from '@angular/core';
import { CartService, CartEntry } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { take } from 'rxjs/operators';
import { environment } from '../../../enviroments/enviroment';

@Component({
  selector: 'app-cart',
  standalone: false,
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent {

  environment = environment;

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

  // ✅ 编辑数量
  edit(entry: CartEntry) {
    const input = prompt('Enter new quantity', entry.quantity.toString());

    if (input === null) return;

    const qty = parseInt(input, 10);

    if (isNaN(qty)) {
      alert('Invalid number');
      return;
    }

    if (qty <= 0) {
      this.cart.removeItem(entry.food.id);
    } else {
      this.cart.removeItem(entry.food.id);
      this.cart.addItem(entry.food, qty);
    }
  }
}