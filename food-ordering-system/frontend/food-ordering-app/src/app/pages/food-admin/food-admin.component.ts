import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FoodService } from '../../services/food.service';
import { Router } from '@angular/router';
import { Food } from '../../models/food.model'; // 移除 type 关键字确保接口可用
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-food-admin',
  standalone: false,
  templateUrl: './food-admin.component.html',
  styleUrls: ['./food-admin.component.css']
})
export class FoodAdminComponent implements OnInit {

  foods: Food[] = [];
  filteredFoods: Food[] = [];
  editing: Food | null = null;

  form: Food = {
    name: '',
    price: 0,
    category: '',
    description: ''
  };

  selectedFile: File | null = null;
  searchTerm: string = '';

  constructor(
    private foodService: FoodService,
    private router: Router,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadFoods();
  }

  loadFoods(): void {
    this.foodService.getFoods().subscribe({
      next: (data) => {
        this.foods = data;
        this.filterFoods(); // 统一调用过滤逻辑
        this.cdr.detectChanges(); 
      },
      error: (err) => console.error('Failed to load foods', err)
    });
  }

  filterFoods(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredFoods = [...this.foods];
    } else {
      this.filteredFoods = this.foods.filter(food =>
        food.name.toLowerCase().includes(term) ||
        (food.description && food.description.toLowerCase().includes(term))
      );
    }
    this.cdr.detectChanges();
  }

  // ================================
  // 核心修复：Delete
  // ================================
  delete(id: number | undefined): void {
    if (id === undefined) {
      alert("Error: Item ID not found");
      return;
    }

    if (confirm('Are you sure you want to delete this item?')) {
      this.foodService.deleteFood(id).subscribe({
        next: () => {
          // 1. 从本地数组立即移除，给用户即时反馈
          this.foods = this.foods.filter(f => f.id !== id);
          this.filterFoods(); 
          // 2. 重新从服务器同步一次数据
          // this.loadFoods(); 
          alert('Item deleted successfully');
        },
        error: (err) => {
          console.error('Delete failed', err);
          // 如果后端报错，通常是因为该菜品已存在于某些订单中（外键约束）
          alert('Delete failed: This item might be linked to existing orders.');
        }
      });
    }
  }

  edit(food: Food): void {
    this.editing = food;
    this.form = { ...food };
    this.cdr.detectChanges();
  }

  cancel(): void {
    this.editing = null;
    this.form = { name: '', price: 0, category: '', description: '' };
    this.selectedFile = null;
    this.cdr.detectChanges();
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  save(): void {
    const formData = new FormData();
    formData.append('name', this.form.name);
    formData.append('price', String(this.form.price));
    formData.append('category', this.form.category);
    formData.append('description', this.form.description || '');

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    const request = this.editing 
      ? this.foodService.updateFood(this.editing.id!, formData)
      : this.foodService.createFood(formData);

    request.subscribe({
      next: () => {
        this.loadFoods();
        this.cancel();
      },
      error: (err) => alert('Save failed: ' + err.message)
    });
  }

  logout(): void {
    this.auth.logout();  
    this.router.navigate(['/login']);
  }
}