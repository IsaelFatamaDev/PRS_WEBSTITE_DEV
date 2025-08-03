import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { InventoryRoutingModule } from './inventory-routing.module';

// Components
import { InventoryDashboardComponent } from './components/inventory-dashboard/inventory-dashboard.component';
import { ProductListComponent } from './components/product-list/product-list.component';
import { CategoryListComponent } from './components/category-list/category-list.component';
import { SupplierListComponent } from './components/supplier-list/supplier-list.component';
import { PurchaseListComponent } from './components/purchase-list/purchase-list.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InventoryRoutingModule,
    // Standalone Components
    InventoryDashboardComponent,
    ProductListComponent,
    CategoryListComponent,
    SupplierListComponent,
    PurchaseListComponent
  ]
})
export class InventoryModule { }
