import { Routes } from '@angular/router';
import { clientGuard } from '../../core/auth/guards/client.guard';

export const CLIENT_ROUTES: Routes = [
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
    },
    {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component').then(c => c.DashboardComponent),
        canActivate: [clientGuard]
    },
    {
        path: 'my-account',
        loadComponent: () => import('./my-account/my-account.component').then(c => c.MyAccountComponent),
        canActivate: [clientGuard]
    },
    {
        path: 'my-payments',
        loadComponent: () => import('./my-payments/my-payments.component').then(c => c.MyPaymentsComponent),
        canActivate: [clientGuard]
    }
];