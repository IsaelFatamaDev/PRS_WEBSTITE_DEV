import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';

import { InventoryService } from '../../../../core/services/inventory.service';
import { OrganizationContextService } from '../../../../core/services/organization-context.service';
import {
     ProductResponse,
     ProductRequest,
     ProductStatus,
     UnitOfMeasure,
     ProductCategoryResponse
} from '../../../../core/models/inventory.model';

// Tipo para el formulario interno
interface ProductForm {
     productCode?: string;
     productName: string;
     categoryId: string;
     unitOfMeasure: UnitOfMeasure;
     minimumStock: number;
     maximumStock: number;
     currentStock: number;
     unitCost: number;
     // Status removido - siempre será ACTIVO por defecto
}

@Component({
     selector: 'app-product-form-page',
     standalone: true,
     imports: [CommonModule, FormsModule],
     templateUrl: './product-form-page.component.html',
     styleUrls: ['./product-form-page.component.css']
})
export class ProductFormPageComponent implements OnInit, OnDestroy {
     private destroy$ = new Subject<void>();

     isEditMode = false;
     productId: string | null = null;
     organizationId: string | null = null;
     currentUserId: string | null = null;
     loading = true;
     saving = false;
     error: string | null = null;

     // Data arrays
     categories: ProductCategoryResponse[] = [];

     // Enums para el template
     ProductStatus = ProductStatus;
     UnitOfMeasure = UnitOfMeasure;

     // Form data
     productForm: ProductForm = {
          productName: '',
          categoryId: '',
          unitOfMeasure: UnitOfMeasure.UNIDAD,
          minimumStock: 1,
          maximumStock: 1,
          currentStock: 0,
          unitCost: 0.01
     };

     constructor(
          private route: ActivatedRoute,
          private router: Router,
          private inventoryService: InventoryService,
          private organizationContextService: OrganizationContextService
     ) { }

     ngOnInit(): void {
          // Obtener datos del contexto
          this.organizationId = this.organizationContextService.getCurrentOrganizationId();
          this.currentUserId = this.organizationContextService.getCurrentUserId();

          if (!this.organizationId || !this.currentUserId) {
               this.error = 'No se encontró información de la organización o usuario';
               this.loading = false;
               return;
          }

          // Verificar si es modo edición
          this.productId = this.route.snapshot.paramMap.get('id');
          this.isEditMode = !!this.productId;

          this.loadData();
     }

     ngOnDestroy(): void {
          this.destroy$.next();
          this.destroy$.complete();
     }

     private loadData(): void {
          this.loading = true;
          this.error = null;

          // Cargar categorías y productos
          Promise.all([
               this.inventoryService.getCategories(this.organizationId!).toPromise(),
               this.inventoryService.getProducts(this.organizationId!).toPromise()
          ]).then(([categories, products]) => {
               this.categories = (categories || []).filter(c => c.status === 'ACTIVO');

               // Generar código de producto automáticamente si es creación
               if (!this.isEditMode) {
                    this.generateProductCode(products || []);
               }

               // Si es modo edición, cargar el producto
               if (this.isEditMode && this.productId) {
                    this.loadProduct();
               } else {
                    this.loading = false;
               }
          }).catch(error => {
               console.error('Error loading data:', error);
               this.error = 'Error al cargar los datos';
               this.loading = false;
          });
     }

     /**
      * Generar código de producto automáticamente
      */
     private generateProductCode(existingProducts: ProductResponse[]): void {
          // Extraer números de códigos existentes
          const existingNumbers = existingProducts
               .map(p => {
                    const match = p.productCode.match(/PROD(\d+)/);
                    return match ? parseInt(match[1], 10) : 0;
               })
               .filter(num => num > 0);

          // Encontrar el siguiente número disponible
          const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;

          // Formatear con ceros a la izquierda (PROD001, PROD002, etc.)
          const formattedNumber = nextNumber.toString().padStart(3, '0');
          this.productForm.productCode = `PROD${formattedNumber}`;
     }

     private loadProduct(): void {
          if (!this.productId) return;

          this.inventoryService.getProductById(this.productId)
               .pipe(takeUntil(this.destroy$))
               .subscribe({
                    next: (product) => {
                         this.populateForm(product);
                         this.loading = false;
                    },
                    error: (error) => {
                         console.error('Error loading product:', error);
                         this.error = 'Error al cargar el producto';
                         this.loading = false;
                    }
               });
     }

     private populateForm(product: ProductResponse): void {
          this.productForm = {
               productCode: product.productCode,
               productName: product.productName,
               categoryId: product.categoryId,
               unitOfMeasure: product.unitOfMeasure,
               minimumStock: product.minimumStock || 1,
               maximumStock: product.maximumStock || 1,
               currentStock: product.currentStock || 0,
               unitCost: product.unitCost || 0.01
               // Status removido - siempre será ACTIVO
          };
     }

     // Validaciones
     isFormValid(): boolean {
          return !!(
               this.productForm.productCode &&
               this.productForm.productCode.trim() !== '' &&
               this.productForm.productName &&
               this.productForm.productName.trim() !== '' &&
               this.productForm.categoryId &&
               this.productForm.categoryId.trim() !== '' &&
               this.productForm.unitOfMeasure &&
               this.productForm.unitCost > 0 &&
               this.productForm.minimumStock > 0 &&
               this.productForm.maximumStock > 0 &&
               this.productForm.minimumStock <= this.productForm.maximumStock &&
               this.productForm.currentStock >= 0
          );
     }

