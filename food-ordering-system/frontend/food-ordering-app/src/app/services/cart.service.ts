import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Food } from '../models/food.model'; // ✅ 引入统一的 Food 模型

export interface CartEntry {
  food: Food; // ✅ 统一使用 Food
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {

  private storageKey = 'cart';

  private itemsSubject = new BehaviorSubject<CartEntry[]>(this.loadFromStorage());
  items$ = this.itemsSubject.asObservable();

  constructor() {}

  // 获取当前
  getItems(): CartEntry[] {
    return this.itemsSubject.value;
  }

  // 添加 - 将 FoodItem 改为 Food
  addItem(food: Food, quantity = 1) {
    const items = [...this.itemsSubject.value];
    // 这里的 food.id 对应 Food 模型中的 id?: number
    const idx = items.findIndex(e => e.food.id === food.id);

    if (idx >= 0) {
      items[idx] = {
        ...items[idx],
        quantity: items[idx].quantity + quantity
      };
    } else {
      items.push({ food, quantity });
    }

    this.update(items);
  }

  // 删除
  removeItem(foodId: number | undefined) { // ✅ 支持可选 id，增加健壮性
    if (foodId === undefined) return;
    const items = this.itemsSubject.value.filter(e => e.food.id !== foodId);
    this.update(items);
  }

  // 清空
  clear() {
    this.update([]);
  }

  // 总数
  getCount(): number {
    return this.itemsSubject.value.reduce((sum, e) => sum + e.quantity, 0);
  }

  // 总价
  getTotal(): number {
    return this.itemsSubject.value.reduce(
      (sum, e) => sum + e.food.price * e.quantity,
      0
    );
  }

  // ====== 私有 ======

  private update(items: CartEntry[]) {
    this.itemsSubject.next(items);
    this.saveToStorage(items);
  }

  private saveToStorage(items: CartEntry[]) {
    localStorage.setItem(this.storageKey, JSON.stringify(items));
  }

  private loadFromStorage(): CartEntry[] {
    const data = localStorage.getItem(this.storageKey);
    try {
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Cart data corrupted", e);
      return [];
    }
  }
}
