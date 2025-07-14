export interface ComplaintCategory {
  id?: string;
  organizationId: string;
  categoryCode: string;
  categoryName: string;
  description: string;
  priorityLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  maxResponseTime: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt?: number;
}

export interface IncidentType {
  id: string;
  typeCode: string;
  typeName: string;
  description: string;
  estimatedResolutionTime: number;
  priorityLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  requiresExternalService: boolean;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Complaint {
  id?: string;
  subject: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'RECEIVED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  organization_id: string;
  complaint_code: string;
  user_id: string;
  category_id: string;
  water_box_id: string;
  complaint_date: number; // timestamp (segundos)
  created_at: number; // timestamp (segundos)
}

export interface ComplaintResponse {
  id?: string;
  complaintId: string;
  responseDate: Date;
  message: string;
  respondedByUserId: string;
  isSolution?: boolean;
  satisfactionRating?: number;
  createdAt?: Date;
}

export interface Incident {
  id?: string;
  organizationId: string;
  incidentCode: string;
  incidentTypeId: string;
  incidentCategory: 'GENERAL' | 'CALIDAD' | 'DISTRIBUCION';
  zoneId: string;
  incidentDate: number; // timestamp (milisegundos)
  title: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'REPORTED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  affectedBoxesCount: number;
  reportedByUserId: string;
  assignedToUserId?: string;
  resolvedByUserId?: string;
  resolved: boolean;
  resolutionNotes?: string;
  recordStatus: 'ACTIVE' | 'INACTIVE';
  createdAt?: number;
}

export interface MaterialUsed {
  productId: string;
  quantity: number;
  unit: string;
}

export interface IncidentResolution {
  id?: string;
  incidentId: string;
  resolutionDate: number;
  resolutionType: string;
  actionsTaken: string;
  materialsUsed: MaterialUsed[];
  laborHours: number;
  totalCost: number;
  resolvedByUserId: string;
  qualityCheck: boolean;
  followUpRequired: boolean;
  resolutionNotes?: string;
  createdAt?: number;
}