import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription, combineLatest, startWith } from 'rxjs';
import type { FoodItem } from '../../models/food-item.interface';
import { FoodService } from '../../services/food.service';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {

  items: FoodItem[] = [];
  allItems: FoodItem[] = [];
  sortBy: string = 'default';
  searchTerm: string = '';
  
  private dataSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private foodService: FoodService,
    private cdr: ChangeDetectorRef // 注入变更检测参考
  ) {}

  ngOnInit(): void {
    console.log('HomeComponent init - handling cross-page navigation');

    // 使用 combineLatest 确保：无论数据先到还是路由先到，只要两者都变了，就执行逻辑
    this.dataSub = combineLatest([
      this.foodService.getFoods(),
      this.route.paramMap.pipe(startWith(this.route.snapshot.paramMap)) // 确保初始路由状态也被捕获
    ]).subscribe({
      next: ([data, params]) => {
        // 1. 映射数据
        this.allItems = data.map(item => ({
          id: item.id ?? 0,
          name: item.name,
          price: Number(item.price),
          category: item.category,
          image: item.image,
          description: '',
          rating: 0
        }));

        // 2. 获取参数执行过滤
        const catName = params.get('name');
        this.executeFilter(catName);

        // 3. 关键：强制 Angular 检查 UI 变化
        // 有时候从不同路由（如 login）跳过来，异步回调里的数据变化不会自动触发 UI 刷新
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('Failed to load foods', err);
      }
    });
  }
//排序
private executeFilter(cat: string | null): void {

  let tempItems: FoodItem[];

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
      (i.description || '').toLowerCase().includes(keyword)
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
      this.items = [...this.items].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
    this.cdr.detectChanges(); // 排序后也强制刷新一次
  }
  // 🔄 排序按钮触发
  onSortChange(type: string): void {
    this.sortBy = type;
    const catName = this.route.snapshot.paramMap.get('name');
    this.executeFilter(catName);
  }

  //显示
  ngOnDestroy(): void {
    if (this.dataSub) {
      this.dataSub.unsubscribe();
    }
  }
}
