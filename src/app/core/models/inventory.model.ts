import { BaseFilter } from './common.model';

// Enums
export enum ProductStatus {
     ACTIVO = 'ACTIVO',
     INACTIVO = 'INACTIVO',
     DESCONTINUADO = 'DESCONTINUADO'
}

export enum UnitOfMeasure {
     UNIDAD = 'UNIDAD',
     KG = 'KG',
     LITRO = 'LITRO',
     METRO = 'METRO',
     M2 = 'M2',
     M3 = 'M3',
     CAJA = 'CAJA',
     PAR = 'PAR'
}

export enum GeneralStatus {
     ACTIVO = 'ACTIVO',
     INACTIVO = 'INACTIVO',
     ARCHIVADO = 'ARCHIVADO'
}

export enum SupplierStatus {
     ACTIVO = 'ACTIVO',
     INACTIVO = 'INACTIVO',
     BLOQUEADO = 'BLOQUEADO'
}

export enum PurchaseStatus {
     PENDIENTE = 'PENDIENTE',
     APROBADO = 'APROBADO',
     RECHAZADO = 'RECHAZADO',
     EN_TRANSITO = 'EN_TRANSITO',
     RECIBIDO = 'RECIBIDO',
     CANCELADO = 'CANCELADO',
     COMPLETADO = 'COMPLETADO',
     PARCIAL = 'PARCIAL'
}

// Modelos de Request
export interface ProductRequest {
     organizationId: string;
     productCode: string;
     productName: string;
     categoryId: string;
     unitOfMeasure: UnitOfMeasure;
     minimumStock?: number;
     maximumStock?: number;
     currentStock?: number;
     unitCost?: number;
     status?: ProductStatus;
}

export interface ProductCategoryRequest {
     organizationId: string;
     categoryCode: string;
     categoryName: string;
     description?: string;
     status?: GeneralStatus;
}

export interface SupplierRequest {
     organizationId: string;
     supplierCode: string;
     supplierName: string;
     contactPerson?: string;
     phone?: string;
     email?: string;
     address?: string;
     status?: SupplierStatus;
}

export interface PurchaseDetailRequest {
     productId: string;
     quantityOrdered: number;
     unitCost: number;
     observations?: string;
}

export interface PurchaseRequest {
     organizationId: string;
     purchaseCode?: string;
     supplierId: string;
     purchaseDate: string;
     deliveryDate?: string;
     requestedByUserId: string;
     invoiceNumber?: string;
     observations?: string;
     status?: PurchaseStatus;
     details: PurchaseDetailRequest[];
}

export interface PurchaseStatusUpdateRequest {
     status: PurchaseStatus;
}

// Modelos de Response
export interface ProductResponse {
     productId: string;
     organizationId: string;
     productCode: string;
     productName: string;
     categoryId: string;
     categoryName: string;
     unitOfMeasure: UnitOfMeasure;
     minimumStock?: number;
     maximumStock?: number;
     currentStock?: number;
     unitCost?: number;
     status: ProductStatus;
     createdAt: string;
     updatedAt: string;
}

export interface ProductCategoryResponse {
     categoryId: string;
     organizationId: string;
     categoryCode: string;
     categoryName: string;
     description?: string;
     status: GeneralStatus;
     productCount?: number; // Contador de productos en esta categoría
     createdAt: string;
     updatedAt: string;
}

export interface SupplierResponse {
     supplierId: string;
     organizationId: string;
     supplierCode: string;
     supplierName: string;
     contactPerson?: string;
     phone?: string;
     email?: string;
     address?: string;
     status: SupplierStatus;
     createdAt: string;
     updatedAt: string;
}

export interface PurchaseDetailResponse {
     purchaseDetailId: string;
     purchaseId: string;
     productId: string;
     productName: string;
     productCode: string;
     quantityOrdered: number;
     quantityReceived: number;
     unitCost: number;
     subtotal: number;
     observations?: string;
}

export interface PurchaseResponse {
     purchaseId: string;
     organizationId: string;
     purchaseCode: string;
     supplierId: string;
     supplierName: string;
     supplierCode: string;
     purchaseDate: string;
     deliveryDate?: string;
     requestedByUserId: string;
     approvedByUserId?: string;
     invoiceNumber?: string;
     observations?: string;
     status: PurchaseStatus;
     totalAmount: number;
     details: PurchaseDetailResponse[];
     createdAt: string;
}

// Filtros
export interface ProductFilter extends BaseFilter {
     organizationId: string;
     categoryId?: string;
     status?: ProductStatus;
     search?: string;
}

export interface SupplierFilter extends BaseFilter {
     organizationId: string;
     status?: SupplierStatus;
     search?: string;
}

export interface PurchaseFilter extends BaseFilter {
     organizationId: string;
     status?: PurchaseStatus;
     supplierId?: string;
     fromDate?: string;
     toDate?: string;
     search?: string;
}

export interface CategoryFilter extends BaseFilter {
     organizationId: string;
     status?: GeneralStatus;
     search?: string;
}

// DTOs adicionales para la UI
export interface ProductSummary {
     totalProducts: number;
     activeProducts: number;
     lowStockProducts: number;
     outOfStockProducts: number;
}

export interface PurchaseSummary {
     totalPurchases: number;
     pendingPurchases: number;
     approvedPurchases: number;
     totalAmount: number;
}

export interface InventoryStats {
     totalValue: number;
     totalProducts: number;
     lowStockCount: number;
     categoriesCount: number;
     suppliersCount: number;
}
