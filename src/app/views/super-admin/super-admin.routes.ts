import { Routes } from '@angular/router';
import { authGuard } from '../../core/auth/guards/auth.guard';

export const SUPER_ADMIN_ROUTES: Routes = [
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
    },
    {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component').then(c => c.DashboardComponent),
        canActivate: [authGuard]
    },
    {
        path: 'organizations',
        loadComponent: () => import('./organizations/organizations.component').then(c => c.OrganizationsComponent),
        canActivate: [authGuard]
    },
    {
        path: 'system-settings',
        loadComponent: () => import('./system-settings/system-settings.component').then(c => c.SystemSettingsComponent),
        canActivate: [authGuard]
    }
];