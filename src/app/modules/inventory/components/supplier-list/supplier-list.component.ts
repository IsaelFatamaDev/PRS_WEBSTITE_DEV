import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InventoryService } from '../../../../core/services/inventory.service';
import { OrganizationContextService } from '../../../../core/services/organization-context.service';
import {
     SupplierResponse,
     SupplierStatus,
     SupplierRequest
} from '../../../../core/models/inventory.model';

@Component({
     selector: 'app-supplier-list',
     standalone: true,
     imports: [CommonModule, FormsModule],
     templateUrl: './supplier-list.component.html',
     styleUrls: ['./supplier-list.component.css']
})
export class SupplierListComponent implements OnInit, OnDestroy {
     private destroy$ = new Subject<void>();

     suppliers: SupplierResponse[] = [];
     filteredSuppliers: SupplierResponse[] = [];
     loading = true;
     error: string | null = null;

     // Filtros
     searchTerm = '';
     selectedStatus: SupplierStatus | 'ALL' = 'ALL';

     // Modal states
     showCreateModal = false;
     showEditModal = false;
     showDeleteModal = false;
     selectedSupplier: SupplierResponse | null = null;

     // Form data
     supplierForm: Partial<SupplierRequest> = {};

     // Enums para el template
     SupplierStatus = SupplierStatus;

     organizationId: string | null = null;

     constructor(
          private inventoryService: InventoryService,
          private organizationContextService: OrganizationContextService,
          private router: Router
     ) { }

     ngOnInit(): void {
          this.organizationId = this.organizationContextService.getCurrentOrganizationId();
          if (!this.organizationId) {
               this.error = 'No se encontró información de la organización';
               this.loading = false;
               return;
          }

          this.loadSuppliers();
     }

     ngOnDestroy(): void {
          this.destroy$.next();
          this.destroy$.complete();
     }

     loadSuppliers(): void {
          this.loading = true;
          this.error = null;

          this.inventoryService.getSuppliers(this.organizationId!)
               .pipe(takeUntil(this.destroy$))
               .subscribe({
                    next: (suppliers) => {
                         this.suppliers = suppliers;
                         this.applyFilters();
                         this.loading = false;
                    },
                    error: (error) => {
                         console.error('Error loading suppliers:', error);
                         this.error = 'Error al cargar los proveedores';
                         this.loading = false;
                    }
               });
     }

     applyFilters(): void {
          let filtered = [...this.suppliers];

          // Filter by search term
          if (this.searchTerm) {
               const search = this.searchTerm.toLowerCase();
               filtered = filtered.filter(supplier =>
                    supplier.supplierName.toLowerCase().includes(search) ||
                    supplier.supplierCode.toLowerCase().includes(search) ||
                    (supplier.contactPerson && supplier.contactPerson.toLowerCase().includes(search)) ||
                    (supplier.email && supplier.email.toLowerCase().includes(search))
               );
          }

          // Filter by status
          if (this.selectedStatus !== 'ALL') {
               filtered = filtered.filter(supplier => supplier.status === this.selectedStatus);
          }

          this.filteredSuppliers = filtered;
     }

     onSearchChange(): void {
          this.applyFilters();
     }

     onStatusChange(): void {
          this.applyFilters();
     }

     // CRUD Operations
     openCreateModal(): void {
          this.supplierForm = {
               organizationId: this.organizationId!,
               status: SupplierStatus.ACTIVO
          };
          this.showCreateModal = true;
     }

     openEditModal(supplier: SupplierResponse): void {
          this.selectedSupplier = supplier;
          this.supplierForm = {
               organizationId: supplier.organizationId,
               supplierCode: supplier.supplierCode,
               supplierName: supplier.supplierName,
               contactPerson: supplier.contactPerson,
               phone: supplier.phone,
               email: supplier.email,
               address: supplier.address,
               status: supplier.status
          };
          this.showEditModal = true;
     }

     openDeleteModal(supplier: SupplierResponse): void {
          this.selectedSupplier = supplier;
          this.showDeleteModal = true;
     }

     closeModals(): void {
          this.showCreateModal = false;
          this.showEditModal = false;
          this.showDeleteModal = false;
          this.selectedSupplier = null;
          this.supplierForm = {};
     }

     createSupplier(): void {
          if (!this.isFormValid()) return;

          this.inventoryService.createSupplier(this.supplierForm as SupplierRequest)
               .pipe(takeUntil(this.destroy$))
               .subscribe({
                    next: () => {
                         this.closeModals();
                         this.loadSuppliers();
                    },
                    error: (error) => {
                         console.error('Error creating supplier:', error);
                         this.error = 'Error al crear el proveedor';
                    }
               });
     }

     updateSupplier(): void {
          if (!this.selectedSupplier || !this.isFormValid()) return;

          this.inventoryService.updateSupplier(this.selectedSupplier.supplierId, this.supplierForm as SupplierRequest)
               .pipe(takeUntil(this.destroy$))
               .subscribe({
                    next: () => {
                         this.closeModals();
                         this.loadSuppliers();
                    },
                    error: (error) => {
                         console.error('Error updating supplier:', error);
                         this.error = 'Error al actualizar el proveedor';
                    }
               });
     }

     deleteSupplier(): void {
          if (!this.selectedSupplier) return;

          this.inventoryService.deleteSupplier(this.selectedSupplier.supplierId)
               .pipe(takeUntil(this.destroy$))
               .subscribe({
                    next: () => {
                         this.closeModals();
                         this.loadSuppliers();
                    },
                    error: (error) => {
                         console.error('Error deleting supplier:', error);
                         this.error = 'Error al eliminar el proveedor';
                    }
               });
     }

     restoreSupplier(supplier: SupplierResponse): void {
          this.inventoryService.restoreSupplier(supplier.supplierId)
               .pipe(takeUntil(this.destroy$))
               .subscribe({
                    next: () => {
                         this.loadSuppliers();
                    },
                    error: (error) => {
                         console.error('Error restoring supplier:', error);
                         this.error = 'Error al restaurar el proveedor';
                    }
               });
     }

     isFormValid(): boolean {
          return !!(
               this.supplierForm.supplierCode?.trim() &&
               this.supplierForm.supplierName?.trim() &&
               this.supplierForm.organizationId
          );
     }

     getStatusBadgeClass(status: SupplierStatus): string {
          switch (status) {
               case SupplierStatus.ACTIVO:
                    return 'bg-green-100 text-green-800';
               case SupplierStatus.INACTIVO:
                    return 'bg-red-100 text-red-800';
               case SupplierStatus.BLOQUEADO:
                    return 'bg-yellow-100 text-yellow-800';
               default:
                    return 'bg-gray-100 text-gray-800';
          }
     }

     getStatusText(status: SupplierStatus): string {
          switch (status) {
               case SupplierStatus.ACTIVO:
                    return 'Activo';
               case SupplierStatus.INACTIVO:
                    return 'Inactivo';
               case SupplierStatus.BLOQUEADO:
                    return 'Bloqueado';
               default:
                    return status;
          }
     }

     refresh(): void {
          this.loadSuppliers();
     }
}
