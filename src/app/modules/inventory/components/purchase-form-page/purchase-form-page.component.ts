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
     PurchaseResponse,
     PurchaseRequest,
     PurchaseDetailRequest,
     PurchaseStatus,
     SupplierResponse,
     ProductResponse
} from '../../../../core/models/inventory.model';// Tipo para el formulario interno
interface PurchaseDetailForm {
     productId: string;
     quantity: number;
     unitPrice: number;
     observations?: string;
}

interface PurchaseForm {
     purchaseCode?: string;
     supplierId: string;
     purchaseDate: string;
     deliveryDate?: string;
     requestedByUserId: string;
     invoiceNumber?: string;
     observations?: string;
}

@Component({
     selector: 'app-purchase-form-page',
     standalone: true,
     imports: [CommonModule, FormsModule],
     templateUrl: './purchase-form-page.component.html',
     styleUrls: ['./purchase-form-page.component.css']
})
export class PurchaseFormPageComponent implements OnInit, OnDestroy {
     private destroy$ = new Subject<void>();

     isEditMode = false;
     purchaseId: string | null = null;
     organizationId: string | null = null;
     currentUserId: string | null = null;
     currentUser: any = null; // Información del usuario actual
     loading = true;
     saving = false;
     error: string | null = null;     // Data arrays
     suppliers: SupplierResponse[] = [];
     products: ProductResponse[] = [];
     filteredProducts: ProductResponse[] = []; // Productos filtrados por proveedor
     users: Map<string, any> = new Map();

     // Form data
     purchaseForm: PurchaseForm = {
          supplierId: '',
          purchaseDate: this.getCurrentDate(), // Fecha actual por defecto
          requestedByUserId: '',
     };

     purchaseDetails: PurchaseDetailForm[] = [
          {
               productId: '',
               quantity: 1,
               unitPrice: 0
          }
     ];

     constructor(
          private route: ActivatedRoute,
          private router: Router,
          private inventoryService: InventoryService,
          private organizationContextService: OrganizationContextService
     ) { }

     /**
      * Obtener fecha actual en formato YYYY-MM-DD
      */
     private getCurrentDate(): string {
          const today = new Date();
          return today.toISOString().split('T')[0];
     }

     ngOnInit(): void {
          // Obtener datos del contexto
          this.organizationId = this.organizationContextService.getCurrentOrganizationId();
          this.currentUserId = this.organizationContextService.getCurrentUserId();

          if (!this.organizationId || !this.currentUserId) {
               this.error = 'No se encontró información de la organización o usuario';
               this.loading = false;
               return;
          }          // Configurar usuario actual en el formulario
          this.purchaseForm.requestedByUserId = this.currentUserId;

          // Verificar si es modo edición
          this.purchaseId = this.route.snapshot.paramMap.get('id');
          this.isEditMode = !!this.purchaseId;

          this.loadData();
     }

     ngOnDestroy(): void {
          this.destroy$.next();
          this.destroy$.complete();
     }

