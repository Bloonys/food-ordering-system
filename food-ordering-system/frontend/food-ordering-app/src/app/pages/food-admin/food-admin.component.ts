import { Component, OnInit } from '@angular/core';
import { FoodService } from '../../services/food.service';
import type { Food } from '../../models/food.model';

@Component({
  selector: 'app-food-admin',
  standalone: false,
  templateUrl: './food-admin.component.html',
  styleUrls: ['./food-admin.component.css']
})
export class FoodAdminComponent implements OnInit {

  foods: Food[] = [];
  editing: Food | null = null;

  form: Food = {
    name: '',
    price: 0,
    category: ''
  };

  selectedFile: File | null = null;

  constructor(private foodService: FoodService) {}

  ngOnInit(): void {
    this.loadFoods();
  }

  loadFoods(): void {
    this.foodService.getFoods().subscribe({
      next: (data) => {
        this.foods = data;
      },
      error: (err) => {
        console.error('Failed to load foods', err);
      }
    });
  }

  edit(food: Food): void {
    this.editing = food;
    this.form = { ...food };
  }

  cancel(): void {
    this.editing = null;
    this.form = { name: '', price: 0, category: '' };
    this.selectedFile = null;
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  save(): void {
    const formData = new FormData();

    formData.append('name', this.form.name);
    formData.append('price', String(this.form.price));
    formData.append('category', this.form.category);

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    if (this.editing) {
      this.foodService.updateFood(this.editing.id!, formData).subscribe(() => {
        this.loadFoods();
        this.cancel();
      });
    } else {
      this.foodService.createFood(formData).subscribe(() => {
        this.loadFoods();
        this.cancel();
      });
    }
  }

  delete(id: number): void {
    if (confirm('Delete item?')) {
      this.foodService.deleteFood(id).subscribe({
        next: () => {
          this.loadFoods();
        }
      });
    }
  }
}