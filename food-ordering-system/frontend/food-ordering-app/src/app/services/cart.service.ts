import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import type { FoodItem } from '../models/food-item.interface';

export interface CartEntry {
  item: FoodItem;
  qty: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private itemsSubject = new BehaviorSubject<CartEntry[]>([]);
  items$ = this.itemsSubject.asObservable();

  getItems(): CartEntry[] {
    return this.itemsSubject.value;
  }

  addItem(item: FoodItem, qty = 1) {
    const items = [...this.itemsSubject.value];
    const idx = items.findIndex(e => e.item.id === item.id);
    if (idx >= 0) {
      items[idx] = { ...items[idx], qty: items[idx].qty + qty };
    } else {
      items.push({ item, qty });
    }
    this.itemsSubject.next(items);
  }

  removeItem(itemId: string) {
    const items = this.itemsSubject.value.filter(e => e.item.id !== itemId);
    this.itemsSubject.next(items);
  }

  clear() {
    this.itemsSubject.next([]);
  }

  getCount(): number {
    return this.itemsSubject.value.reduce((s, e) => s + e.qty, 0);
  }
}
