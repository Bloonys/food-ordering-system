import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import type { FoodItem } from '../../models/food-item.interface';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  // master list of items (with categories and ratings)
  allItems: FoodItem[] = [
    { id: '1', name: 'Margherita', description: 'Classic cheese & tomato', price: 9.99, image: '/assets/pizza1.jpg', category: 'Pizzas', rating: 4.8 },
    { id: '2', name: 'Pepperoni', description: 'Spicy pepperoni & cheese', price: 11.99, image: '/assets/pizza2.jpg', category: 'Pizzas', rating: 4.9 },
    { id: '3', name: 'BBQ Chicken', description: 'Grilled chicken with BBQ sauce', price: 12.5, image: '/assets/pizza3.jpg', category: 'Chicken', rating: 4.7 },
    { id: '4', name: 'Veggie Delight', description: 'Mixed veggies & herbs', price: 10.5, image: '/assets/pizza4.jpg', category: 'Meals', rating: 4.6 },
    { id: '5', name: 'Fries', description: 'Crispy golden fries', price: 3.99, image: '/assets/pizza4.jpg', category: 'Sides', rating: 4.5 },
    { id: '6', name: 'Chocolate Cake', description: 'Decadent chocolate slice', price: 4.5, image: '/assets/pizza3.jpg', category: 'Desserts', rating: 4.8 },
    { id: '7', name: 'Coke', description: 'Chilled soft drink', price: 1.99, image: '/assets/pizza2.jpg', category: 'Drinks', rating: 4.4 },
    { id: '8', name: 'Supreme Pizza', description: 'All toppings included', price: 15.99, image: '/assets/pizza1.jpg', category: 'Pizzas', rating: 4.9 },
    { id: '9', name: 'Buffalo Wings', description: 'Spicy buffalo sauce wings', price: 7.99, image: '/assets/pizza2.jpg', category: 'Chicken', rating: 4.7 },
    { id: '10', name: 'Garlic Bread', description: 'Toasted with garlic butter', price: 2.99, image: '/assets/pizza4.jpg', category: 'Sides', rating: 4.6 },
    { id: '11', name: 'Tiramisu', description: 'Italian coffee dessert', price: 5.99, image: '/assets/pizza3.jpg', category: 'Desserts', rating: 4.8 },
    { id: '12', name: 'Iced Tea', description: 'Fresh lemon iced tea', price: 2.49, image: '/assets/pizza1.jpg', category: 'Drinks', rating: 4.5 },
  ];

  items: FoodItem[] = [];
  sortBy: string = 'default';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    // react to route param changes and filter items by category when present
    this.route.paramMap.subscribe(pm => {
      const cat = pm.get('name');
      if (!cat) {
        this.items = [...this.allItems];
      } else {
        // simple case-insensitive match
        const name = cat.toLowerCase();
        this.items = this.allItems.filter(i => (i.category || '').toLowerCase() === name);
      }
      this.applySorting();
    });
  }

  applySorting(): void {
    if (this.sortBy === 'price') {
      this.items = [...this.items].sort((a, b) => a.price - b.price);
    } else if (this.sortBy === 'rating') {
      this.items = [...this.items].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else {
      // default: maintain order
      this.items = [...this.allItems.filter(i => 
        !this.route.snapshot.paramMap.get('name') || 
        (i.category || '').toLowerCase() === (this.route.snapshot.paramMap.get('name') || '').toLowerCase()
      )];
    }
  }
}

