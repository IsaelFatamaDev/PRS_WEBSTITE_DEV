import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductResponse } from '../../../../core/models/inventory.model';
import { InventoryService } from '../../../../core/services/inventory.service';
import Swal from 'sweetalert2';

@Component({
     selector: 'app-product-detail-page',
     standalone: true,
     imports: [CommonModule],
     templateUrl: './product-detail-page.component.html',
     styleUrls: ['./product-detail-page.component.css']
})
export class ProductDetailPageComponent implements OnInit {
     private route = inject(ActivatedRoute);
     private router = inject(Router);
     private inventoryService = inject(InventoryService);

     product: ProductResponse | null = null;
     isLoading = false;

     ngOnInit(): void {
          const id = this.route.snapshot.paramMap.get('id');
          console.log('ProductDetailPage - ID recibido:', id);

          if (id && id.trim() !== '') {
               this.loadProduct(id);
          } else {
               this.showErrorAndRedirect('ID de producto no válido');
          }
     }

     private loadProduct(id: string): void {
          console.log('ProductDetailPage - Cargando producto con ID:', id);
          this.isLoading = true;

          this.inventoryService.getProductById(id).subscribe({
               next: (response: any) => {
                    console.log('ProductDetailPage - Respuesta del backend:', response);

                    // Verificar si la respuesta tiene el formato esperado
                    if (response && response.data) {
                         this.product = response.data;
                    } else if (response && response.productId) {
                         // Si la respuesta es directamente el producto
                         this.product = response;
                    } else {
                         console.error('Formato de respuesta inesperado:', response);
                         this.showErrorAndRedirect('Producto no encontrado');
                    }
                    this.isLoading = false;
               },
               error: (error: any) => {
                    console.error('Error al cargar producto:', error);
                    this.showErrorAndRedirect('Error al cargar el producto');
                    this.isLoading = false;
               }
          });
     }

     private showErrorAndRedirect(message: string): void {
          Swal.fire({
               title: 'Error',
               text: message,
               icon: 'error',
               confirmButtonText: 'Aceptar',
               confirmButtonColor: '#3B82F6'
          }).then(() => {
               this.goBack();
          });
     }

     editProduct(): void {
          if (this.product?.productId) {
               this.router.navigate(['/admin/inventory/products/edit', this.product.productId]);
          }
     }

     deleteProduct(): void {
          if (!this.product?.productId) return;

          Swal.fire({
               title: '¿Eliminar Producto?',
               text: `¿Estás seguro de que deseas eliminar el producto "${this.product.productName}"? Esta acción no se puede deshacer.`,
               icon: 'warning',
               showCancelButton: true,
               confirmButtonColor: '#DC2626',
               cancelButtonColor: '#6B7280',
               confirmButtonText: 'Sí, eliminar',
               cancelButtonText: 'Cancelar',
               reverseButtons: true
          }).then((result) => {
               if (result.isConfirmed && this.product?.productId) {
                    this.performDelete(this.product.productId);
               }
          });
     }

     private performDelete(productId: string): void {
          this.isLoading = true;

          this.inventoryService.deleteProduct(productId).subscribe({
               next: (response: any) => {
                    this.isLoading = false;

                    Swal.fire({
                         title: '¡Eliminado!',
                         text: 'El producto ha sido eliminado exitosamente.',
                         icon: 'success',
                         confirmButtonText: 'Aceptar',
                         confirmButtonColor: '#10B981'
                    }).then(() => {
                         this.router.navigate(['/admin/inventory/products']);
                    });
               },
               error: (error: any) => {
                    this.isLoading = false;
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
     }

     goBack(): void {
          this.router.navigate(['/admin/inventory/products']);
     }

     // Métodos de utilidad para el template
     getStockStatusClass(): string {
          if (!this.product) return '';

          if (this.product.currentStock === 0) return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800';
          if (this.product.currentStock! <= 10) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800';
          return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800';
     }

     getStockStatusText(): string {
          if (!this.product) return '';

          if (this.product.currentStock === 0) return 'Sin Stock';
          if (this.product.currentStock! <= 10) return 'Stock Bajo';
          return 'Disponible';
     }

     formatCurrency(value: number): string {
          return new Intl.NumberFormat('es-PE', {
               style: 'currency',
               currency: 'PEN'
          }).format(value);
     }

     formatDate(date: string): string {
          return new Date(date).toLocaleDateString('es-PE', {
               year: 'numeric',
               month: 'long',
               day: 'numeric'
          });
     }
}
