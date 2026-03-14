import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { OrderService } from '../../services/order.service';
import { SocketService } from '../../services/socket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-orders',
  standalone: false,
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit, OnDestroy {
  orders: any[] = [];
  loading: boolean = false;
  private socketSub?: Subscription;

  constructor(
    private orderService: OrderService,
    private socketService: SocketService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadOrders();
    this.initSocketListener();
  }

  /**
   * Fetch the initial list of orders
   */
  loadOrders(): void {
    this.loading = true;
    this.orderService.getOrders().subscribe({
      next: (data) => {
        // Sort orders by date descending (newest on top)
        this.orders = data.sort((a: any, b: any) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.loading = false;
        this.cdr.detectChanges(); // Manually trigger change detection
      },
      error: (err) => {
        console.error('Failed to load orders', err);
        this.loading = false;
      }
    });
  }

  /**
   * Initialize Socket.io listener for real-time updates
   */
  initSocketListener(): void {
    // Using onEvent to subscribe to the 'new-order' event
    this.socketSub = this.socketService.onEvent('new-order').subscribe({
      next: (newOrder) => {
        console.log('Real-time order received:', newOrder);
        
        // Strategy: Automatically refresh the list when a notification is received
        // Alternatively, you could push the single newOrder into the array manually
        this.loadOrders(); 
        
        // Optional: Play a notification sound
        this.playNotificationSound();
      }
    });
  }

  playNotificationSound(): void {
    const audio = new Audio('assets/notification.mp3'); // Ensure file exists in assets folder
    audio.play().catch(e => console.log('Audio playback blocked or failed:', e));
  }

  /**
   * Map order status to Bootstrap CSS classes
   */
  getStatusClass(status: string): string {
    const statusMap: any = {
      'pending': 'badge bg-warning text-dark',
      'completed': 'badge bg-success',
      'cancelled': 'badge bg-danger'
    };
    return statusMap[status] || 'badge bg-secondary';
  }

  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks and redundant listeners
    if (this.socketSub) {
      this.socketSub.unsubscribe();
    }
  }
}