// frontend/src/types/invoice.ts

export type Status = 'DRAFT' | 'PAID'; // Matches Prisma enum Exactly

export interface InvoiceLine {
  id: number;
  invoiceId: number;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Payment {
  id: number;
  invoiceId: number;
  amount: number;
  paymentDate: string; // ISO string from DateTime
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  customerName: string;
  issueDate: string;   // ISO string from DateTime
  dueDate: string;     // ISO string from DateTime
  status: Status;      // 'DRAFT' | 'PAID'
  total: number;
  amountPaid: number;
  currency: string;
  balanceDue: number;
  isArchived: boolean;
  taxRate: number;     // Matches Float @default(0.10)
  userId: number | null;
  
  // Relations
  lineItems: InvoiceLine[]; // Renamed from LineItem to InvoiceLine
  payments: Payment[];
}