import { Component, Input } from '@angular/core';
import { Food } from '../../models/food.model'; 
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

  // 使用统一的 Food 模型
  @Input() item!: Food;

  constructor(public cart: CartService) {}

  // 获取当前商品在购物车中的数量
  get quantity(): number {
    // 增加安全检查：如果 id 不存在则返回 0
    if (this.item.id === undefined) return 0;
    
    const entry = this.cart.getItems().find(e => e.food.id === this.item.id);
    return entry ? entry.quantity : 0;
  }

  // 第一次加入购物车
  add(): void {
    this.cart.addItem(this.item, 1);
  }

  // 增加数量
  increase(): void {
    this.cart.addItem(this.item, 1);
  }

  // 减少数量
  decrease(): void {
    if (this.item.id === undefined) return;

    const entry = this.cart.getItems().find(e => e.food.id === this.item.id);

    if (!entry) return;

    if (entry.quantity > 1) {
      this.cart.addItem(this.item, -1);
    } else {
      // 这里的 id 经过上面的 if 检查，已经是 number 类型，解决了 TS2345 报错
      this.cart.removeItem(this.item.id);
    }
  }
}
