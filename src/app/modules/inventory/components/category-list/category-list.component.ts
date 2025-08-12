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
     ProductCategoryResponse,
     GeneralStatus,
     ProductCategoryRequest
} from '../../../../core/models/inventory.model';

@Component({
     selector: 'app-category-list',
     standalone: true,
     imports: [CommonModule, FormsModule],
     templateUrl: './category-list.component.html',
     styleUrls: ['./category-list.component.css']
})
export class CategoryListComponent implements OnInit, OnDestroy {
     private destroy$ = new Subject<void>();

     categories: ProductCategoryResponse[] = [];
     filteredCategories: ProductCategoryResponse[] = [];
     loading = true;
     error: string | null = null;

     // Filtros
     searchTerm = '';
     selectedStatus: GeneralStatus | 'ALL' = 'ALL';

     // Modal states
     showCreateModal = false;
     showEditModal = false;
     showDeleteModal = false;
     selectedCategory: ProductCategoryResponse | null = null;

     // Form data
     categoryForm: Partial<ProductCategoryRequest> = {};

     // Pagination (si es necesario en el futuro)
     currentPage = 1;
     pageSize = 10;

     // Enums para el template
     GeneralStatus = GeneralStatus;

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

          this.loadCategories();
     }

     ngOnDestroy(): void {
          this.destroy$.next();
          this.destroy$.complete();
     }

     private loadCategoriesWithProductCount(): Promise<void> {
          return Promise.all([
               this.inventoryService.getCategories(this.organizationId!).toPromise(),
               this.inventoryService.getProducts(this.organizationId!).toPromise()
          ]).then(([categories, products]) => {
               if (categories && products) {
                    // Calcular productCount para cada categoría
                    const categoriesWithCount = categories.map(category => {
                         const productCount = products.filter(product =>
                              product.categoryId === category.categoryId
                         ).length;

                         return {
                              ...category,
                              productCount: productCount
                         };
                    });

                    // Ordenar por código de forma ascendente
                    this.categories = categoriesWithCount.sort((a, b) => a.categoryCode.localeCompare(b.categoryCode));
                    this.applyFilters();
               }
          });
     } loadCategories(): void {
          this.loading = true;
          this.error = null;

          this.loadCategoriesWithProductCount()
               .then(() => {
                    this.loading = false;
               })
               .catch(error => {
                    console.error('Error loading categories or products:', error);
                    this.error = 'Error al cargar las categorías';
                    this.loading = false;
                    this.showErrorAlert('Error al cargar categorías', 'No se pudieron cargar las categorías. Por favor, intente nuevamente.');
               });
     } applyFilters(): void {
          let filtered = [...this.categories];

          // Filter by search term
          if (this.searchTerm) {
               const search = this.searchTerm.toLowerCase();
               filtered = filtered.filter(category =>
                    category.categoryName.toLowerCase().includes(search) ||
                    category.categoryCode.toLowerCase().includes(search) ||
                    (category.description && category.description.toLowerCase().includes(search))
               );
          }

          // Filter by status
          if (this.selectedStatus !== 'ALL') {
               filtered = filtered.filter(category => category.status === this.selectedStatus);
          }

          this.filteredCategories = filtered;
     }

     onSearchChange(): void {
          this.applyFilters();
     }

     onStatusChange(): void {
          this.applyFilters();
     }

     // CRUD Operations
     openCreateModal(): void {
          this.categoryForm = {
               organizationId: this.organizationId!,
               categoryCode: this.generateCategoryCode(), // Generar código automáticamente
               status: GeneralStatus.ACTIVO // Estado por defecto
          };
          this.showCreateModal = true;
     }

     openEditModal(category: ProductCategoryResponse): void {
          this.selectedCategory = category;
          this.categoryForm = {
               organizationId: category.organizationId,
               categoryCode: category.categoryCode,
               categoryName: category.categoryName,
               description: category.description
               // No incluir status ya que no se debe editar
          };
          this.showEditModal = true;
     }

     openDeleteModal(category: ProductCategoryResponse): void {
          this.selectedCategory = category;
          this.showDeleteModal = true;
     }

     closeModals(): void {
          this.showCreateModal = false;
          this.showEditModal = false;
          this.showDeleteModal = false;
          this.selectedCategory = null;
          this.categoryForm = {};
     }

     createCategory(): void {
          if (!this.isFormValid()) return;

          // Mostrar loading
          Swal.fire({
               title: 'Creando categoría...',
               text: 'Por favor espere',
               allowOutsideClick: false,
               didOpen: () => {
                    Swal.showLoading();
               }
          });

          this.inventoryService.createCategory(this.categoryForm as ProductCategoryRequest)
               .pipe(takeUntil(this.destroy$))
               .subscribe({
                    next: () => {
                         this.closeModals();
                         this.loadCategories();
                         Swal.fire({
                              title: '¡Éxito!',
                              text: 'La categoría ha sido creada exitosamente',
                              icon: 'success',
                              confirmButtonText: 'Aceptar',
                              confirmButtonColor: '#3B82F6'
                         });
                    },
                    error: (error) => {
                         console.error('Error creating category:', error);
                         this.closeModals();
                         Swal.fire({
                              title: 'Error',
                              text: 'No se pudo crear la categoría. Por favor, intente nuevamente.',
                              icon: 'error',
                              confirmButtonText: 'Aceptar',
                              confirmButtonColor: '#DC2626'
                         });
                    }
               });
     }

     updateCategory(): void {
          if (!this.selectedCategory || !this.isFormValid()) return;

          // Mostrar loading
          Swal.fire({
               title: 'Actualizando categoría...',
               text: 'Por favor espere',
               allowOutsideClick: false,
               didOpen: () => {
                    Swal.showLoading();
               }
          });

          this.inventoryService.updateCategory(this.selectedCategory.categoryId, this.categoryForm as ProductCategoryRequest)
               .pipe(takeUntil(this.destroy$))
               .subscribe({
                    next: () => {
                         this.closeModals();
                         this.loadCategories();
                         Swal.fire({
                              title: '¡Actualizado!',
                              text: 'La categoría ha sido actualizada exitosamente',
                              icon: 'success',
                              confirmButtonText: 'Aceptar',
                              confirmButtonColor: '#3B82F6'
                         });
                    },
                    error: (error) => {
                         console.error('Error updating category:', error);
                         this.closeModals();
                         Swal.fire({
                              title: 'Error',
                              text: 'No se pudo actualizar la categoría. Por favor, intente nuevamente.',
                              icon: 'error',
                              confirmButtonText: 'Aceptar',
                              confirmButtonColor: '#DC2626'
                         });
                    }
               });
     }

     deleteCategory(): void {
          if (!this.selectedCategory) return;

          // Mostrar loading
          Swal.fire({
               title: 'Eliminando categoría...',
               text: 'Por favor espere',
               allowOutsideClick: false,
               didOpen: () => {
                    Swal.showLoading();
               }
          });

          this.inventoryService.deleteCategory(this.selectedCategory.categoryId)
               .pipe(takeUntil(this.destroy$))
               .subscribe({
                    next: () => {
                         this.closeModals();
                         this.loadCategories();
                         Swal.fire({
                              title: '¡Eliminado!',
                              text: 'La categoría ha sido eliminada exitosamente',
                              icon: 'success',
                              confirmButtonText: 'Aceptar',
                              confirmButtonColor: '#10B981'
                         });
                    },
                    error: (error) => {
                         console.error('Error deleting category:', error);
                         this.closeModals();
                         Swal.fire({
                              title: 'Error',
                              text: 'No se pudo eliminar la categoría. Por favor, intente nuevamente.',
                              icon: 'error',
                              confirmButtonText: 'Aceptar',
                              confirmButtonColor: '#DC2626'
                         });
                    }
               });
     }

     restoreCategory(category: ProductCategoryResponse): void {
          Swal.fire({
               title: '¿Restaurar Categoría?',
               text: `¿Está seguro de que desea restaurar la categoría "${category.categoryName}"?`,
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
                         title: 'Restaurando categoría...',
                         text: 'Por favor espere',
                         allowOutsideClick: false,
                         didOpen: () => {
                              Swal.showLoading();
                         }
                    });

                    this.inventoryService.restoreCategory(category.categoryId)
                         .pipe(takeUntil(this.destroy$))
                         .subscribe({
                              next: () => {
                                   this.loadCategories();
                                   Swal.fire({
                                        title: '¡Restaurado!',
                                        text: 'La categoría ha sido restaurada exitosamente',
                                        icon: 'success',
                                        confirmButtonText: 'Aceptar',
                                        confirmButtonColor: '#10B981'
                                   });
                              },
                              error: (error) => {
                                   console.error('Error restoring category:', error);
                                   Swal.fire({
                                        title: 'Error',
                                        text: 'No se pudo restaurar la categoría. Por favor, intente nuevamente.',
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
               this.categoryForm.categoryCode?.trim() &&
               this.categoryForm.categoryName?.trim() &&
               this.categoryForm.organizationId
          );
     }

     generateCategoryCode(): string {
          // Encontrar el último código numérico
          const existingCodes = this.categories
               .map(cat => cat.categoryCode)
               .filter(code => code.startsWith('CAT'))
               .map(code => parseInt(code.substring(3)))
               .filter(num => !isNaN(num));

          const nextNumber = existingCodes.length > 0 ? Math.max(...existingCodes) + 1 : 1;
          return `CAT${nextNumber.toString().padStart(3, '0')}`;
     }

     getStatusBadgeClass(status: GeneralStatus): string {
          switch (status) {
               case GeneralStatus.ACTIVO:
                    return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
               case GeneralStatus.INACTIVO:
                    return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
               case GeneralStatus.ARCHIVADO:
                    return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300';
               default:
                    return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300';
          }
     }

     getStatusText(status: GeneralStatus): string {
          switch (status) {
               case GeneralStatus.ACTIVO:
                    return 'Activo';
               case GeneralStatus.INACTIVO:
                    return 'Inactivo';
               case GeneralStatus.ARCHIVADO:
                    return 'Archivado';
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
          this.loadCategories();
     }
}
