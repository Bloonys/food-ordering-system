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
  // 数据源
  orders: any[] = [];
  loading: boolean = false;
  
  // 分页状态
  currentPage: number = 1;
  pageSize: number = 6; // 每页显示数量
  
  private socketSub?: Subscription;

  constructor(
    private orderService: OrderService,
    private socketService: SocketService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadOrders();
    
    // 监听实时订单通知
    this.socketSub = this.socketService.orderNotification$.subscribe(newOrder => {
      if (newOrder) {
        this.handleNewOrder(newOrder);
      }
    });
  }

  /**
   * 获取所有订单
   */
  loadOrders(): void {
    this.loading = true;
    this.orderService.getOrders().subscribe({
      next: (data) => {
        // 按时间倒序
        this.orders = data.sort((a: any, b: any) => 
          new Date(b.createdAt || b.created_at).getTime() - new Date(a.createdAt || a.created_at).getTime()
        );
        this.loading = false;
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('Fetch error:', err);
        this.loading = false;
      }
    });
  }

  /**
   * 处理实时新订单
   */
  private handleNewOrder(newOrder: any): void {
    this.orders = [newOrder, ...this.orders];
    this.currentPage = 1; // 自动跳转第一页查看新订单
    this.cdr.detectChanges();
  }

  /**
   * 分页逻辑：获取当前页显示的数据
   */
  get pagedOrders() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.orders.slice(startIndex, startIndex + this.pageSize);
  }

  /**
   * 计算总页数
   */
  get totalPages() {
    return Math.ceil(this.orders.length / this.pageSize);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  ngOnDestroy(): void {
    if (this.socketSub) {
      this.socketSub.unsubscribe();
    }
  }
}