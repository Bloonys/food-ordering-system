import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Food } from '../models/food.model'; 

export interface CartEntry {
  food: Food; // use the food model
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {

  private storageKey = 'cart';

  private itemsSubject = new BehaviorSubject<CartEntry[]>(this.loadFromStorage());
  items$ = this.itemsSubject.asObservable();

  constructor() {}

  // get
  getItems(): CartEntry[] {
    return this.itemsSubject.value;
  }

  // Update
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

  // delete
  removeItem(foodId: number | undefined) { // choose number
    if (foodId === undefined) return;
    const items = this.itemsSubject.value.filter(e => e.food.id !== foodId);
    this.update(items);
  }

  // clear
  clear() {
    this.update([]);
  }

  // get all
  getCount(): number {
    return this.itemsSubject.value.reduce((sum, e) => sum + e.quantity, 0);
  }

  // get total price
  getTotal(): number {
    return this.itemsSubject.value.reduce(
      (sum, e) => sum + e.food.price * e.quantity,
      0
    );
  }

  // ====== private methods ======

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
