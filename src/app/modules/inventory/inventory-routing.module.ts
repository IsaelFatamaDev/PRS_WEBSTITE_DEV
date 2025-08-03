import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Components
import { InventoryDashboardComponent } from './components/inventory-dashboard/inventory-dashboard.component';
import { ProductListComponent } from './components/product-list/product-list.component';
import { CategoryListComponent } from './components/category-list/category-list.component';
import { SupplierListComponent } from './components/supplier-list/supplier-list.component';
import { PurchaseListComponent } from './components/purchase-list/purchase-list.component';

const routes: Routes = [
  {
    path: '',
    component: InventoryDashboardComponent
  },
  {
    path: 'dashboard',
    component: InventoryDashboardComponent
  },
  {
    path: 'products',
    children: [
      {
        path: '',
        component: ProductListComponent
      },
      {
        path: 'new',
        loadComponent: () => import('./components/product-form-page/product-form-page.component').then(c => c.ProductFormPageComponent)
      },
      {
        path: 'edit/:id',
        loadComponent: () => import('./components/product-form-page/product-form-page.component').then(c => c.ProductFormPageComponent)
      },
      {
        path: 'detail/:id',
        loadComponent: () => import('./components/product-detail-page/product-detail-page.component').then(c => c.ProductDetailPageComponent)
      }
    ]
  },
  {
    path: 'categories',
    component: CategoryListComponent
  },
  {
    path: 'suppliers',
    component: SupplierListComponent
  },
  {
    path: 'purchases',
    children: [
      {
        path: '',
        component: PurchaseListComponent
      },
      {
        path: 'new',
        loadComponent: () => import('./components/purchase-form-page/purchase-form-page.component').then(c => c.PurchaseFormPageComponent)
      },
      {
        path: 'edit/:id',
        loadComponent: () => import('./components/purchase-form-page/purchase-form-page.component').then(c => c.PurchaseFormPageComponent)
      },
      {
        path: 'detail/:id',
        loadComponent: () => import('./components/purchase-detail-page/purchase-detail-page.component').then(c => c.PurchaseDetailPageComponent)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InventoryRoutingModule { }