     private loadData(): void {
          this.loading = true;
          this.error = null;

          // Cargar proveedores, productos y usuario actual
          Promise.all([
               this.inventoryService.getSuppliers(this.organizationId!).toPromise(),
               this.inventoryService.getProducts(this.organizationId!).toPromise(),
               this.inventoryService.getUserById(this.currentUserId!).toPromise(),
               this.inventoryService.getPurchasesByOrganization(this.organizationId!).toPromise()
          ]).then(([suppliers, products, currentUser, purchases]) => {
               this.suppliers = (suppliers || []).filter(s => s.status === 'ACTIVO');

               // Filtrar productos activos y ordenarlos por código
               const activeProducts = (products || []).filter(p => p.status === 'ACTIVO');
               this.products = activeProducts.sort((a, b) => {
                    const getCodeNumber = (code: string): number => {
                         const match = code.match(/PROD(\d+)/);
                         return match ? parseInt(match[1], 10) : 999999;
                    };
                    return getCodeNumber(a.productCode) - getCodeNumber(b.productCode);
               });

               this.filteredProducts = []; // Inicialmente vacío hasta seleccionar proveedor
               this.currentUser = currentUser;

               // Generar código de compra automáticamente si es creación
               if (!this.isEditMode) {
                    this.generatePurchaseCode(purchases || []);
               }

               // Si es modo edición, cargar la compra
               if (this.isEditMode && this.purchaseId) {
                    this.loadPurchase();
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
      * Generar código de compra automáticamente
      */
     private generatePurchaseCode(existingPurchases: PurchaseResponse[]): void {
          // Extraer números de códigos existentes
          const existingNumbers = existingPurchases
               .map(p => {
                    const match = p.purchaseCode.match(/PUR(\d+)/);
                    return match ? parseInt(match[1], 10) : 0;
               })
               .filter(num => num > 0);

          // Encontrar el siguiente número disponible
          const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;

          // Formatear con ceros a la izquierda (PUR001, PUR002, etc.)
          const formattedNumber = nextNumber.toString().padStart(3, '0');
          this.purchaseForm.purchaseCode = `PUR${formattedNumber}`;
     } private loadPurchase(): void {
          if (!this.purchaseId) return;

          this.inventoryService.getPurchaseById(this.purchaseId)
               .pipe(takeUntil(this.destroy$))
               .subscribe({
                    next: (purchase) => {
                         this.populateForm(purchase);
                         this.loading = false;
                    },
                    error: (error) => {
                         console.error('Error loading purchase:', error);
                         this.error = 'Error al cargar la compra';
                         this.loading = false;
                    }
               });
     }

     private populateForm(purchase: PurchaseResponse): void {
          this.purchaseForm = {
               purchaseCode: purchase.purchaseCode,
               supplierId: purchase.supplierId,
               purchaseDate: purchase.purchaseDate,
               deliveryDate: purchase.deliveryDate,
               requestedByUserId: purchase.requestedByUserId,
               invoiceNumber: purchase.invoiceNumber,
               observations: purchase.observations
          };

          // Ordenar productos por código (PROD001, PROD002, etc.)
          this.filteredProducts = [...this.products].sort((a, b) => {
               const getCodeNumber = (code: string): number => {
                    const match = code.match(/PROD(\d+)/);
                    return match ? parseInt(match[1], 10) : 999999;
               };
               return getCodeNumber(a.productCode) - getCodeNumber(b.productCode);
          });

          // Llenar detalles
          this.purchaseDetails = purchase.details.map(detail => ({
               productId: detail.productId,
               quantity: detail.quantityOrdered,
               unitPrice: detail.unitCost,
               observations: detail.observations
          }));
     }

     // Gestión de detalles
     addDetail(): void {
          // Validar que el proveedor esté seleccionado
          if (!this.purchaseForm.supplierId || this.purchaseForm.supplierId.trim() === '') {
               Swal.fire({
                    icon: 'warning',
                    title: 'Selecciona un proveedor',
                    text: 'Primero debes seleccionar un proveedor antes de agregar productos',
                    confirmButtonText: 'Entendido'
               });
               return;
          }

          this.purchaseDetails.push({
               productId: '',
               quantity: 1,
               unitPrice: 0
          });
     }

     removeDetail(index: number): void {
          if (this.purchaseDetails.length > 1) {
               this.purchaseDetails.splice(index, 1);
          } else {
               Swal.fire({
                    icon: 'warning',
                    title: 'No se puede eliminar',
                    text: 'Debe haber al menos un producto en la compra',
                    confirmButtonText: 'Entendido'
               });
          }
     }

     /**
      * Manejo del cambio de proveedor
      */
     onSupplierChange(): void {
          // Filtrar productos según el proveedor seleccionado
          // Nota: Esto requiere que el backend proporcione información de qué productos vende cada proveedor
          // Por ahora, mostraremos todos los productos activos ordenados por código
          this.filteredProducts = [...this.products].sort((a, b) => {
               const getCodeNumber = (code: string): number => {
                    const match = code.match(/PROD(\d+)/);
                    return match ? parseInt(match[1], 10) : 999999;
               };
               return getCodeNumber(a.productCode) - getCodeNumber(b.productCode);
          });

          // Limpiar productos seleccionados en los detalles
          this.purchaseDetails.forEach(detail => {
               detail.productId = '';
               detail.unitPrice = 0;
          });
     }

     /**
      * Obtener productos disponibles para un detalle específico (excluyendo productos ya seleccionados)
      */
     getAvailableProductsForDetail(currentIndex: number): ProductResponse[] {
          const selectedProductIds = this.purchaseDetails
               .map((detail, index) => index !== currentIndex ? detail.productId : null)
               .filter(id => id && id.trim() !== '');

          return this.filteredProducts.filter(product =>
               !selectedProductIds.includes(product.productId)
          );
     }

     /**
      * Verificar si un producto ya está seleccionado en otro detalle
      */
     isProductAlreadySelected(productId: string, currentIndex: number): boolean {
          return this.purchaseDetails.some((detail, index) =>
               index !== currentIndex && detail.productId === productId
          );
     }

     /**
      * Manejo del cambio de producto en un detalle
      */
     onProductChange(detail: PurchaseDetailForm, index: number): void {
          // Verificar si el producto ya está seleccionado en otro detalle
          if (detail.productId && this.isProductAlreadySelected(detail.productId, index)) {
               Swal.fire({
                    icon: 'warning',
                    title: 'Producto duplicado',
                    text: 'Este producto ya está seleccionado en otro item. Por favor, selecciona un producto diferente.',
                    confirmButtonText: 'Entendido'
               });
               detail.productId = '';
               detail.unitPrice = 0;
               return;
          }

          const product = this.products.find(p => p.productId === detail.productId);
          if (product) {
               // Asignar precio automáticamente desde el producto
               detail.unitPrice = product.unitCost || 0;

               // Validar cantidad vs stock disponible
               if (detail.quantity > (product.currentStock || 0)) {
                    Swal.fire({
                         icon: 'warning',
                         title: 'Cantidad excedida',
                         text: `La cantidad solicitada (${detail.quantity}) excede el stock disponible (${product.currentStock || 0})`,
                         confirmButtonText: 'Entendido'
                    });
                    detail.quantity = Math.min(detail.quantity, product.currentStock || 0);
               }
          }
     }

     /**
      * Validar cantidad ingresada
      */
     onQuantityChange(detail: PurchaseDetailForm, index: number): void {
          // Asegurar que la cantidad sea un número válido
          if (isNaN(detail.quantity) || detail.quantity <= 0) {
               detail.quantity = 1;
               Swal.fire({
                    icon: 'warning',
                    title: 'Cantidad inválida',
                    text: 'La cantidad debe ser un número mayor a 0',
                    confirmButtonText: 'Entendido'
               });
               return;
          }

          const product = this.products.find(p => p.productId === detail.productId);

          if (product && detail.quantity > (product.currentStock || 0)) {
               Swal.fire({
                    icon: 'warning',
                    title: 'Cantidad excedida',
                    text: `La cantidad solicitada (${detail.quantity}) excede el stock disponible (${product.currentStock || 0})`,
                    confirmButtonText: 'Entendido'
               });
               detail.quantity = Math.min(detail.quantity, product.currentStock || 0);
          }
     }

     getDetailTotal(detail: PurchaseDetailForm): number {
          return (detail.quantity || 0) * (detail.unitPrice || 0);
     }

     getTotalAmount(): number {
          return this.purchaseDetails.reduce((total, detail) => total + this.getDetailTotal(detail), 0);
     }

     // Validaciones
     isFormValid(): boolean {
          // Validar campos básicos del formulario
          const basicFormValid = !!(
               this.purchaseForm.supplierId &&
               this.purchaseForm.supplierId.trim() !== '' &&
               this.purchaseForm.purchaseDate &&
               this.purchaseForm.purchaseDate.trim() !== '' &&
               this.purchaseForm.requestedByUserId &&
               this.purchaseForm.requestedByUserId.trim() !== ''
          );

          // Validar que haya al menos un detalle
          const hasDetails = this.purchaseDetails.length > 0;

          // Validar que todos los detalles estén completos
          const detailsValid = this.purchaseDetails.every(detail =>
               detail.productId &&
               detail.productId.trim() !== '' &&
               detail.quantity > 0 &&
               detail.unitPrice >= 0
          );

          return basicFormValid && hasDetails && detailsValid;
     }

     // Envío del formulario
     onSubmit(): void {
          if (this.saving) return;

          // Validaciones específicas
          if (!this.purchaseForm.supplierId || this.purchaseForm.supplierId.trim() === '') {
               Swal.fire({
                    icon: 'warning',
                    title: 'Proveedor requerido',
                    text: 'Debes seleccionar un proveedor',
                    confirmButtonText: 'Entendido'
               });
               return;
          }

          if (!this.purchaseForm.purchaseDate || this.purchaseForm.purchaseDate.trim() === '') {
               Swal.fire({
                    icon: 'warning',
                    title: 'Fecha requerida',
                    text: 'Debes especificar la fecha de compra',
                    confirmButtonText: 'Entendido'
               });
               return;
          }

          if (this.purchaseDetails.length === 0) {
               Swal.fire({
                    icon: 'warning',
                    title: 'Sin productos',
                    text: 'Debes agregar al menos un producto a la compra',
                    confirmButtonText: 'Entendido'
               });
               return;
          }

          // Verificar que todos los detalles estén completos
          const invalidDetail = this.purchaseDetails.find((detail, index) =>
               !detail.productId || detail.productId.trim() === '' ||
               detail.quantity <= 0 ||
               detail.unitPrice < 0
          );

          if (invalidDetail) {
               const index = this.purchaseDetails.indexOf(invalidDetail);
               Swal.fire({
                    icon: 'warning',
                    title: 'Producto incompleto',
                    text: `El producto en la posición ${index + 1} tiene información incompleta. Verifica que tenga producto seleccionado, cantidad mayor a 0 y precio válido.`,
                    confirmButtonText: 'Entendido'
               });
               return;
          }

          if (!this.isFormValid()) {
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
               title: `¿${action.charAt(0).toUpperCase() + action.slice(1)} la compra?`,
               text: `Se va a ${action} la compra con código ${this.purchaseForm.purchaseCode}`,
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
                    this.submitPurchase();
               }
          });
     }

     private submitPurchase(): void {
          const purchaseRequest: PurchaseRequest = {
               organizationId: this.organizationId!,
               supplierId: this.purchaseForm.supplierId,
               purchaseDate: this.purchaseForm.purchaseDate,
               deliveryDate: this.purchaseForm.deliveryDate,
               requestedByUserId: this.currentUserId!, // Usar el ID del usuario logueado
               invoiceNumber: this.purchaseForm.invoiceNumber,
               observations: this.purchaseForm.observations,
               details: this.purchaseDetails.map((detail): PurchaseDetailRequest => ({
                    productId: detail.productId,
                    quantityOrdered: detail.quantity,
                    unitCost: detail.unitPrice,
                    observations: detail.observations
               }))
          };

          // Incluir código de compra y status para modo creación
          if (!this.isEditMode) {
               purchaseRequest.purchaseCode = this.purchaseForm.purchaseCode;
               purchaseRequest.status = PurchaseStatus.PENDIENTE; // Status por defecto
          } else {
               // Para edición, incluir el código existente
               purchaseRequest.purchaseCode = this.purchaseForm.purchaseCode;
          }

          console.log('Enviando datos:', purchaseRequest);

          const operation = this.isEditMode
               ? this.inventoryService.updatePurchase(this.purchaseId!, purchaseRequest)
               : this.inventoryService.createPurchase(purchaseRequest);

          operation.pipe(takeUntil(this.destroy$)).subscribe({
               next: () => {
                    this.saving = false;
                    const action = this.isEditMode ? 'actualizada' : 'creada';

                    Swal.fire({
                         icon: 'success',
                         title: '¡Éxito!',
                         text: `La compra ha sido ${action} correctamente`,
                         confirmButtonText: 'Continuar'
                    }).then(() => {
                         this.router.navigate(['/admin/inventory/purchases']);
                    });
               },
               error: (error) => {
                    console.error('Error saving purchase:', error);
                    this.saving = false;

                    let errorMessage = this.isEditMode ? 'Error al actualizar la compra' : 'Error al crear la compra';

                    // Manejar errores específicos
                    if (error.status === 400 && error.error?.message) {
                         errorMessage = error.error.message;
                    } else if (error.status === 409) {
                         errorMessage = 'Ya existe una compra con este código';
                    }

                    Swal.fire({
                         icon: 'error',
                         title: 'Error',
                         text: errorMessage,
                         confirmButtonText: 'Entendido'
                    });
               }
          });
     }     // Navegación
     goBack(): void {
          this.router.navigate(['/admin/inventory/purchases']);
     }

     // Métodos auxiliares
     getUserFullName(userId: string): string {
          if (userId === this.currentUserId && this.currentUser) {
               return this.currentUser.fullName || this.currentUser.name || userId;
          }
          const user = this.users.get(userId);
          return user ? (user.fullName || user.name || userId) : userId;
     }

     getCurrentUserName(): string {
          return this.currentUser ? (this.currentUser.fullName || this.currentUser.name || this.currentUserId) : (this.currentUserId || 'Usuario actual');
     } getProductName(productId: string): string {
          const product = this.products.find(p => p.productId === productId);
          return product ? product.productName : 'Producto no encontrado';
     }

     getSupplierName(supplierId: string): string {
          const supplier = this.suppliers.find(s => s.supplierId === supplierId);
          return supplier ? supplier.supplierName : 'Proveedor no encontrado';
     }
}
