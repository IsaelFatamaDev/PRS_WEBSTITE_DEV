// Respuestas comunes de la API
export interface ApiResponse<T> {
     success: boolean;
     data: T;
     message?: string;
     error?: string;
}

export interface ApiError {
     success: false;
     message: string;
     error: string;
     timestamp: string;
}

// Paginación
export interface PaginatedResponse<T> {
     content: T[];
     totalElements: number;
     totalPages: number;
     page: number;
     size: number;
     first: boolean;
     last: boolean;
}

// Filtros comunes
export interface BaseFilter {
     page?: number;
     size?: number;
     sort?: string;
     direction?: 'ASC' | 'DESC';
}

export interface OrganizationFilter extends BaseFilter {
     organizationId: string;
}