     // Envío del formulario
     async onSubmit(): Promise<void> {
          if (this.saving) return;

          // Validaciones específicas
          if (!this.productForm.productName || this.productForm.productName.trim() === '') {
               Swal.fire({
                    icon: 'warning',
                    title: 'Nombre requerido',
                    text: 'Debes ingresar el nombre del producto',
                    confirmButtonText: 'Entendido'
               });
               return;
          }

          // Validar producto duplicado por nombre
          if (await this.isProductNameDuplicated()) {
               Swal.fire({
                    icon: 'warning',
                    title: 'Producto duplicado',
                    text: 'Ya existe un producto con este nombre en la organización',
                    confirmButtonText: 'Entendido'
               });
               return;
          } if (!this.productForm.categoryId || this.productForm.categoryId.trim() === '') {
               Swal.fire({
                    icon: 'warning',
                    title: 'Categoría requerida',
                    text: 'Debes seleccionar una categoría',
                    confirmButtonText: 'Entendido'
               });
               return;
          }

          if (this.productForm.unitCost <= 0) {
               Swal.fire({
                    icon: 'warning',
                    title: 'Costo inválido',
                    text: 'El costo unitario debe ser mayor a 0',
                    confirmButtonText: 'Entendido'
               });
               return;
          }

          if (this.productForm.minimumStock <= 0) {
               Swal.fire({
                    icon: 'warning',
                    title: 'Stock mínimo inválido',
                    text: 'El stock mínimo debe ser mayor a 0',
                    confirmButtonText: 'Entendido'
               });
               return;
          }

          if (this.productForm.maximumStock <= 0) {
               Swal.fire({
                    icon: 'warning',
                    title: 'Stock máximo inválido',
                    text: 'El stock máximo debe ser mayor a 0',
                    confirmButtonText: 'Entendido'
               });
               return;
          }

          if (this.productForm.minimumStock > this.productForm.maximumStock) {
               Swal.fire({
                    icon: 'warning',
                    title: 'Stock inválido',
                    text: 'El stock mínimo no puede ser mayor al stock máximo',
                    confirmButtonText: 'Entendido'
               });
               return;
          } if (!this.isFormValid()) {
               Swal.fire({
                    icon: 'warning',
                    title: 'Formulario incompleto',
                    text: 'Por favor, completa todos los campos obligatorios',
                    confirmButtonText: 'Entendido'
               });
               return;
          }

          // Mostrar confirmación antes de guardar
          const action = this.isEditMode ? 'actualizar' : 'crear';
          Swal.fire({
               title: `¿${action.charAt(0).toUpperCase() + action.slice(1)} el producto?`,
               text: `Se va a ${action} el producto ${this.productForm.productCode}`,
               icon: 'question',
               showCancelButton: true,
               confirmButtonColor: '#3085d6',
               cancelButtonColor: '#d33',
               confirmButtonText: `Sí, ${action}`,
               cancelButtonText: 'Cancelar'
          }).then((result) => {
               if (result.isConfirmed) {
                    this.saving = true;
                    this.error = null;
                    this.submitProduct();
               }
          });
     }

     private submitProduct(): void {
          const productRequest: ProductRequest = {
               organizationId: this.organizationId!,
               productCode: this.productForm.productCode!,
               productName: this.productForm.productName,
               categoryId: this.productForm.categoryId,
               unitOfMeasure: this.productForm.unitOfMeasure,
               minimumStock: this.productForm.minimumStock,
               maximumStock: this.productForm.maximumStock,
               currentStock: this.productForm.currentStock,
               unitCost: this.productForm.unitCost,
               status: ProductStatus.ACTIVO // Siempre ACTIVO por defecto
          };

          console.log('Enviando datos:', productRequest);

          const operation = this.isEditMode
               ? this.inventoryService.updateProduct(this.productId!, productRequest)
               : this.inventoryService.createProduct(productRequest);

          operation.pipe(takeUntil(this.destroy$)).subscribe({
               next: () => {
                    this.saving = false;
                    const action = this.isEditMode ? 'actualizado' : 'creado';

                    Swal.fire({
                         icon: 'success',
                         title: '¡Éxito!',
                         text: `El producto ha sido ${action} correctamente`,
                         confirmButtonText: 'Continuar'
                    }).then(() => {
                         this.router.navigate(['/admin/inventory/products']);
                    });
               },
               error: (error) => {
                    console.error('Error saving product:', error);
                    this.saving = false;

                    let errorMessage = this.isEditMode ? 'Error al actualizar el producto' : 'Error al crear el producto';

                    // Manejar errores específicos
                    if (error.status === 400 && error.error?.message) {
                         errorMessage = error.error.message;
                    } else if (error.status === 409) {
                         errorMessage = 'Ya existe un producto con este código';
                    }

                    Swal.fire({
                         icon: 'error',
                         title: 'Error',
                         text: errorMessage,
                         confirmButtonText: 'Entendido'
                    });
               }
          });
     }

     /**
      * Validar si el nombre del producto ya existe en la organización
      */
     private async isProductNameDuplicated(): Promise<boolean> {
          try {
               const products = await this.inventoryService.getProducts(this.organizationId!).toPromise();
               if (!products) return false;

               // Si es modo edición, excluir el producto actual de la validación
               const filteredProducts = this.isEditMode
                    ? products.filter(p => p.productId !== this.productId)
                    : products;

               // Verificar si existe un producto con el mismo nombre (case insensitive)
               return filteredProducts.some(product =>
                    product.productName.toLowerCase().trim() === this.productForm.productName.toLowerCase().trim()
               );
          } catch (error) {
               console.error('Error validating product name:', error);
               return false; // En caso de error, permitir continuar
          }
     }

     // Navegación
     goBack(): void {
          this.router.navigate(['/admin/inventory/products']);
     }

     // Métodos auxiliares
     getCategoryName(categoryId: string): string {
          const category = this.categories.find(c => c.categoryId === categoryId);
          return category ? category.categoryName : 'Categoría no encontrada';
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
}
