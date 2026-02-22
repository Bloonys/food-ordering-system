export interface FoodItem {
  id: number;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category?: string;
  selected?: boolean;
  rating?: number;
}
