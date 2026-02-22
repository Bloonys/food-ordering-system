import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import type { FoodItem } from '../../models/food-item.interface';
import { FoodService } from '../../services/food.service';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  items: FoodItem[] = [];
  allItems: FoodItem[] = [];
  sortBy: string = 'default';

  constructor(
    private route: ActivatedRoute,
    private foodService: FoodService
  ) {}

  ngOnInit(): void {
    console.log('HomeComponent init');
    // 从后端加载菜品
    this.foodService.getFoods().subscribe({
      next: (data) => {
        // 映射后端数据到前端格式（id 兜底为 0）
        this.allItems = data.map(item => ({
          id: item.id ?? 0,
          name: item.name,
          price: Number(item.price),
          category: item.category,
          image: item.image,
          description: '',
          rating: 0
        }));

        this.filterByRoute();
      },
      error: (err) => {
        console.error('Failed to load foods', err);
      }
    });

    // 路由变化重新过滤
    this.route.paramMap.subscribe(() => {
      this.filterByRoute();
    });
  }

  private filterByRoute(): void {
    const cat = this.route.snapshot.paramMap.get('name');

    if (!cat) {
      this.items = [...this.allItems];
    } else {
      const name = cat.toLowerCase();
      this.items = this.allItems.filter(i =>
        (i.category || '').toLowerCase() === name
      );
    }

    this.applySorting();
  }

  applySorting(): void {
    if (this.sortBy === 'price') {
      this.items = [...this.items].sort((a, b) => a.price - b.price);
    } else if (this.sortBy === 'rating') {
      this.items = [...this.items].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
  }
}


