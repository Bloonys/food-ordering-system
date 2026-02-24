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

  constructor(public cart: CartService) {}

  // ✅ 获取当前商品在购物车中的数量
  get quantity(): number {
    const entry = this.cart.getItems().find(e => e.food.id === this.item.id);
    return entry ? entry.quantity : 0;
  }

  // ✅ 第一次加入购物车
  add(): void {
    this.cart.addItem(this.item, 1);
  }

  // ✅ 增加数量
  increase(): void {
    this.cart.addItem(this.item, 1);
  }

  // ✅ 减少数量
  decrease(): void {
    const entry = this.cart.getItems().find(e => e.food.id === this.item.id);

    if (!entry) return;

    if (entry.quantity > 1) {
      this.cart.addItem(this.item, -1);
    } else {
      this.cart.removeItem(this.item.id);
    }
  }
}
