import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InventoryService } from '../../../../core/services/inventory.service';
import { OrganizationContextService } from '../../../../core/services/organization-context.service';
import { InventoryStats, ProductSummary, PurchaseSummary } from '../../../../core/models/inventory.model';

@Component({
     selector: 'app-inventory-dashboard',
     standalone: true,
     imports: [CommonModule],
     templateUrl: './inventory-dashboard.component.html',
     styleUrls: ['./inventory-dashboard.component.css']
})
export class InventoryDashboardComponent implements OnInit, OnDestroy {
     private destroy$ = new Subject<void>();

     loading = true;
     error: string | null = null;

     inventoryStats: InventoryStats | null = null;
     productSummary: ProductSummary | null = null;
     purchaseSummary: PurchaseSummary | null = null;
     organizationId: string | null = null;

     constructor(
          private inventoryService: InventoryService,
          private organizationContextService: OrganizationContextService,
          private router: Router
     ) { }

     ngOnInit(): void {
          console.log('InventoryDashboard: Initializing...');
          this.organizationId = this.organizationContextService.getCurrentOrganizationId();
          console.log('InventoryDashboard: Organization ID:', this.organizationId);

          if (!this.organizationId) {
               console.error('InventoryDashboard: No organization ID found');
               this.error = 'No se encontró información de la organización';
               this.loading = false;
               return;
          }

          console.log('InventoryDashboard: Loading dashboard data...');
          this.loadDashboardData();
     }

     ngOnDestroy(): void {
          this.destroy$.next();
          this.destroy$.complete();
     }

     private loadDashboardData(): void {
          this.loading = true;
          this.error = null;

          console.log('InventoryDashboard: Loading inventory stats...');
          // Cargar estadísticas del inventario
          this.inventoryService.getInventoryStats(this.organizationId!)
               .pipe(takeUntil(this.destroy$))
               .subscribe({
                    next: (stats) => {
                         console.log('InventoryDashboard: Stats loaded successfully');
                         this.inventoryStats = stats;
                    },
                    error: (error) => {
                         console.error('InventoryDashboard: Error loading inventory stats:', error);
                         // No mostrar error si es un 404 (datos no encontrados)
                         if (error.status !== 404) {
                              this.error = 'Error al cargar las estadísticas del inventario';
                         }
                    }
               });

          console.log('InventoryDashboard: Loading product summary...');
          // Cargar resumen de productos
          this.inventoryService.getProductSummary(this.organizationId!)
               .pipe(takeUntil(this.destroy$))
               .subscribe({
                    next: (summary) => {
                         console.log('InventoryDashboard: Product summary loaded successfully');
                         this.productSummary = summary;
                    },
                    error: (error) => {
                         console.error('InventoryDashboard: Error loading product summary:', error);
                         // No mostrar error si es un 404 (datos no encontrados)
                         if (error.status !== 404) {
                              this.error = 'Error al cargar el resumen de productos';
                         }
                    }
               });

          console.log('InventoryDashboard: Loading purchase summary...');
          // Cargar resumen de compras
          this.inventoryService.getPurchaseSummary(this.organizationId!)
               .pipe(takeUntil(this.destroy$))
               .subscribe({
                    next: (summary) => {
                         console.log('InventoryDashboard: Purchase summary loaded successfully');
                         this.purchaseSummary = summary;
                         this.loading = false;
                    },
                    error: (error) => {
                         console.error('InventoryDashboard: Error loading purchase summary:', error);
                         // No mostrar error si es un 404 (datos no encontrados)
                         if (error.status !== 404) {
                              this.error = 'Error al cargar el resumen de compras';
                         }
                         this.loading = false;
                    }
               });
     }

     // Navegación
     navigateToProducts(): void {
          this.router.navigate(['/admin/inventory/products']);
     }

     navigateToCategories(): void {
          this.router.navigate(['/admin/inventory/categories']);
     }

     navigateToSuppliers(): void {
          this.router.navigate(['/admin/inventory/suppliers']);
     }

     navigateToPurchases(): void {
          this.router.navigate(['/admin/inventory/purchases']);
     }

     // Refresh data
     refresh(): void {
          this.loadDashboardData();
     }
}
