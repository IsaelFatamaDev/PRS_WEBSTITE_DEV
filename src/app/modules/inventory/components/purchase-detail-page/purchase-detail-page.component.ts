import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { InventoryService } from '../../../../core/services/inventory.service';
import { OrganizationContextService } from '../../../../core/services/organization-context.service';
import {
     PurchaseResponse,
     PurchaseStatus
} from '../../../../core/models/inventory.model';

@Component({
     selector: 'app-purchase-detail-page',
     standalone: true,
     imports: [CommonModule],
     templateUrl: './purchase-detail-page.component.html',
     styleUrls: ['./purchase-detail-page.component.css']
})
export class PurchaseDetailPageComponent implements OnInit, OnDestroy {
     private destroy$ = new Subject<void>();

     purchaseId: string | null = null;
     purchase: PurchaseResponse | null = null;
     users: Map<string, any> = new Map();
     loading = true;
     error: string | null = null;

     // Enum para el template
     PurchaseStatus = PurchaseStatus;

     constructor(
          private route: ActivatedRoute,
          private router: Router,
          private inventoryService: InventoryService,
          private organizationContextService: OrganizationContextService
     ) { }

     ngOnInit(): void {
          this.purchaseId = this.route.snapshot.paramMap.get('id');

          if (!this.purchaseId) {
               this.error = 'ID de compra no válido';
               this.loading = false;
               return;
          }

          this.loadPurchase();
     }

     ngOnDestroy(): void {
          this.destroy$.next();
          this.destroy$.complete();
     }

     private loadPurchase(): void {
          if (!this.purchaseId) return;

          this.loading = true;
          this.error = null;

          this.inventoryService.getPurchaseById(this.purchaseId)
               .pipe(takeUntil(this.destroy$))
               .subscribe({
                    next: (purchase) => {
                         this.purchase = purchase;
                         this.loadUsers();
                    },
                    error: (error) => {
                         console.error('Error loading purchase:', error);
                         this.error = 'Error al cargar la compra';
                         this.loading = false;
                    }
               });
     }

     private loadUsers(): void {
          if (!this.purchase) return;

          const userIds = [this.purchase.requestedByUserId, this.purchase.approvedByUserId]
               .filter((id): id is string => id !== undefined && id !== null);

          if (userIds.length === 0) {
               this.loading = false;
               return;
          }

          const userPromises = userIds.map(userId =>
               this.inventoryService.getUserById(userId).toPromise()
                    .then(user => {
                         if (user) {
                              this.users.set(userId, user);
                         }
                    })
                    .catch(error => {
                         console.error(`Error loading user ${userId}:`, error);
                    })
          );

          Promise.all(userPromises).finally(() => {
               this.loading = false;
          });
     }

     // Navegación
     goBack(): void {
          this.router.navigate(['/admin/inventory/purchases']);
     }

     editPurchase(): void {
          if (this.purchase) {
               this.router.navigate(['/admin/inventory/purchases/edit', this.purchase.purchaseId]);
          }
     }

     // Métodos auxiliares
     getUserFullName(userId: string): string {
          const user = this.users.get(userId);
          return user ? user.fullName : userId;
     }

     getStatusBadgeClass(status: PurchaseStatus): string {
          switch (status) {
               case PurchaseStatus.PENDIENTE:
                    return 'bg-yellow-100 text-yellow-800';
               case PurchaseStatus.APROBADO:
                    return 'bg-green-100 text-green-800';
               case PurchaseStatus.RECHAZADO:
                    return 'bg-red-100 text-red-800';
               case PurchaseStatus.EN_TRANSITO:
                    return 'bg-blue-100 text-blue-800';
               case PurchaseStatus.RECIBIDO:
                    return 'bg-purple-100 text-purple-800';
               case PurchaseStatus.CANCELADO:
                    return 'bg-gray-100 text-gray-800';
               case PurchaseStatus.COMPLETADO:
                    return 'bg-emerald-100 text-emerald-800';
               case PurchaseStatus.PARCIAL:
                    return 'bg-orange-100 text-orange-800';
               default:
                    return 'bg-gray-100 text-gray-800';
          }
     }

     getStatusText(status: PurchaseStatus): string {
          switch (status) {
               case PurchaseStatus.PENDIENTE:
                    return 'Pendiente';
               case PurchaseStatus.APROBADO:
                    return 'Aprobado';
               case PurchaseStatus.RECHAZADO:
                    return 'Rechazado';
               case PurchaseStatus.EN_TRANSITO:
                    return 'En Tránsito';
               case PurchaseStatus.RECIBIDO:
                    return 'Recibido';
               case PurchaseStatus.CANCELADO:
                    return 'Cancelado';
               case PurchaseStatus.COMPLETADO:
                    return 'Completado';
               case PurchaseStatus.PARCIAL:
                    return 'Parcial';
               default:
                    return status;
          }
     }

     getDetailTotal(detail: any): number {
          return detail.quantityOrdered * detail.unitCost;
     }
}
