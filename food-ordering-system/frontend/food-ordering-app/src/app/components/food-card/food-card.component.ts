import { Component, Input } from '@angular/core';
import type { FoodItem } from '../../models/food-item.interface';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-food-card',
  standalone: false,
  templateUrl: './food-card.component.html',
  styleUrls: ['./food-card.component.css']
})
export class FoodCardComponent {
  @Input() item!: FoodItem;

  constructor(private cart: CartService) {}

  toggleSelected() {
    if (!this.item) return;
    this.item.selected = !this.item.selected;
    if (this.item.selected) {
      this.cart.addItem(this.item, 1);
    }
  }

  addToCart() {
    if (!this.item) return;
    this.cart.addItem(this.item, 1);
  }
}
