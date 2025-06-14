import { Routes } from '@angular/router';
import { adminGuard } from '../../core/auth/guards/admin.guard';

export const ADMIN_ROUTES: Routes = [
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
    },
    {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component').then(c => c.DashboardComponent),
        canActivate: [adminGuard]
    },
    {
        path: 'reports',
        loadComponent: () => import('./reports/reports.component').then(c => c.ReportsComponent),
        canActivate: [adminGuard]
    }
];