import { Component, Input } from '@angular/core';
import { Food } from '../../models/food.model'; 
import { CartService } from '../../services/cart.service';
import { environment } from '../../../environments/environment'; 

@Component({
  selector: 'app-food-card',
  standalone: false,
  templateUrl: './food-card.component.html',
  styleUrls: ['./food-card.component.css']
})
export class FoodCardComponent {

  environment = environment;

  // use food modle
  @Input() item!: Food;

  constructor(public cart: CartService) {}

  // get quantity from cart
  get quantity(): number {
    // security checking
    if (this.item.id === undefined) return 0;
    
    const entry = this.cart.getItems().find(e => e.food.id === this.item.id);
    return entry ? entry.quantity : 0;
  }

  // add cart
  add(): void {
    this.cart.addItem(this.item, 1);
  }

  // add item
  increase(): void {
    this.cart.addItem(this.item, 1);
  }

  // deduct item
  decrease(): void {
    if (this.item.id === undefined) return;

    const entry = this.cart.getItems().find(e => e.food.id === this.item.id);

    if (!entry) return;

    if (entry.quantity > 1) {
      this.cart.addItem(this.item, -1);
    } else {
      this.cart.removeItem(this.item.id);
    }
  }
}
