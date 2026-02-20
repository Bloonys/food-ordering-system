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
  // master list of items (with categories)
  allItems: FoodItem[] = [
    { id: '1', name: 'Margherita', description: 'Classic cheese & tomato', price: 9.99, image: '/assets/pizza1.jpg', category: 'Pizzas' },
    { id: '2', name: 'Pepperoni', description: 'Spicy pepperoni & cheese', price: 11.99, image: '/assets/pizza2.jpg', category: 'Pizzas' },
    { id: '3', name: 'BBQ Chicken', description: 'Grilled chicken with BBQ sauce', price: 12.5, image: '/assets/pizza3.jpg', category: 'Chicken' },
    { id: '4', name: 'Veggie Delight', description: 'Mixed veggies & herbs', price: 10.5, image: '/assets/pizza4.jpg', category: 'Meals' },
    { id: '5', name: 'Fries', description: 'Crispy golden fries', price: 3.99, image: '/assets/pizza4.jpg', category: 'Sides' },
    { id: '6', name: 'Chocolate Cake', description: 'Decadent chocolate slice', price: 4.5, image: '/assets/pizza3.jpg', category: 'Desserts' },
    { id: '7', name: 'Coke', description: 'Chilled soft drink', price: 1.99, image: '/assets/pizza2.jpg', category: 'Drinks' }
  ];

  items: FoodItem[] = [];

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    // react to route param changes and filter items by category when present
    this.route.paramMap.subscribe(pm => {
      const cat = pm.get('name');
      if (!cat) {
        this.items = this.allItems;
      } else {
        // simple case-insensitive match
        const name = cat.toLowerCase();
        this.items = this.allItems.filter(i => (i.category || '').toLowerCase() === name);
      }
    });
  }
}
