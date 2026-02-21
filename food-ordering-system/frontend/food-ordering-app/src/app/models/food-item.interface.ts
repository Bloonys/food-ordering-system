export interface FoodItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category?: string;
  selected?: boolean;
  rating?: number;
}
