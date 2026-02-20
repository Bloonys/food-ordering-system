import { Component } from '@angular/core';

@Component({
  selector: 'app-nav',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  categories = [
    'Offer',
    'Meals',
    'Pizzas',
    'Chicken',
    'Sides',
    'Desserts',
    'Drinks'
  ];
}
