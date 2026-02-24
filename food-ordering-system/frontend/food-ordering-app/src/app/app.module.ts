import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from './app.routes';

import { App } from './app.component';

import { HeaderComponent } from './components/header/header.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FoodCardComponent } from './components/food-card/food-card.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { JwtInterceptor } from './interceptors/jwt.interceptor';
import { ProfileComponent } from './pages/profile/profile.component';
import { FoodListComponent } from './pages/food-list/food-list.component';
import { FoodEditComponent } from './pages/food-edit/food-edit.component';
import { FoodCreateComponent } from './pages/food-create/food-create.component';
import { FoodAdminComponent } from './pages/food-admin/food-admin.component';
import { CartComponent } from './pages/cart/cart.component';

import { AuthInterceptor } from './interceptors/auth.interceptor';

@NgModule({
  declarations: [
    App,
    HeaderComponent,
    NavbarComponent,
    FoodCardComponent,
    HomeComponent,
    LoginComponent,
    ProfileComponent,
    FoodListComponent,
    FoodEditComponent,
    FoodCreateComponent,
    FoodAdminComponent,
    CartComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule,
    RouterModule,
    CommonModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [App]
})
export class AppModule { }
