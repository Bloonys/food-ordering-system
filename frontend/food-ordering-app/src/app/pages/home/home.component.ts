import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription, combineLatest, startWith } from 'rxjs';
import { Food } from '../../models/food.model'; // ✅ Use unified Food model
import { FoodService } from '../../services/food.service';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {

  items: Food[] = [];      
  allItems: Food[] = [];  
  sortBy: string = 'default';
  searchTerm: string = '';
  
  private dataSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private foodService: FoodService,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit(): void {
    // Combine data stream and route params to react to both changes
    this.dataSub = combineLatest([
      this.foodService.getFoods(),
      this.route.paramMap.pipe(startWith(this.route.snapshot.paramMap))
    ]).subscribe({
      next: ([data, params]) => {
        // 1. Map data: preserve backend fields (including description)
        this.allItems = data.map(item => ({
          ...item,                         // Keep all fields (id, name, price, category, image, description)
          price: Number(item.price),       // Ensure price is a number
          rating: (item as any).rating || 0 // Use backend rating if available, otherwise default to 0
        }));

        // 2. Get route param and apply filtering
        const catName = params.get('name');
        this.executeFilter(catName);

        // 3. Manually trigger change detection
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('Failed to load foods', err);
      }
    });
  }

  private executeFilter(cat: string | null): void {
    let tempItems: Food[];

    // 1️⃣ Category filter
    if (!cat || cat.toLowerCase() === 'all' || cat.toLowerCase() === 'home') {
      tempItems = [...this.allItems];
    } else {
      const name = cat.toLowerCase();
      tempItems = this.allItems.filter(i =>
        (i.category || '').toLowerCase() === name
      );
    }

    // 2️⃣ Keyword search filter
    if (this.searchTerm.trim()) {
      const keyword = this.searchTerm.toLowerCase();
      tempItems = tempItems.filter(i =>
        i.name.toLowerCase().includes(keyword) ||
        (i.description || '').toLowerCase().includes(keyword) // Search also matches description
      );
    }

    this.items = tempItems;

    // 3️⃣ Apply sorting
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
