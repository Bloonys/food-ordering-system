import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import type { FoodItem } from '../models/food-item.interface';

// 1. 统一接口定义，确保与 HTML 模板中的 item.food 和 item.quantity 一致
export interface CartEntry {
  food: FoodItem;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  // 使用 BehaviorSubject 管理购物车状态
  private itemsSubject = new BehaviorSubject<CartEntry[]>([]);
  
  // 暴露为 Observable 供组件使用 async 管道订阅
  items$ = this.itemsSubject.asObservable();

  constructor() {}

  // 获取当前购物车快照
  getItems(): CartEntry[] {
    return this.itemsSubject.value;
  }

  // 添加商品
  addItem(food: FoodItem, quantity = 1) {
    const items = [...this.itemsSubject.value];
    const idx = items.findIndex(e => e.food.id === food.id);
    
    if (idx >= 0) {
      // 如果已存在，增加数量
      items[idx] = { 
        ...items[idx], 
        quantity: items[idx].quantity + quantity 
      };
    } else {
      // 如果不存在，添加新条目
      items.push({ food, quantity });
    }
    this.itemsSubject.next(items);
  }

  // 移除商品（通过 food.id）
  removeItem(foodId: number) {
    const items = this.itemsSubject.value.filter(e => e.food.id !== foodId);
    this.itemsSubject.next(items);
  }

  // 清空购物车
  clear() {
    this.itemsSubject.next([]);
  }

  // 获取商品总总数 (如：购物车图标上的数字)
  getCount(): number {
    return this.itemsSubject.value.reduce((total, entry) => total + entry.quantity, 0);
  }

  // 计算总价 (修复 HTML 中 cart.getTotal() 的报错)
  getTotal(): number {
    return this.itemsSubject.value.reduce((total, entry) => {
      return total + (entry.food.price * entry.quantity);
    }, 0);
  }
}
