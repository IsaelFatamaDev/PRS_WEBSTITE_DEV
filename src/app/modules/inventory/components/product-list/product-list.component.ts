import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { InventoryService } from '../../../../core/services/inventory.service';
import { OrganizationContextService } from '../../../../core/services/organization-context.service';
import {
  ProductResponse,
  ProductCategoryResponse,
  ProductStatus,
  UnitOfMeasure,
  ProductRequest
} from '../../../../core/models/inventory.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private inventoryService = inject(InventoryService);
  private organizationContextService = inject(OrganizationContextService);
  private router = inject(Router);

  products: ProductResponse[] = [];
  filteredProducts: ProductResponse[] = [];
  paginatedProducts: ProductResponse[] = [];
  categories: ProductCategoryResponse[] = [];
  loading = true;
  error: string | null = null;

  // Paginación
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  totalPages = 0;

  // Filtros
  searchTerm = '';
  selectedStatus: ProductStatus | 'ALL' = 'ALL';
  selectedCategory: string | 'ALL' = 'ALL';

  // Enums para el template
  ProductStatus = ProductStatus;
  UnitOfMeasure = UnitOfMeasure;
  Math = Math;

  organizationId: string | null = null;

  ngOnInit(): void {
    this.organizationId = this.organizationContextService.getCurrentOrganizationId();
    if (!this.organizationId) {
      this.error = 'No se encontró información de la organización';
      this.loading = false;
      return;
    }

    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData(): void {
    this.loading = true;
    this.error = null;

    // Cargar productos y categorías en paralelo
    Promise.all([
      this.inventoryService.getProducts(this.organizationId!).toPromise(),
      this.inventoryService.getCategories(this.organizationId!).toPromise()
    ]).then(([products, categories]) => {
      // Ordenar productos por código desde la carga inicial
      const sortedProducts = (products || []).sort((a, b) => {
        const getCodeNumber = (code: string): number => {
          const match = code.match(/PROD(\d+)/);
          return match ? parseInt(match[1], 10) : 999999;
        };
        return getCodeNumber(a.productCode) - getCodeNumber(b.productCode);
      });

      this.products = sortedProducts;
      this.categories = categories || [];
      this.applyFilters();
      this.loading = false;
    }).catch(error => {
      console.error('Error loading data:', error);
      this.error = 'Error al cargar los datos';
      this.loading = false;
    });
  }

  applyFilters(): void {
    let filtered = [...this.products];

    // Filter by search term
    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.productName.toLowerCase().includes(search) ||
        product.productCode.toLowerCase().includes(search) ||
        product.categoryName.toLowerCase().includes(search)
      );
    }

    // Filter by status
    if (this.selectedStatus !== 'ALL') {
      filtered = filtered.filter(product => product.status === this.selectedStatus);
    }

    // Filter by category
    if (this.selectedCategory !== 'ALL') {
      filtered = filtered.filter(product => product.categoryId === this.selectedCategory);
    }

    // Ordenar por código de producto (PROD001, PROD002, PROD003, etc.)
    filtered.sort((a, b) => {
      // Extraer número del código (PROD001 -> 1, PROD002 -> 2, etc.)
      const getCodeNumber = (code: string): number => {
        const match = code.match(/PROD(\d+)/);
        return match ? parseInt(match[1], 10) : 999999; // Si no coincide, al final
      };

      const numA = getCodeNumber(a.productCode);
      const numB = getCodeNumber(b.productCode);

      return numA - numB;
    });

    this.filteredProducts = filtered;
    this.currentPage = 1; // Reset a primera página cuando se aplican filtros
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalItems = this.filteredProducts.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedProducts = this.filteredProducts.slice(startIndex, endIndex);
  }

  // Métodos de navegación de paginación
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

    // Ajustar si no hay suficientes páginas al final
    if (endPage - startPage + 1 < maxPagesToShow && startPage > 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onStatusChange(): void {
    this.applyFilters();
  }

  onCategoryChange(): void {
    this.applyFilters();
  }

  // Navigation methods
  createProduct(): void {
    this.router.navigate(['/admin/inventory/products/new']);
  }

  editProduct(product: ProductResponse): void {
    if (!product.productId || product.productId.trim() === '') {
      Swal.fire({
        title: 'Error',
        text: 'ID de producto no válido',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#3B82F6'
      });
      return;
    }
    this.router.navigate(['/admin/inventory/products/edit', product.productId]);
  }

  viewProduct(product: ProductResponse): void {
    if (!product.productId || product.productId.trim() === '') {
      Swal.fire({
        title: 'Error',
        text: 'ID de producto no válido',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#3B82F6'
      });
      return;
    }
    this.router.navigate(['/admin/inventory/products/detail', product.productId]);
  }

  deleteProduct(product: ProductResponse): void {
    // Verificar si el producto puede ser eliminado
    if (!this.canDeleteProduct(product)) {
      Swal.fire({
        title: 'No se puede eliminar',
        text: 'No es posible eliminar este producto porque tiene stock disponible o está siendo utilizado en el sistema.',
        icon: 'warning',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#3B82F6'
      });
      return;
    }

    Swal.fire({
      title: '¿Eliminar Producto?',
      text: `¿Estás seguro de que deseas eliminar el producto "${product.productName}"?`,
      html: `
        <div class="text-left mt-4">
          <p><strong>Producto:</strong> ${product.productName}</p>
          <p><strong>Código:</strong> ${product.productCode}</p>
          <p><strong>Stock actual:</strong> ${product.currentStock || 0} ${product.unitOfMeasure}</p>
          <p class="text-red-600 font-medium mt-2">Esta acción no se puede deshacer.</p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DC2626',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      customClass: {
        popup: 'text-left'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.performDelete(product);
      }
    });
  }

  private canDeleteProduct(product: ProductResponse): boolean {
    // No permitir eliminar si tiene stock disponible
    if (product.currentStock && product.currentStock > 0) {
      return false;
    }

    // Aquí se pueden agregar más validaciones según las reglas de negocio
    return true;
  }

  private performDelete(product: ProductResponse): void {
    const loadingAlert = Swal.fire({
      title: 'Eliminando producto...',
      allowEscapeKey: false,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.inventoryService.deleteProduct(product.productId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          Swal.close();

          Swal.fire({
            title: '¡Eliminado!',
            text: `El producto "${product.productName}" ha sido eliminado exitosamente.`,
            icon: 'success',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#10B981'
          });

          this.loadData();
        },
        error: (error: any) => {
          Swal.close();
          console.error('Error al eliminar producto:', error);

          Swal.fire({
            title: 'Error',
            text: 'No se pudo eliminar el producto. Intente nuevamente.',
            icon: 'error',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#3B82F6'
          });
        }
      });
  } restoreProduct(product: ProductResponse): void {
    Swal.fire({
      title: '¿Restaurar Producto?',
      text: `¿Deseas restaurar el producto "${product.productName}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10B981',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Sí, restaurar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.performRestore(product);
      }
    });
  }

  private performRestore(product: ProductResponse): void {
    const loadingAlert = Swal.fire({
      title: 'Restaurando producto...',
      allowEscapeKey: false,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.inventoryService.restoreProduct(product.productId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          Swal.close();

          Swal.fire({
            title: '¡Restaurado!',
            text: `El producto "${product.productName}" ha sido restaurado exitosamente.`,
            icon: 'success',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#10B981'
          });

          this.loadData();
        },
        error: (error: any) => {
          Swal.close();
          console.error('Error al restaurar producto:', error);

          Swal.fire({
            title: 'Error',
            text: 'No se pudo restaurar el producto. Intente nuevamente.',
            icon: 'error',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#3B82F6'
          });
        }
      });
  } getStatusBadgeClass(status: ProductStatus): string {
    switch (status) {
      case ProductStatus.ACTIVO:
        return 'bg-green-100 text-green-800';
      case ProductStatus.INACTIVO:
        return 'bg-red-100 text-red-800';
      case ProductStatus.DESCONTINUADO:
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusText(status: ProductStatus): string {
    switch (status) {
      case ProductStatus.ACTIVO:
        return 'Activo';
      case ProductStatus.INACTIVO:
        return 'Inactivo';
      case ProductStatus.DESCONTINUADO:
        return 'Descontinuado';
      default:
        return status;
    }
  }

  getStockStatusClass(product: ProductResponse): string {
    if (!product.currentStock || product.currentStock === 0) {
      return 'text-red-600 font-semibold';
    } else if (product.minimumStock && product.currentStock <= product.minimumStock) {
      return 'text-yellow-600 font-semibold';
    }
    return 'text-green-600';
  }

  getStockStatusText(product: ProductResponse): string {
    if (!product.currentStock || product.currentStock === 0) {
      return 'Sin stock';
    } else if (product.minimumStock && product.currentStock <= product.minimumStock) {
      return 'Stock bajo';
    }
    return 'Stock normal';
  }

  getUnitOfMeasureText(unit: UnitOfMeasure): string {
    switch (unit) {
      case UnitOfMeasure.UNIDAD:
        return 'Unidad';
      case UnitOfMeasure.KG:
        return 'Kilogramo';
      case UnitOfMeasure.LITRO:
        return 'Litro';
      case UnitOfMeasure.METRO:
        return 'Metro';
      case UnitOfMeasure.M2:
        return 'Metro²';
      case UnitOfMeasure.M3:
        return 'Metro³';
      case UnitOfMeasure.CAJA:
        return 'Caja';
      case UnitOfMeasure.PAR:
        return 'Par';
      default:
        return unit;
    }
  }

  refresh(): void {
    this.loadData();
  }
}
