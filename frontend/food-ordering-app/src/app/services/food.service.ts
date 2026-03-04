import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Food } from '../models/food.model';

@Injectable({ providedIn: 'root' })
export class FoodService {

  private baseUrl = '/api/foods';

  constructor(private http: HttpClient) {}

  getFoods() {
    return this.http.get<Food[]>(this.baseUrl);
  }

  getFood(id: number) {
    return this.http.get<Food>(`${this.baseUrl}/${id}`);
  }

  createFood(formData: FormData) {
    return this.http.post(this.baseUrl, formData);
  }

  updateFood(id: number, formData: FormData) {
    return this.http.put(`${this.baseUrl}/${id}`, formData);
  }

  deleteFood(id: number) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
