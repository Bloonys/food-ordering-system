import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { OrderService } from '../../services/order.service';
import { SocketService } from '../../services/socket.service';
import { BehaviorSubject, Subscription, map, take } from 'rxjs';

@Component({
  selector: 'app-orders',
  standalone: false,
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit, OnDestroy {
  // Use BehaviorSubject as a reactive data source
  private ordersSubject = new BehaviorSubject<any[]>([]);
  // The template will bind to this stream
  orders$ = this.ordersSubject.asObservable();
  
  loading: boolean = false;
  currentPage: number = 1;
  pageSize: number = 6;
  private socketSub?: Subscription;

  constructor(
    private orderService: OrderService,
    private socketService: SocketService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadOrders();
    
    // Listen to the Socket stream
    this.socketSub = this.socketService.orderNotification$.subscribe(newOrder => {
      if (newOrder) {
        this.addNewOrder(newOrder);
      }
    });
  }

  /**
   * Initial fetch: Load from API and push to the stream
   */
  loadOrders(): void {
    this.loading = true;
    this.orderService.getOrders().subscribe({
      next: (data) => {
        const sortedData = data.map((o: any) => ({ ...o, isNew: false }))
          .sort((a: any, b: any) => 
            new Date(b.created_at || b.createdAt).getTime() - new Date(a.created_at || a.createdAt).getTime()
          );
        this.ordersSubject.next(sortedData);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => (this.loading = false)
    });
  }

  /**
   * Reactive approach to adding a new order
   */
  private addNewOrder(newOrder: any): void {
    const currentOrders = this.ordersSubject.getValue();

    const mappedOrder = {
        ...newOrder,
        id: newOrder.orderId, 
        total_amount: newOrder.total, 
        created_at: newOrder.time || new Date().toISOString(),
        isNew: true 
    };

    console.log('🎨 [Orders] Adding Mapped Order to UI:', mappedOrder);

    // Update data stream and reset to the first page
    this.ordersSubject.next([mappedOrder, ...currentOrders]);
    this.currentPage = 1; 
    this.cdr.detectChanges();
    }

  /**
   * Helper to update a single order property within the RxJS stream
   */
  private updateSingleOrderProperty(orderId: any, key: string, value: any): void {
    const updatedOrders = this.ordersSubject.getValue().map(o => 
      (o.id === orderId) ? { ...o, [key]: value } : o
    );
    this.ordersSubject.next(updatedOrders);
    this.cdr.detectChanges();
  }

  viewDetails(order: any): void {
    this.updateSingleOrderProperty(order.id, 'isNew', false);
  }

  updateStatus(order: any, newStatus: string): void {
    this.orderService.updateOrderStatus(order.id, newStatus).subscribe({
      next: () => {
        const updated = this.ordersSubject.getValue().map(o => 
          (o.id === order.id) ? { ...o, status: newStatus, isNew: false } : o
        );
        this.ordersSubject.next(updated);
        this.cdr.detectChanges();
      }
    });
  }

  // Use a getter with the Subject's current value for pagination
  get pagedOrders() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.ordersSubject.getValue().slice(startIndex, startIndex + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.ordersSubject.getValue().length / this.pageSize);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  ngOnDestroy(): void {
    if (this.socketSub) this.socketSub.unsubscribe();
  }
}