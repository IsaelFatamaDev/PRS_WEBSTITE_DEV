import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { ApiService } from './api.service';
import { OrganizationContextService } from './organization-context.service';
import { environment } from '../../../environments/environment';
import {
  ProductRequest,
  ProductResponse,
  ProductCategoryRequest,
  ProductCategoryResponse,
  SupplierRequest,
  SupplierResponse,
  PurchaseRequest,
  PurchaseResponse,
  PurchaseStatusUpdateRequest,
  ProductStatus,
  GeneralStatus,
  SupplierStatus,
  PurchaseStatus,
  ProductFilter,
  SupplierFilter,
  PurchaseFilter,
  CategoryFilter,
  ProductSummary,
  PurchaseSummary,
  InventoryStats
} from '../models/inventory.model';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {

  // URLs base para diferentes APIs
  private readonly inventoryApiUrl = environment.inventoryApiUrl;

  constructor(
    private apiService: ApiService,
    private organizationContextService: OrganizationContextService
  ) { }

  /**
   * Método para hacer peticiones a la API de inventario (localhost:8088)
   */
  private inventoryApiCall<T>(method: 'get' | 'post' | 'put' | 'delete' | 'patch', endpoint: string, params?: HttpParams, body?: any): Observable<T> {
    const fullUrl = `${this.inventoryApiUrl}${endpoint}`;

    switch (method) {
      case 'get':
        return this.apiService.getInventoryDirect<T>(fullUrl, params);
      case 'post':
        return this.apiService.postInventoryDirect<T>(fullUrl, body);
      case 'put':
        return this.apiService.putInventoryDirect<T>(fullUrl, body);
      case 'delete':
        return this.apiService.deleteInventoryDirect<T>(fullUrl);
      case 'patch':
        return this.apiService.patchInventoryDirect<T>(fullUrl, body);
      default:
        throw new Error(`Método HTTP no soportado: ${method}`);
    }
  }


  // ============= PRODUCTOS =============

  /**
   * Obtener todos los productos de la organización
   */
  getProducts(organizationId?: string): Observable<ProductResponse[]> {
    const orgId = organizationId || this.organizationContextService.getCurrentOrganizationId();
    if (!orgId) {
      throw new Error('Organization ID is required');
    }

    const params = new HttpParams().set('organizationId', orgId);
    return this.inventoryApiCall<ProductResponse[]>('get', '/materials', params);
  }

  /**
   * Obtener producto por ID
   */
  getProductById(id: string): Observable<ProductResponse> {
    return this.inventoryApiCall<ProductResponse>('get', `/materials/${id}`);
  }

  /**
   * Crear nuevo producto
   */
  createProduct(product: ProductRequest): Observable<ProductResponse> {
    if (!product.organizationId) {
      product.organizationId = this.organizationContextService.getCurrentOrganizationId() || '';
    }
    return this.inventoryApiCall<ProductResponse>('post', '/materials', undefined, product);
  }

  /**
   * Actualizar producto
   */
  updateProduct(id: string, product: ProductRequest): Observable<ProductResponse> {
    return this.inventoryApiCall<ProductResponse>('put', `/materials/${id}`, undefined, product);
  }

  /**
   * Eliminar producto (lógicamente)
   */
  deleteProduct(id: string): Observable<string> {
    return this.inventoryApiCall<string>('delete', `/materials/${id}`);
  }

  /**
   * Restaurar producto eliminado
   */
  restoreProduct(id: string): Observable<ProductResponse> {
    return this.inventoryApiCall<ProductResponse>('patch', `/materials/${id}/restore`, undefined, {});
  }

  /**
   * Filtrar productos por estado
   */
  getProductsByStatus(status: ProductStatus, organizationId?: string): Observable<ProductResponse[]> {
    const orgId = organizationId || this.organizationContextService.getCurrentOrganizationId();
    if (!orgId) {
      throw new Error('Organization ID is required');
    }

    const params = new HttpParams().set('organizationId', orgId);
    return this.inventoryApiCall<ProductResponse[]>('get', `/materials/status/${status}`, params);
  }

  /**
   * Filtrar productos por categoría
   */
  getProductsByCategory(categoryId: string, organizationId?: string): Observable<ProductResponse[]> {
    const orgId = organizationId || this.organizationContextService.getCurrentOrganizationId();
    if (!orgId) {
      throw new Error('Organization ID is required');
    }

    const params = new HttpParams().set('organizationId', orgId);
    return this.inventoryApiCall<ProductResponse[]>('get', `/materials/category/${categoryId}`, params);
  }

  /**
   * Filtrar productos por categoría y estado
   */
  getProductsByCategoryAndStatus(categoryId: string, status: ProductStatus, organizationId?: string): Observable<ProductResponse[]> {
    const orgId = organizationId || this.organizationContextService.getCurrentOrganizationId();
    if (!orgId) {
      throw new Error('Organization ID is required');
    }

    const params = new HttpParams().set('organizationId', orgId);
    return this.inventoryApiCall<ProductResponse[]>('get', `/materials/category/${categoryId}/status/${status}`, params);
  }

  // ============= CATEGORÍAS =============

  /**
   * Obtener todas las categorías de productos
   */
  getCategories(organizationId?: string): Observable<ProductCategoryResponse[]> {
    const orgId = organizationId || this.organizationContextService.getCurrentOrganizationId();
    if (!orgId) {
      throw new Error('Organization ID is required');
    }

    const params = new HttpParams().set('organizationId', orgId);
    return this.inventoryApiCall<ProductCategoryResponse[]>('get', '/product-categories', params);
  }

  /**
   * Obtener categoría por ID
   */
  getCategoryById(id: string): Observable<ProductCategoryResponse> {
    return this.inventoryApiCall<ProductCategoryResponse>('get', `/product-categories/${id}`);
  }

  /**
   * Crear nueva categoría
   */
  createCategory(category: ProductCategoryRequest): Observable<ProductCategoryResponse> {
    if (!category.organizationId) {
      category.organizationId = this.organizationContextService.getCurrentOrganizationId() || '';
    }
    return this.inventoryApiCall<ProductCategoryResponse>('post', '/product-categories', undefined, category);
  }

  /**
   * Actualizar categoría
   */
  updateCategory(id: string, category: ProductCategoryRequest): Observable<ProductCategoryResponse> {
    return this.inventoryApiCall<ProductCategoryResponse>('put', `/product-categories/${id}`, undefined, category);
  }

  /**
   * Eliminar categoría (lógicamente)
   */
  deleteCategory(id: string): Observable<string> {
    return this.inventoryApiCall<string>('delete', `/product-categories/${id}`);
  }

  /**
   * Restaurar categoría eliminada
   */
  restoreCategory(id: string): Observable<ProductCategoryResponse> {
    return this.inventoryApiCall<ProductCategoryResponse>('patch', `/product-categories/${id}/restore`, undefined, {});
  }

  /**
   * Filtrar categorías por estado
   */
  getCategoriesByStatus(status: GeneralStatus, organizationId?: string): Observable<ProductCategoryResponse[]> {
    const orgId = organizationId || this.organizationContextService.getCurrentOrganizationId();
    if (!orgId) {
      throw new Error('Organization ID is required');
    }

    const params = new HttpParams().set('organizationId', orgId);
    return this.inventoryApiCall<ProductCategoryResponse[]>('get', `/product-categories/status/${status}`, params);
  }

  // ============= PROVEEDORES =============

  /**
   * Obtener todos los proveedores
   */
  getSuppliers(organizationId?: string): Observable<SupplierResponse[]> {
    const orgId = organizationId || this.organizationContextService.getCurrentOrganizationId();
    if (!orgId) {
      throw new Error('Organization ID is required');
    }

    const params = new HttpParams().set('organizationId', orgId);
    return this.inventoryApiCall<SupplierResponse[]>('get', '/suppliers', params);
  }

  /**
   * Obtener proveedor por ID
   */
  getSupplierById(id: string): Observable<SupplierResponse> {
    return this.inventoryApiCall<SupplierResponse>('get', `/suppliers/${id}`);
  }

  /**
   * Crear nuevo proveedor
   */
  createSupplier(supplier: SupplierRequest): Observable<SupplierResponse> {
    if (!supplier.organizationId) {
      supplier.organizationId = this.organizationContextService.getCurrentOrganizationId() || '';
    }
    return this.inventoryApiCall<SupplierResponse>('post', '/suppliers', undefined, supplier);
  }

  /**
   * Actualizar proveedor
   */
  updateSupplier(id: string, supplier: SupplierRequest): Observable<SupplierResponse> {
    return this.inventoryApiCall<SupplierResponse>('put', `/suppliers/${id}`, undefined, supplier);
  }

  /**
   * Eliminar proveedor (lógicamente)
   */
  deleteSupplier(id: string): Observable<string> {
    return this.inventoryApiCall<string>('delete', `/suppliers/${id}`);
  }

  /**
   * Restaurar proveedor eliminado
   */
  restoreSupplier(id: string): Observable<SupplierResponse> {
    return this.inventoryApiCall<SupplierResponse>('patch', `/suppliers/${id}/restore`, undefined, {});
  }

  /**
   * Filtrar proveedores por estado
   */
  getSuppliersByStatus(status: SupplierStatus, organizationId?: string): Observable<SupplierResponse[]> {
    const orgId = organizationId || this.organizationContextService.getCurrentOrganizationId();
    if (!orgId) {
      throw new Error('Organization ID is required');
    }

    const params = new HttpParams()
      .set('organizationId', orgId)
      .set('status', status);
    return this.inventoryApiCall<SupplierResponse[]>('get', '/suppliers', params);
  }

  // ============= COMPRAS =============

  /**
   * Obtener todas las compras
   */
  getPurchases(): Observable<PurchaseResponse[]> {
    return this.inventoryApiCall<PurchaseResponse[]>('get', '/purchases');
  }

  /**
   * Obtener compras por organización
   */
  getPurchasesByOrganization(organizationId?: string): Observable<PurchaseResponse[]> {
    const orgId = organizationId || this.organizationContextService.getCurrentOrganizationId();
    if (!orgId) {
      throw new Error('Organization ID is required');
    }
    return this.inventoryApiCall<PurchaseResponse[]>('get', `/purchases/organization/${orgId}`);
  }

  /**
   * Obtener compra por ID
   */
  getPurchaseById(id: string): Observable<PurchaseResponse> {
    return this.inventoryApiCall<PurchaseResponse>('get', `/purchases/${id}`);
  }

  /**
   * Crear nueva compra
   */
  createPurchase(purchase: PurchaseRequest): Observable<PurchaseResponse> {
    if (!purchase.organizationId) {
      purchase.organizationId = this.organizationContextService.getCurrentOrganizationId() || '';
    }
    return this.inventoryApiCall<PurchaseResponse>('post', '/purchases', undefined, purchase);
  }

  /**
   * Actualizar compra
   */
  updatePurchase(id: string, purchase: PurchaseRequest): Observable<PurchaseResponse> {
    return this.inventoryApiCall<PurchaseResponse>('put', `/purchases/${id}`, undefined, purchase);
  }

  /**
   * Eliminar compra (lógicamente)
   */
  deletePurchase(id: string): Observable<string> {
    return this.inventoryApiCall<string>('delete', `/purchases/${id}`);
  }

  /**
   * Restaurar compra eliminada
   */
  restorePurchase(id: string): Observable<PurchaseResponse> {
    return this.inventoryApiCall<PurchaseResponse>('patch', `/purchases/${id}/restore`, undefined, {});
  }

  /**
   * Filtrar compras por estado
   */
  getPurchasesByStatus(status: PurchaseStatus, organizationId?: string): Observable<PurchaseResponse[]> {
    const orgId = organizationId || this.organizationContextService.getCurrentOrganizationId();
    if (!orgId) {
      throw new Error('Organization ID is required');
    }

    const params = new HttpParams().set('organizationId', orgId);
    return this.inventoryApiCall<PurchaseResponse[]>('get', `/purchases/status/${status}`, params);
  }

  /**
   * Actualizar estado de compra
   */
  updatePurchaseStatus(id: string, statusUpdate: PurchaseStatusUpdateRequest): Observable<PurchaseResponse> {
    return this.inventoryApiCall<PurchaseResponse>('patch', `/purchases/${id}/status`, undefined, statusUpdate);
  }

  // ============= ESTADÍSTICAS Y RESÚMENES =============

  /**
   * Obtener información de usuario por ID (desde ms-user)
   */
  getUserById(userId: string): Observable<any> {
    return this.apiService.get<any>(`/users/${userId}`);
  }

  /**
   * Obtener resumen de productos
   */
  getProductSummary(organizationId?: string): Observable<ProductSummary> {
    // Esta funcionalidad puede implementarse contando los productos por estado
    return new Observable(observer => {
      this.getProducts(organizationId).subscribe({
        next: (products) => {
          const summary: ProductSummary = {
            totalProducts: products.length,
            activeProducts: products.filter(p => p.status === ProductStatus.ACTIVO).length,
            lowStockProducts: products.filter(p => p.currentStock && p.minimumStock && p.currentStock <= p.minimumStock).length,
            outOfStockProducts: products.filter(p => p.currentStock === 0).length
          };
          observer.next(summary);
          observer.complete();
        },
        error: (error) => observer.error(error)
      });
    });
  }

  /**
   * Obtener resumen de compras
   */
  getPurchaseSummary(organizationId?: string): Observable<PurchaseSummary> {
    return new Observable(observer => {
      this.getPurchasesByOrganization(organizationId).subscribe({
        next: (purchases) => {
          const summary: PurchaseSummary = {
            totalPurchases: purchases.length,
            pendingPurchases: purchases.filter(p => p.status === PurchaseStatus.PENDIENTE).length,
            approvedPurchases: purchases.filter(p => p.status === PurchaseStatus.APROBADO).length,
            totalAmount: purchases.reduce((sum, p) => sum + p.totalAmount, 0)
          };
          observer.next(summary);
          observer.complete();
        },
        error: (error) => observer.error(error)
      });
    });
  }

  /**
   * Obtener estadísticas generales del inventario
   */
  getInventoryStats(organizationId?: string): Observable<InventoryStats> {
    return new Observable(observer => {
      // Combinar llamadas para obtener estadísticas completas
      const orgId = organizationId || this.organizationContextService.getCurrentOrganizationId();

      if (!orgId) {
        observer.error(new Error('Organization ID is required'));
        return;
      }

      Promise.all([
        this.getProducts(orgId).toPromise(),
        this.getCategories(orgId).toPromise(),
        this.getSuppliers(orgId).toPromise()
      ]).then(([products, categories, suppliers]) => {
        const stats: InventoryStats = {
          totalValue: products?.reduce((sum, p) => sum + ((p.unitCost || 0) * (p.currentStock || 0)), 0) || 0,
          totalProducts: products?.length || 0,
          lowStockCount: products?.filter(p => p.currentStock && p.minimumStock && p.currentStock <= p.minimumStock).length || 0,
          categoriesCount: categories?.length || 0,
          suppliersCount: suppliers?.length || 0
        };
        observer.next(stats);
        observer.complete();
      }).catch(error => observer.error(error));
    });
  }
}
