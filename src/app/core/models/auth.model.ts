import { RolesUsers, UserResponseDTO } from './user.model';

export enum UserRole {
  CLIENT = 'CLIENT',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  status: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
    userId: string;
    username: string;
    fullName: string;
    roles: RolesUsers[];
  };
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  roles: RolesUsers[];
  activeRole?: RolesUsers;
  organizationId: string | null;
  fullName: string;
  userCode: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface TokenValidationResponse {
  success: boolean;
  data: {
    valid: boolean;
    user?: {
      id: string;
      username: string;
      email: string;
      roles: RolesUsers[];
    };
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface User {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  organizationId?: string;
  name: string;
}
