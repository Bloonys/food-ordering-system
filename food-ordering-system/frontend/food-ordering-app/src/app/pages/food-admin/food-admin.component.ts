import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // 1. 引入 ChangeDetectorRef
import { FoodService } from '../../services/food.service';
import { Router } from '@angular/router';
import type { Food } from '../../models/food.model';
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
    private cdr: ChangeDetectorRef // 2. 注入服务
  ) {}

  ngOnInit(): void {
    this.loadFoods();
  }

  // ================================
  // Load foods
  // ================================
  loadFoods(): void {
    this.foodService.getFoods().subscribe({
      next: (data) => {
        this.foods = data;
        this.filteredFoods = data;
        // 3. 关键：手动触发变更检测，确保数据立即渲染
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('Failed to load foods', err);
      }
    });
  }

  // ================================
  // Search filter
  // ================================
  filterFoods(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredFoods = this.foods.filter(food =>
      food.name.toLowerCase().includes(term)
    );
    // 过滤后也建议触发一次，确保搜索结果即时响应
    this.cdr.detectChanges();
  }

  // ================================
  // Edit
  // ================================
  edit(food: Food): void {
    this.editing = food;
    this.form = { ...food };
    this.cdr.detectChanges(); // 确保表单立即填入数据
  }

  cancel(): void {
    this.editing = null;
    this.form = {
      name: '',
      price: 0,
      category: '',
      description: ''
    };
    this.selectedFile = null;
    this.cdr.detectChanges();
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
    this.cdr.detectChanges();
  }

  // ================================
  // Save (Create / Update)
  // ================================
  save(): void {
    if (!this.form.name.trim()) { alert('Name is required'); return; }
    if (!this.form.category.trim()) { alert('Category is required'); return; }
    if (!this.form.price || this.form.price <= 0) { alert('Price must be greater than 0'); return; }

    const formData = new FormData();
    formData.append('name', this.form.name);
    formData.append('price', String(this.form.price));
    formData.append('category', this.form.category);
    formData.append('description', this.form.description || '');

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    if (this.editing) {
      this.foodService.updateFood(this.editing.id!, formData).subscribe({
        next: () => {
          this.loadFoods();
          this.cancel();
        }
      });
    } else {
      this.foodService.createFood(formData).subscribe({
        next: () => {
          this.loadFoods();
          this.cancel();
        }
      });
    }
  }

  // ================================
  // Delete
  // ================================
  delete(id: number): void {
    if (confirm('Delete item?')) {
      this.foodService.deleteFood(id).subscribe({
        next: () => {
          this.loadFoods();
        }
      });
    }
  }

  logout(): void {
    this.auth.logout();  
    this.router.navigate(['/login']);
  }
}