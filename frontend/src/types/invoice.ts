// we are defining the types
// the frontend should know exactly what an invoice looks like, what properties it has, and what types those properties are

export interface LineItem {
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
  paymentDate: string;
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  customerName: string;
  issueDate: string;
  dueDate: string;
  status: 'DRAFT' | 'OUTSTANDING' | 'PAID' | 'CANCELED';
  total: number;
  amountPaid: number;
  balanceDue: number;
  isArchived: boolean;
  lineItems: LineItem[];
  payments: Payment[];
}