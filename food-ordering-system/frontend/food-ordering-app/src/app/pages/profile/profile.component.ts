import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { Router } from '@angular/router';
import { environment } from '../../../enviroments/enviroment';

// 声明 google 全局变量
declare var google: any;

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  @ViewChild('addressInput') addressInput!: ElementRef;

  user: any;
  isEditing = false;
  editUser: any = {};
  autocomplete: any;

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // 1. 订阅用户信息
    this.authService.currentUser$.subscribe(userData => {
      if (userData) {
        this.user = userData;
        this.cdr.detectChanges();
      } else {
        this.loadProfileFromServer();
      }
    });

    // 2. 动态加载 Google Maps 脚本，确保安全
    this.loadGoogleMapsScript();
  }

  /**
   * 安全地动态加载 Google Maps 脚本
   * 这样你就可以从 environment 中读取 Key，而不是硬编码在 index.html 
   */
  loadGoogleMapsScript() {
    // 如果脚本已经加载过，直接返回
    if (typeof google !== 'undefined' && google.maps) {
      return;
    }

    // 检查页面是否已经有该脚本标签
    const existingScript = document.getElementById('google-maps-script');
    if (existingScript) return;

    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }

  loadProfileFromServer() {
    this.authService.getProfile().subscribe({
      next: (res: any) => {
        this.user = res.user;
        this.cdr.detectChanges();
      },
      error: () => {
        this.router.navigate(['/login']);
      }
    });
  }

  startEdit() {
    this.isEditing = true;

    this.editUser = {
      username: this.user.username,
      address: this.user.address || '',
      bankCard: this.user.bankCard || ''
    };

    // 等待 DOM 渲染后初始化 Autocomplete
    setTimeout(() => {
      this.initAutocomplete();
    }, 100);
  }

  initAutocomplete() {
    // 如果脚本还没加载好，稍微等一下再试
    if (typeof google === 'undefined' || !google.maps || !google.maps.places) {
      setTimeout(() => this.initAutocomplete(), 200);
      return;
    }

    if (!this.addressInput) return;

    this.autocomplete = new google.maps.places.Autocomplete(this.addressInput.nativeElement, {
      types: ['address']
    });

    this.autocomplete.addListener('place_changed', () => {
      const place = this.autocomplete.getPlace();
      if (place.formatted_address) {
        this.editUser.address = place.formatted_address;
        this.cdr.detectChanges();
      }
    });
  }

  cancel() {
    this.isEditing = false;
  }

  save() {
    const payload = {
      username: this.editUser.username,
      address: this.editUser.address,
      bankCard: this.editUser.bankCard
    };

    this.authService.updateProfile(payload).subscribe({
      next: (res: any) => {
        this.authService.setCurrentUser(res.user);
        this.isEditing = false;
      },
      error: (err: any) => {
        console.error('Update failed:', err);
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}