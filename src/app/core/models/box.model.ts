// Modelos para infraestructura - cajas de agua

export enum BoxType {
  CAÑO = 'CAÑO',
  BOMBA = 'BOMBA',
  OTRO = 'OTRO',
}

export enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface WaterBox {
  id: number;
  organizationId: number;
  boxCode: string;
  boxType: BoxType;
  installationDate: string; // ISO date
  currentAssignmentId?: number;
  status: Status;
  createdAt: string; // ISO date-time
  updatedAt?: string; // ISO date-time
}

export interface WaterBoxAssignment {
  id: number;
  waterBoxId: number;
  userId: number;
  startDate: string; // ISO date-time
  endDate?: string; // ISO date-time
  monthlyFee: number;
  status: Status;
  createdAt: string; // ISO date-time
  updatedAt?: string; // ISO date-time
  transferId?: number;
}

export interface WaterBoxTransfer {
   id: number;
   waterBoxId: number;
   oldAssignmentId: number;
   newAssignmentId: number;
   transferReason: string;
   documents?: string[] | null;
   createdAt: string; // ISO date-time
}
