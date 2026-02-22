import { Component, OnInit } from '@angular/core';
import { FoodService } from '../../services/food.service';
import { Food } from '../../models/food.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-food-list',
  standalone: false,
  templateUrl: './food-list.component.html'
})
export class FoodListComponent implements OnInit {

  foods: Food[] = [];

  constructor(
    private foodService: FoodService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadFoods();
  }

  loadFoods() {
    this.foodService.getFoods().subscribe(res => {
      this.foods = res;
    });
  }

  edit(id?: number) {
    this.router.navigate(['/foods/edit', id]);
  }

  delete(id?: number) {
    if (!confirm('Are you sure?')) return;

    this.foodService.deleteFood(id!).subscribe(() => {
      this.loadFoods();
    });
  }
}