
export enum Role {
  ADMIN = 'ADMIN',
  CLIENT = 'CLIENT',
  SUPERADMIN = 'SUPERADMIN'
}

export enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

/* Model - Payment */
export interface Payment {
  paymentId: string;
  organizationId: string;
  paymentCode: string;
  userId: string;
  waterBoxId: string;
  paymentType: string;
  paymentMethod: string;
  totalAmount: string;
  paymentDate: Date;
  paymentStatus: string;
  status: Status;
  externalReference: string;
}

/* Request - PaymentCreate */
export interface PaymentCreate {
  organizationId: string;
  paymentCode: string;
  userId: string;
  waterBoxId: string;
  paymentType: string;
  paymentMethod: string;
  totalAmount: string;
  paymentDate: Date;
  paymentStatus: string;
  externalReference: string;
  details: PaymentDCreate[];
}

/* Model - PaymentDetail */
export interface DetailPayments {
  paymentDetailId: string;
  paymentId: string;
  concept: string;
  year: string;
  month: string;
  amount: string;
  description: string;
  periodStart: Date;
  periodEnd: Date;
}

/* Request - PaymentDCreate */
export interface PaymentDCreate {
  concept: string;
  year: string;
  month: string;
  amount: string;
  description: string;
  periodStart: Date;
  periodEnd: Date;
}

/* Model - Receipts */
export interface Receipts {
  receiptsId: string;
  organizationId: string;
  paymentId: string;
  paymentDetailId: string;
  receiptSeries: string;
  receiptNumber: string;
  receiptType: string;
  issueDate: Date;
  amount: string;
  year: string;
  month: string;
  concept: string;
  customerFullName: string;
  customerDocument: string;
  pdfGenerated: string;
  pdfPath: string;
}

export interface PaymentUpdate {
  organizationId?: string;
  paymentCode?: string;
  userId?: string;
  waterBoxId?: string;
  paymentType?: string;
  paymentMethod?: string;
  totalAmount?: string;
  paymentDate?: Date;
  paymentStatus?: string;
  externalReference?: string;
}

