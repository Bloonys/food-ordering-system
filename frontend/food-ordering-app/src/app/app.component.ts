import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { SocketService } from './services/socket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('somehow-pizza-admin');
  
  // Use Signal to manage global notification state
  notification = signal<{id: string, message: string} | null>(null);
  private socketSub?: Subscription;

  constructor(private socketService: SocketService) {}

  ngOnInit(): void {
    // Listen for new order events globally
    this.socketSub = this.socketService.onEvent('new-order').subscribe({
      next: (order) => {
        this.triggerGlobalNotification(order);
      },
      error: (err) => console.error('Socket error in App component:', err)
    });
  }

  private triggerGlobalNotification(order: any): void {
    // 1. Play notification sound
    const audio = new Audio('assets/notification.mp3');
    audio.play().catch(e => console.warn('Autoplay blocked by browser. User interaction required.'));

    // 2. Update notification content
    this.notification.set({
      id: order.id,
      message: `Order ID: #${order.id} - Total: $${order.total_amount}`
    });

    // 3. Auto-hide notification after 8 seconds
    setTimeout(() => {
      this.notification.set(null);
    }, 8000);
  }

  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    if (this.socketSub) {
      this.socketSub.unsubscribe();
    }
  }
}