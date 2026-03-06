// a way for react to talk to the backend (express server)
// centralizes all fetch calls
// basically the postman
// if the backend URL changes, we only need to change it here, not in every component that calls the backend

import type { Invoice } from '../types/invoice.js';

const API_BASE_URL = 'http://localhost:5000/api/invoices';

export const invoiceService = {
  // 1. Get Invoice Details
  getInvoice: async (id: string | number): Promise<Invoice> => {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    if (!response.ok) throw new Error('Failed to fetch invoice');
    return response.json();
  },

  // 2. Add Payment
  addPayment: async (id: string | number, amount: number): Promise<Invoice> => {
    const response = await fetch(`${API_BASE_URL}/${id}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    });
    if (!response.ok) throw new Error('Payment failed');
    return response.json();
  },

  // 3 & 4. Archive/Restore
  toggleArchive: async (id: string | number, isArchived: boolean): Promise<Invoice> => {
    const response = await fetch(`${API_BASE_URL}/${id}/archive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isArchived }),
    });
    if (!response.ok) throw new Error('Archive toggle failed');
    return response.json();
  }
};