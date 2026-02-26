import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription, combineLatest, startWith } from 'rxjs';
import { Food } from '../../models/food.model'; // ✅ 使用统一的 Food 模型
import { FoodService } from '../../services/food.service';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {

  items: Food[] = [];      // ✅ 类型改为 Food
  allItems: Food[] = [];   // ✅ 类型改为 Food
  sortBy: string = 'default';
  searchTerm: string = '';
  
  private dataSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private foodService: FoodService,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit(): void {
    // 使用 combineLatest 监听数据加载和路由参数变化
    this.dataSub = combineLatest([
      this.foodService.getFoods(),
      this.route.paramMap.pipe(startWith(this.route.snapshot.paramMap))
    ]).subscribe({
      next: ([data, params]) => {
        // ✅ 1. 映射数据：不再手动置空字段，保留后端传来的 description
        this.allItems = data.map(item => ({
          ...item,                        // 保留所有字段 (id, name, price, category, image, description)
          price: Number(item.price),      // 确保价格是数字
          rating: (item as any).rating || 0 // 如果后端有 rating 则保留，否则设为 0
        }));

        // 2. 获取参数执行过滤
        const catName = params.get('name');
        this.executeFilter(catName);

        // 3. 强制变更检测
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('Failed to load foods', err);
      }
    });
  }

  private executeFilter(cat: string | null): void {
    let tempItems: Food[];

    // 1️⃣ 分类过滤
    if (!cat || cat.toLowerCase() === 'all' || cat.toLowerCase() === 'home') {
      tempItems = [...this.allItems];
    } else {
      const name = cat.toLowerCase();
      tempItems = this.allItems.filter(i =>
        (i.category || '').toLowerCase() === name
      );
    }

    // 2️⃣ 🔎 搜索过滤
    if (this.searchTerm.trim()) {
      const keyword = this.searchTerm.toLowerCase();
      tempItems = tempItems.filter(i =>
        i.name.toLowerCase().includes(keyword) ||
        (i.description || '').toLowerCase().includes(keyword) // 现在这里能搜到内容了
      );
    }

    this.items = tempItems;

    // 3️⃣ 排序
    this.applySorting();
  }

  applySorting(): void {
    if (this.sortBy === 'price') {
      this.items = [...this.items].sort((a, b) => a.price - b.price);
    } else if (this.sortBy === 'rating') {
      this.items = [...this.items].sort((a, b) => ((b as any).rating || 0) - ((a as any).rating || 0));
    }
    this.cdr.detectChanges(); 
  }

  onSortChange(type: string): void {
    this.sortBy = type;
    const catName = this.route.snapshot.paramMap.get('name');
    this.executeFilter(catName);
  }

  onSearch(): void {
    const catName = this.route.snapshot.paramMap.get('name');
    this.executeFilter(catName);
  }

  ngOnDestroy(): void {
    if (this.dataSub) {
      this.dataSub.unsubscribe();
    }
  }
}
