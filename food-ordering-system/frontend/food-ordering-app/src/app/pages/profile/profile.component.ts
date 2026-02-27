import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  user: any;

  isEditing = false;
  editUser: any = {};

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    this.authService.currentUser$.subscribe(userData => {
      if (userData) {
        this.user = userData;
        this.cdr.detectChanges();
      } else {
        this.loadProfileFromServer();
      }
    });
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

    // 深拷贝，避免污染原数据
    this.editUser = {
      username: this.user.username,
      address: this.user.address || '',
      bankCard: this.user.bankCard || ''
    };
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

        // 更新全局 currentUser$
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