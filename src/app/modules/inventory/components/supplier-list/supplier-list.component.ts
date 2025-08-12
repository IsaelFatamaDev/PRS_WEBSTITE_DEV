import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';
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
                         // Ordenar por código de forma ascendente
                         this.suppliers = suppliers.sort((a, b) => a.supplierCode.localeCompare(b.supplierCode));
                         this.applyFilters();
                         this.loading = false;
                    },
                    error: (error) => {
                         console.error('Error loading suppliers:', error);
                         this.error = 'Error al cargar los proveedores';
                         this.loading = false;
                         this.showErrorAlert('Error al cargar proveedores', 'No se pudieron cargar los proveedores. Por favor, intente nuevamente.');
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
                    (supplier.email && supplier.email.toLowerCase().includes(search)) ||
                    (supplier.phone && supplier.phone.toLowerCase().includes(search))
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
          const generatedCode = this.generateSupplierCode();
          console.log('Código generado para proveedor:', generatedCode);
          console.log('Proveedores existentes:', this.suppliers.map(s => s.supplierCode));

          this.supplierForm = {
               organizationId: this.organizationId!,
               supplierCode: generatedCode, // Generar código automáticamente
               status: SupplierStatus.ACTIVO // Estado por defecto
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

          // Validar email si se proporciona
          if (this.supplierForm.email && !this.isValidEmail(this.supplierForm.email)) {
               this.showErrorAlert('Email inválido', 'Por favor, ingrese un email válido.');
               return;
          }

          // Validar si ya existe un proveedor con el mismo nombre
          const existingSupplier = this.suppliers.find(supplier =>
               supplier.supplierName.toLowerCase().trim() === this.supplierForm.supplierName?.toLowerCase().trim()
          );
          if (existingSupplier) {
               this.showErrorAlert(
                    'Proveedor duplicado',
                    `Ya existe un proveedor con el nombre "${this.supplierForm.supplierName}". Por favor, utilice un nombre diferente.`
               );
               return;
          }

          // Mostrar loading
          Swal.fire({
               title: 'Creando proveedor...',
               text: 'Por favor espere',
               allowOutsideClick: false,
               didOpen: () => {
                    Swal.showLoading();
               }
          });

          this.inventoryService.createSupplier(this.supplierForm as SupplierRequest)
               .pipe(takeUntil(this.destroy$))
               .subscribe({
                    next: () => {
                         this.closeModals();
                         this.loadSuppliers();
                         Swal.fire({
                              title: '¡Éxito!',
                              text: 'El proveedor ha sido creado exitosamente',
                              icon: 'success',
                              confirmButtonText: 'Aceptar',
                              confirmButtonColor: '#3B82F6'
                         });
                    },
                    error: (error) => {
                         console.error('Error creating supplier:', error);
                         this.closeModals();

                         // Verificar si es un error de duplicado
                         const errorMessage = error?.error?.error?.message || error?.message || '';
                         if (errorMessage.includes('duplicate key') || errorMessage.includes('uk_supplier_name_org')) {
                              Swal.fire({
                                   title: 'Proveedor duplicado',
                                   text: `Ya existe un proveedor con el nombre "${this.supplierForm.supplierName}" en esta organización. Por favor, utilice un nombre diferente.`,
                                   icon: 'warning',
                                   confirmButtonText: 'Entendido',
                                   confirmButtonColor: '#F59E0B'
                              });
                         } else {
                              Swal.fire({
                                   title: 'Error',
                                   text: 'No se pudo crear el proveedor. Por favor, intente nuevamente.',
                                   icon: 'error',
                                   confirmButtonText: 'Aceptar',
                                   confirmButtonColor: '#DC2626'
                              });
                         }
                    }
               });
     }

     updateSupplier(): void {
          if (!this.selectedSupplier || !this.isFormValid()) return;

          // Validar email si se proporciona
          if (this.supplierForm.email && !this.isValidEmail(this.supplierForm.email)) {
               this.showErrorAlert('Email inválido', 'Por favor, ingrese un email válido.');
               return;
          }

          // Validar si ya existe otro proveedor con el mismo nombre (excluyendo el actual)
          const existingSupplier = this.suppliers.find(supplier =>
               supplier.supplierId !== this.selectedSupplier!.supplierId &&
               supplier.supplierName.toLowerCase().trim() === this.supplierForm.supplierName?.toLowerCase().trim()
          );
          if (existingSupplier) {
               this.showErrorAlert(
                    'Proveedor duplicado',
                    `Ya existe otro proveedor con el nombre "${this.supplierForm.supplierName}". Por favor, utilice un nombre diferente.`
               );
               return;
          }

          // Mostrar loading
          Swal.fire({
               title: 'Actualizando proveedor...',
               text: 'Por favor espere',
               allowOutsideClick: false,
               didOpen: () => {
                    Swal.showLoading();
               }
          });

          this.inventoryService.updateSupplier(this.selectedSupplier.supplierId, this.supplierForm as SupplierRequest)
               .pipe(takeUntil(this.destroy$))
               .subscribe({
                    next: () => {
                         this.closeModals();
                         this.loadSuppliers();
                         Swal.fire({
                              title: '¡Actualizado!',
                              text: 'El proveedor ha sido actualizado exitosamente',
                              icon: 'success',
                              confirmButtonText: 'Aceptar',
                              confirmButtonColor: '#3B82F6'
                         });
                    },
                    error: (error) => {
                         console.error('Error updating supplier:', error);
                         this.closeModals();

                         // Verificar si es un error de duplicado
                         const errorMessage = error?.error?.error?.message || error?.message || '';
                         if (errorMessage.includes('duplicate key') || errorMessage.includes('uk_supplier_name_org')) {
                              Swal.fire({
                                   title: 'Proveedor duplicado',
                                   text: `Ya existe un proveedor con el nombre "${this.supplierForm.supplierName}" en esta organización. Por favor, utilice un nombre diferente.`,
                                   icon: 'warning',
                                   confirmButtonText: 'Entendido',
                                   confirmButtonColor: '#F59E0B'
                              });
                         } else {
                              Swal.fire({
                                   title: 'Error',
                                   text: 'No se pudo actualizar el proveedor. Por favor, intente nuevamente.',
                                   icon: 'error',
                                   confirmButtonText: 'Aceptar',
                                   confirmButtonColor: '#DC2626'
                              });
                         }
                    }
               });
     }

     deleteSupplier(): void {
          if (!this.selectedSupplier) return;

          // Mostrar loading
          Swal.fire({
               title: 'Eliminando proveedor...',
               text: 'Por favor espere',
               allowOutsideClick: false,
               didOpen: () => {
                    Swal.showLoading();
               }
          });

          this.inventoryService.deleteSupplier(this.selectedSupplier.supplierId)
               .pipe(takeUntil(this.destroy$))
               .subscribe({
                    next: () => {
                         this.closeModals();
                         this.loadSuppliers();
                         Swal.fire({
                              title: '¡Eliminado!',
                              text: 'El proveedor ha sido eliminado exitosamente',
                              icon: 'success',
                              confirmButtonText: 'Aceptar',
                              confirmButtonColor: '#10B981'
                         });
                    },
                    error: (error) => {
                         console.error('Error deleting supplier:', error);
                         this.closeModals();
                         Swal.fire({
                              title: 'Error',
                              text: 'No se pudo eliminar el proveedor. Por favor, intente nuevamente.',
                              icon: 'error',
                              confirmButtonText: 'Aceptar',
                              confirmButtonColor: '#DC2626'
                         });
                    }
               });
     }

     restoreSupplier(supplier: SupplierResponse): void {
          Swal.fire({
               title: '¿Restaurar Proveedor?',
               text: `¿Está seguro de que desea restaurar el proveedor "${supplier.supplierName}"?`,
               icon: 'question',
               showCancelButton: true,
               confirmButtonColor: '#10B981',
               cancelButtonColor: '#6B7280',
               confirmButtonText: 'Sí, restaurar',
               cancelButtonText: 'Cancelar'
          }).then((result) => {
               if (result.isConfirmed) {
                    // Mostrar loading
                    Swal.fire({
                         title: 'Restaurando proveedor...',
                         text: 'Por favor espere',
                         allowOutsideClick: false,
                         didOpen: () => {
                              Swal.showLoading();
                         }
                    });

                    this.inventoryService.restoreSupplier(supplier.supplierId)
                         .pipe(takeUntil(this.destroy$))
                         .subscribe({
                              next: () => {
                                   this.loadSuppliers();
                                   Swal.fire({
                                        title: '¡Restaurado!',
                                        text: 'El proveedor ha sido restaurado exitosamente',
                                        icon: 'success',
                                        confirmButtonText: 'Aceptar',
                                        confirmButtonColor: '#10B981'
                                   });
                              },
                              error: (error) => {
                                   console.error('Error restoring supplier:', error);
                                   Swal.fire({
                                        title: 'Error',
                                        text: 'No se pudo restaurar el proveedor. Por favor, intente nuevamente.',
                                        icon: 'error',
                                        confirmButtonText: 'Aceptar',
                                        confirmButtonColor: '#DC2626'
                                   });
                              }
                         });
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

     isValidEmail(email: string): boolean {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(email);
     }

     generateSupplierCode(): string {
          // Buscar códigos existentes con ambos prefijos (SUP y PROV)
          const existingPROVCodes = this.suppliers
               .map(supp => supp.supplierCode)
               .filter(code => code.startsWith('PROV'))
               .map(code => parseInt(code.substring(4)))
               .filter(num => !isNaN(num));

          const existingSUPCodes = this.suppliers
               .map(supp => supp.supplierCode)
               .filter(code => code.startsWith('SUP'))
               .map(code => parseInt(code.substring(3)))
               .filter(num => !isNaN(num));

          // Combinar todos los números existentes para evitar duplicados
          const allExistingNumbers = [...existingPROVCodes, ...existingSUPCodes];

          const nextNumber = allExistingNumbers.length > 0 ? Math.max(...allExistingNumbers) + 1 : 1;
          return `PROV${nextNumber.toString().padStart(3, '0')}`;
     }

     getStatusBadgeClass(status: SupplierStatus): string {
          switch (status) {
               case SupplierStatus.ACTIVO:
                    return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
               case SupplierStatus.INACTIVO:
                    return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
               case SupplierStatus.BLOQUEADO:
                    return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
               default:
                    return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300';
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

     showErrorAlert(title: string, message: string): void {
          Swal.fire({
               title: title,
               text: message,
               icon: 'error',
               confirmButtonText: 'Aceptar',
               confirmButtonColor: '#DC2626'
          });
     }

     refresh(): void {
          this.loadSuppliers();
     }
}
