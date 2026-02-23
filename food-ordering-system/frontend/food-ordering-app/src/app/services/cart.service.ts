import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import type { FoodItem } from '../models/food-item.interface';

// 1. define CartEntry to represent an item in the cart (food + quantity)
export interface CartEntry {
  food: FoodItem;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  // manage cart items with BehaviorSubject to allow components to subscribe and react to changes
  private itemsSubject = new BehaviorSubject<CartEntry[]>([]);

  // expose as Observable for components to use async pipe
  items$ = this.itemsSubject.asObservable();

  constructor() {}

  // get current cart items
  getItems(): CartEntry[] {
    return this.itemsSubject.value;
  }

  // add item to cart
  addItem(food: FoodItem, quantity = 1) {
    const items = [...this.itemsSubject.value];
    const idx = items.findIndex(e => e.food.id === food.id);
    
    if (idx >= 0) {
      // if exist, update quantity
      items[idx] = { 
        ...items[idx], 
        quantity: items[idx].quantity + quantity 
      };
    } else {
      // if not exist, add new entry
      items.push({ food, quantity });
    }
    this.itemsSubject.next(items);
  }

  // remove item (by food.id)
  removeItem(foodId: number) {
    const items = this.itemsSubject.value.filter(e => e.food.id !== foodId);
    this.itemsSubject.next(items);
  }

  // clear cart
  clear() {
    this.itemsSubject.next([]);
  }

  // get total count of items in cart
  getCount(): number {
    return this.itemsSubject.value.reduce((total, entry) => total + entry.quantity, 0);
  }

  // get total price of items in cart
  getTotal(): number {
    return this.itemsSubject.value.reduce((total, entry) => {
      return total + (entry.food.price * entry.quantity);
    }, 0);
  }
}
