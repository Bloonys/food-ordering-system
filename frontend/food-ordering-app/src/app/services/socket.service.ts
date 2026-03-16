import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;
  public orderNotification$ = new Subject<any>();

  constructor() {
    // 🚩 Robust parsing logic: Extract protocol + domain + port
    // Handles environment.apiUrl whether it ends with /api or /api/
    let serverUrl = environment.apiUrl;
    if (serverUrl.includes('/api')) {
      serverUrl = serverUrl.split('/api')[0];
    }
    
    console.log('🔌 Socket.io attempting to connect to:', serverUrl);

    this.socket = io(serverUrl, {
      transports: ['websocket'], 
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    // Listen for successful connection
    this.socket.on('connect', () => {
      console.log('✅ [Socket] Connected successfully! ID:', this.socket.id);
    });

    // Listen for connection errors
    this.socket.on('connect_error', (error) => {
      console.error('❌ [Socket] Connection failed. Check backend status or CORS settings:', error.message);
    });
  }

  // Generic event listener
  onEvent(eventName: string): Observable<any> {
    return new Observable(observer => {
      this.socket.on(eventName, (data) => {
        console.log(`📩 Real-time event received [${eventName}]:`, data);
        observer.next(data);
      });
      return () => this.socket.off(eventName);
    });
  }

  // Compatibility method for existing order listeners
  listenNewOrders(callback: (data: any) => void): void {
    this.socket.on('new-order', (data) => {
      console.log('📩 New order received (listenNewOrders):', data);
      callback(data);
    });
  }
}