// Enums
export enum DocumentType {
     DNI = 'DNI',
     CARNET_EXTRANJERIA = 'CARNET_EXTRANJERIA'
}

export enum StatusUsers {
     ACTIVE = 'ACTIVE',
     INACTIVE = 'INACTIVE',
     SUSPENDED = 'SUSPENDED',
     PENDING = 'PENDING'
}

export enum RolesUsers {
     CLIENT = 'CLIENT',
     ADMIN = 'ADMIN',
     SUPER_ADMIN = 'SUPER_ADMIN'
}

export enum AssignmentStatus {
     ACTIVE = 'ACTIVE',
     INACTIVE = 'INACTIVE',
     SUSPENDED = 'SUSPENDED'
}

// Interfaces
export interface AddressUsers {
     streetAddress: string;
     streetId: string;
     zoneId: string;
}

export interface Contact {
     phone: string;
     email: string;
     address: AddressUsers;
}

export interface PersonalInfo {
     documentType: DocumentType;
     documentNumber: string;
     firstName: string;
     lastName: string;
     fullName: string;
}

export interface WaterBoxAssignment {
     waterBoxId: string;
     waterBoxCode: string;
     assignmentStatus: AssignmentStatus;
     monthlyFee: number;
     assignmentDate: string;
}

export interface User {
     id: string;
     userCode: string;
     organizationId: string;
     personalInfo: PersonalInfo;
     contact: Contact;
     waterBoxes: WaterBoxAssignment[];
     status: StatusUsers;
     registrationDate: string;
     lastLogin: string;
     createdAt: string;
     updatedAt: string;
}

export interface AuthCredential {
     authCredentialId: string;
     userId: string;
     username: string;
     passwordHash: string;
     roles: RolesUsers[];
     status: StatusUsers;
     createdAt: string;
}

export interface UserCreateDTO {
     organizationId: string;
     documentType: DocumentType;
     documentNumber: string;
     firstName: string;
     lastName: string;
     email: string;
     phone: string;
     streetAddress: string;
     streetId: string;
     zoneId: string;
     username: string;
     password: string;
     roles: RolesUsers[];
}

export interface UserResponseDTO {
     id: string;
     organizationId: string;
     userCode: string;
     documentType: DocumentType;
     documentNumber: string;
     firstName: string;
     lastName: string;
     fullName: string;
     email: string;
     phone: string;
     streetAddress: string;
     streetId: string;
     zoneId: string;
     status: StatusUsers;
     registrationDate: string;
     lastLogin: string;
     createdAt: string;
     updatedAt: string;
     roles: RolesUsers[];
     username: string;
}

export interface UserUpdateDTO {
     organizationId?: string;
     documentType?: DocumentType;
     documentNumber?: string;
     firstName?: string;
     lastName?: string;
     email?: string;
     phone?: string;
     streetAddress?: string;
     streetId?: string;
     zoneId?: string;
     username?: string;
     password?: string;
     roles?: RolesUsers[];
}

export interface UserFilterDTO {
     organizationId?: string;
     role?: RolesUsers;
     status?: StatusUsers;
     documentType?: DocumentType;
     search?: string;
     page?: number;
     limit?: number;
     sortBy?: string;
     sortOrder?: 'asc' | 'desc';
}

export interface UserListResponse {
     users: UserResponseDTO[];
     total: number;
     page: number;
     limit: number;
     totalPages: number;
}
