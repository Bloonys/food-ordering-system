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
  
  // State for the top toast notification
  notification = signal<{id: string | number, message: string} | null>(null);
  
  // State for the red dot on the Header navigation
  hasUnreadOrders = signal(false); 
  
  private socketSub?: Subscription;
  
  /** * Debounce Lock: Prevents the red dot from being cleared 
   * immediately if a navigation/click event bubbles up 
   * exactly when a new order arrives.
   */
  private isLockingStatus = false;

  constructor(private socketService: SocketService) {}

  ngOnInit(): void {
    // Listen to the 'new-order' socket event
    this.socketSub = this.socketService.onEvent('new-order').subscribe({
      next: (order) => {
        console.log('📦 [App] New Socket Event Received:', order);
        this.processNewOrderNotification(order);
      },
      error: (err) => console.error('❌ [App] Socket Connection Error:', err)
    });
  }

  private processNewOrderNotification(order: any): void {
    // Mapping backend fields based on logs: orderId -> id, total -> total_amount
    const orderId = order.orderId || order.id || 'N/A';
    const amount = order.total || order.total_amount || '0.00';

    // Activate the lock to protect the red dot status for 1.5 seconds
    this.isLockingStatus = true;

    /**
     * AUDIO FIX:
     * 1. Path is '/notification.mp3' because the file is in the 'public' folder.
     * 2. Added timestamp query param (?t=...) to bypass 416 (Range Not Satisfiable) errors.
     */
    const audio = new Audio(`/notification.mp3?t=${Date.now()}`); 
    audio.play().then(() => {
      console.log('🔊 [App] Notification sound played successfully');
    }).catch(e => {
      // Browsers block autoplay until the user clicks the page once
      console.warn('⚠️ [App] Audio autoplay blocked. Click the page to enable sound.', e);
    });

    // Update global signal states
    this.notification.set({
      id: orderId,
      message: `Order ID: #${orderId} - Total: $${amount}`
    });

    console.log('🔴 [App] UI Notification triggered, Header Red Dot ON');
    this.hasUnreadOrders.set(true);

    // Release the clear-lock after 1.5 seconds
    setTimeout(() => {
      this.isLockingStatus = false;
      console.log('🔓 [App] Status clear lock released');
    }, 1500);

    // Automatically hide the top toast notification after 8 seconds
    setTimeout(() => {
      this.notification.set(null);
    }, 8000);
  }

  /**
   * Method to clear the header red dot.
   * Only allowed if the lock is not active.
   */
  clearUnreadStatus(): void {
    if (this.hasUnreadOrders() && !this.isLockingStatus) {
      console.log('✅ [App] Global unread status cleared by user.');
      this.hasUnreadOrders.set(false);
    } else if (this.isLockingStatus) {
      console.warn('⏳ [App] Clear attempt blocked: Protected during notification influx.');
    }
  }

  ngOnDestroy(): void {
    if (this.socketSub) {
      this.socketSub.unsubscribe();
    }
  }
}