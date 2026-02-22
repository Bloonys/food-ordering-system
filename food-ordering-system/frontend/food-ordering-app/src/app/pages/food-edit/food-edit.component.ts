import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FoodService } from '../../services/food.service';
import { Food } from '../../models/food.model';

@Component({
  selector: 'app-food-edit',
  standalone: false,
  templateUrl: './food-edit.component.html'
})
export class FoodEditComponent implements OnInit {

  food: Food = {
    name: '',
    price: 0,
    category: ''
  };

  file: File | null = null;
  id!: number;

  constructor(
    private route: ActivatedRoute,
    private foodService: FoodService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));

    this.foodService.getFood(this.id).subscribe(res => {
      this.food = res;
    });
  }

  onFileSelected(e: any) {
    this.file = e.target.files[0];
  }

  submit() {
    const formData = new FormData();
    formData.append('name', this.food.name);
    formData.append('price', this.food.price.toString());
    formData.append('category', this.food.category);

    if (this.file) {
      formData.append('image', this.file);
    } else if (this.food.image) {
      formData.append('image', this.food.image);
    }

    this.foodService.updateFood(this.id, formData).subscribe(() => {
      this.router.navigate(['/foods']);
    });
  }
}