import { Routes } from '@angular/router';

export const CLIENTS_ROUTES: Routes = [
     {
          path: '',
          loadComponent: () => import('./components/client-list/client-list.component').then(c => c.ClientListComponent)
     },
     {
          path: 'create',
          loadComponent: () => import('./components/client-form/client-form.component').then(c => c.ClientFormComponent)
     },
     {
          path: 'edit/:id',
          loadComponent: () => import('./components/client-form/client-form.component').then(c => c.ClientFormComponent)
     },
     {
          path: 'detail/:id',
          loadComponent: () => import('./components/client-detail/client-detail.component').then(c => c.ClientDetailComponent)
     },
     {
          path: ':id',
          loadComponent: () => import('./components/client-detail/client-detail.component').then(c => c.ClientDetailComponent)
     }
];
