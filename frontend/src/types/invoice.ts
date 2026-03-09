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
  // Removed [x: string]: number; 
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
  taxRate: number; // New field for tax rate
}