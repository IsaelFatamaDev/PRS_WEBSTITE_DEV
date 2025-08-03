import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
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

     loadCategories(): void {
          this.loading = true;
          this.error = null;

          this.inventoryService.getCategories(this.organizationId!)
               .pipe(takeUntil(this.destroy$))
               .subscribe({
                    next: (categories) => {
                         this.categories = categories;
                         this.applyFilters();
                         this.loading = false;
                    },
                    error: (error) => {
                         console.error('Error loading categories:', error);
                         this.error = 'Error al cargar las categorías';
                         this.loading = false;
                    }
               });
     }

     applyFilters(): void {
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
               status: GeneralStatus.ACTIVO
          };
          this.showCreateModal = true;
     }

     openEditModal(category: ProductCategoryResponse): void {
          this.selectedCategory = category;
          this.categoryForm = {
               organizationId: category.organizationId,
               categoryCode: category.categoryCode,
               categoryName: category.categoryName,
               description: category.description,
               status: category.status
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

          this.inventoryService.createCategory(this.categoryForm as ProductCategoryRequest)
               .pipe(takeUntil(this.destroy$))
               .subscribe({
                    next: () => {
                         this.closeModals();
                         this.loadCategories();
                    },
                    error: (error) => {
                         console.error('Error creating category:', error);
                         this.error = 'Error al crear la categoría';
                    }
               });
     }

     updateCategory(): void {
          if (!this.selectedCategory || !this.isFormValid()) return;

          this.inventoryService.updateCategory(this.selectedCategory.categoryId, this.categoryForm as ProductCategoryRequest)
               .pipe(takeUntil(this.destroy$))
               .subscribe({
                    next: () => {
                         this.closeModals();
                         this.loadCategories();
                    },
                    error: (error) => {
                         console.error('Error updating category:', error);
                         this.error = 'Error al actualizar la categoría';
                    }
               });
     }

     deleteCategory(): void {
          if (!this.selectedCategory) return;

          this.inventoryService.deleteCategory(this.selectedCategory.categoryId)
               .pipe(takeUntil(this.destroy$))
               .subscribe({
                    next: () => {
                         this.closeModals();
                         this.loadCategories();
                    },
                    error: (error) => {
                         console.error('Error deleting category:', error);
                         this.error = 'Error al eliminar la categoría';
                    }
               });
     }

     restoreCategory(category: ProductCategoryResponse): void {
          this.inventoryService.restoreCategory(category.categoryId)
               .pipe(takeUntil(this.destroy$))
               .subscribe({
                    next: () => {
                         this.loadCategories();
                    },
                    error: (error) => {
                         console.error('Error restoring category:', error);
                         this.error = 'Error al restaurar la categoría';
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

     getStatusBadgeClass(status: GeneralStatus): string {
          switch (status) {
               case GeneralStatus.ACTIVO:
                    return 'bg-green-100 text-green-800';
               case GeneralStatus.INACTIVO:
                    return 'bg-red-100 text-red-800';
               case GeneralStatus.ARCHIVADO:
                    return 'bg-gray-100 text-gray-800';
               default:
                    return 'bg-gray-100 text-gray-800';
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

     refresh(): void {
          this.loadCategories();
     }
}
