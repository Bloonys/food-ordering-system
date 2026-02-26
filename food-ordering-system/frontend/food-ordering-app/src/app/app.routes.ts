import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { AuthGuard } from '.././guards/auth.guard';
import { FoodListComponent } from './pages/food-list/food-list.component';
import { FoodEditComponent } from './pages/food-edit/food-edit.component';
import { FoodCreateComponent } from './pages/food-create/food-create.component';
import { FoodAdminComponent } from './pages/food-admin/food-admin.component';
import { CartComponent } from './pages/cart/cart.component';

export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'category/:name', component: HomeComponent },
  { path: 'foods', component: FoodListComponent },
  { path: 'foods/edit/:id', component: FoodEditComponent },
  { path: 'foods/create', component: FoodCreateComponent },
  { path: 'admin/foods', component: FoodAdminComponent, canActivate: [AuthGuard], data: { role: 'admin' } },
  { path: 'cart', component: CartComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },

  { path: '', redirectTo: 'home', pathMatch: 'full' }, // default to home

];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
  onSameUrlNavigation: 'reload',
  scrollPositionRestoration: 'enabled'
})],
  exports: [RouterModule]
})
export class AppRoutingModule { }