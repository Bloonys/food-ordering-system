import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

// Declare global google object
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
    // 1. Subscribe to current user state
    this.authService.currentUser$.subscribe(userData => {
      if (userData) {
        this.user = userData;
        this.cdr.detectChanges();
      } else {
        this.loadProfileFromServer();
      }
    });

    // 2. Dynamically load Google Maps script (secure approach)
    this.loadGoogleMapsScript();
  }

  /**
   * Dynamically load Google Maps script in a safe way
   * Allows using API key from environment instead of hardcoding in index.html
   */
  loadGoogleMapsScript() {
    // Return early if script is already loaded
    if (typeof google !== 'undefined' && google.maps) {
      return;
    }

    // Check if script tag already exists
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

    // Initialize autocomplete after DOM is rendered
    setTimeout(() => {
      this.initAutocomplete();
    }, 100);
  }

  initAutocomplete() {
    // Retry if Google Maps script is not fully loaded yet
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