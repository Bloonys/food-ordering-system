import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CartEntry } from './cart.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private baseUrl = 'http://localhost:3001/api/orders';

  constructor(private http: HttpClient) {}

  private getAuthHeaders() {
    const token = localStorage.getItem('token');

    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : ''
    });
  }

  createOrder(items: CartEntry[]): Observable<any> {
    const payload = items.map(e => ({
      foodId: e.food.id,
      quantity: e.quantity
    }));

    return this.http.post(
      this.baseUrl,
      { items: payload },
      { headers: this.getAuthHeaders() }
    );
  }

  getOrders(): Observable<any> {
    return this.http.get(
      this.baseUrl,
      { headers: this.getAuthHeaders() }
    );
  }
}