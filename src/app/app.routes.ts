import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth.guard';

export const APP_ROUTES: Routes = [
  { 
    path: '', 
    redirectTo: 'login', 
    pathMatch: 'full' 
  },
  { 
    path: 'login', 
    loadComponent: () => import('./views/auth/login/login.component').then(m => m.LoginComponent) 
  },
  {
    path: 'auth',
    loadChildren: () => import('./views/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadChildren: () => import('./views/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },
  {
    path: 'client',
    canActivate: [authGuard],
    loadChildren: () => import('./views/client/client.routes').then(m => m.CLIENT_ROUTES)
  },
  {
    path: 'super-admin',
    canActivate: [authGuard],
    loadChildren: () => import('./views/super-admin/super-admin.routes').then(m => m.SUPER_ADMIN_ROUTES)
  },
  {
    path: '**',
    redirectTo: 'auth/login'
  }
];