import type { Food } from './food.model';

export interface CartItem {
  food: Food;
  quantity: number;
}