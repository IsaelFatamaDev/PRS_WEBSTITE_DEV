import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth.guard';
import { AdminComponent } from './layouts/admin/admin.component';
import { ClientComponent } from './layouts/client/client.component';
import { SuperAdminComponent } from './layouts/super-admin/super-admin.component';

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
    component: AdminComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./views/admin/dashboard/dashboard.component').then(c => c.DashboardComponent),
      },
      {
        path: 'reports',
        loadComponent: () => import('./views/admin/reports/reports.component').then(c => c.ReportsComponent),
      },
      {
        path: 'users',
        loadComponent: () => import('./modules/users/components/user-list/user-list.component').then(c => c.UserListComponent),
      },
      {
        path: 'payments',
        loadComponent: () => import('./modules/payments/components/payment-list/payment-list.component').then(c => c.PaymentListComponent),
      },
      {
        path: 'incidents',
        loadComponent: () => import('./modules/distribution/components/incident-list/incident-list.component').then(c => c.IncidentListComponent),
      },
      {
        path: 'complaints',
        loadComponent: () => import('./modules/complaints/components/complaint-list/complaint-list.component').then(c => c.ComplaintListComponent),
      }
    ]
  },
  {
    path: 'client',
    component: ClientComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./views/client/dashboard/dashboard.component').then(c => c.DashboardComponent),
      },
      {
        path: 'my-account',
        loadComponent: () => import('./views/client/my-account/my-account.component').then(c => c.MyAccountComponent),
      },
      {
        path: 'my-payments',
        loadComponent: () => import('./views/client/my-payments/my-payments.component').then(c => c.MyPaymentsComponent),
      }
    ]
  },
  {
    path: 'super-admin',
    component: SuperAdminComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./views/super-admin/dashboard/dashboard.component').then(c => c.DashboardComponent),
      },
      {
        path: 'organizations',
        loadComponent: () => import('./modules/organizations/components/organization-list/organization-list.component').then(c => c.OrganizationListComponent),
      },
      {
        path: 'system-settings',
        loadComponent: () => import('./views/super-admin/system-settings/system-settings.component').then(c => c.SystemSettingsComponent),
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'auth/login'
  }
];
