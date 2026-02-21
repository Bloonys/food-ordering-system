import { Component } from '@angular/core';
import { FoodService } from '../../services/food.service';
import { Food } from '../../models/food.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-food-create',
  standalone: false,

  templateUrl: './food-create.component.html'
})
export class FoodCreateComponent {

  food = {
    name: '',
    price: 0,
    category: ''
  };

  file: File | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private foodService: FoodService,
    private router: Router
  ) {}

  onFileSelected(event: any) {
    this.file = event.target.files[0];
  }

  submit() {
    this.loading = true;
    this.error = null;

    const formData = new FormData();
    formData.append('name', this.food.name);
    formData.append('price', this.food.price.toString());
    formData.append('category', this.food.category);

    if (this.file) {
      formData.append('image', this.file);
    }

    this.foodService.createFood(formData).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/foods']); // 返回列表
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Failed to create food';
        console.error(err);
      }
    });
  }
}