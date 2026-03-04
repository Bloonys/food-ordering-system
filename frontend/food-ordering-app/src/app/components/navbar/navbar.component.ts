import { Component } from '@angular/core';

@Component({
  selector: 'app-nav',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  showSidebar = false;

  categories = [
    'Offer',
    'Meals',
    'Pizzas',
    'Chicken',
    'Sides',
    'Desserts',
    'Drinks'
  ];

  getCategoryIcon(category: string): string {
    const iconMap: { [key: string]: string } = {
      'Offer': 'bi-tag',
      'Meals': 'bi-cup-hot',
      'Pizzas': 'bi-cookie',
      'Chicken': 'bi-egg',
      'Sides': 'bi-fire',
      'Desserts': 'bi-cake',
      'Drinks': 'bi-cup'
    };
    return iconMap[category] || 'bi-star';
  }

  toggleSidebar(): void {
    this.showSidebar = !this.showSidebar;
  }

  closeSidebar(): void {
    this.showSidebar = false;
  }
}
