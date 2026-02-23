import { Component, Input } from '@angular/core';
import type { FoodItem } from '../../models/food-item.interface';
import { CartService } from '../../services/cart.service';
import { environment } from '../../../enviroments/enviroment';

@Component({
  selector: 'app-food-card',
  standalone: false,
  templateUrl: './food-card.component.html',
  styleUrls: ['./food-card.component.css']
})
export class FoodCardComponent {
  environment = environment;
  @Input() item!: FoodItem;

  constructor(private cart: CartService) {}

  toggleSelected() {
    if (!this.item) return;

    if (this.item.selected) {
      this.item.selected = false;
      this.cart.removeItem(this.item.id);
    } else {
      this.item.selected = true;
      this.cart.addItem(this.item, 1);
    }
  }

  addToCart() {
    if (!this.item) return;
    this.cart.addItem(this.item, 1);
  }
}
