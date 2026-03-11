// a way for react to talk to the backend (express server)
// centralizes all fetch calls
// basically the postman
// if the backend URL changes, we only need to change it here, not in every component that calls the backend
// by using api.interceptors, we don't have to manually add headers (like auth token) to every request/function, it will be added automatically to all requests

import type { Invoice } from "../types/invoice.js";

const API_BASE_URL = "http://localhost:5000/api";

// Helper to get the token and build headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// function to call backend API for authentication (login/register) and invoice management (get details, add payment, archive/restore)
export const authService = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) throw new Error("Invalid credentials");
    return response.json();
  },
  register: async (email: string, password: string, name: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });
    if (!response.ok) throw new Error("Registration failed");
    return response.json();
  },
};

export const invoiceService = {
  getInvoices: async (): Promise<Invoice[]> => {
    const response = await fetch(`${API_BASE_URL}/invoices`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch invoices");
    return response.json();
  },

  // 1. Get Invoice Details
  getInvoice: async (id: string | number): Promise<Invoice> => {
    const response = await fetch(`${API_BASE_URL}/invoices/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch invoice");
    return response.json();
  },

  // 2. Add Payment
  addPayment: async (id: string | number, amount: number): Promise<Invoice> => {
    const response = await fetch(`${API_BASE_URL}/invoices/${id}/payments`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ amount }),
    });
    if (!response.ok) throw new Error("Payment failed");
    return response.json();
  },

  createInvoice: async (invoiceData: Partial<Invoice>): Promise<Invoice> => {
    const response = await fetch(`${API_BASE_URL}/invoices`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(invoiceData),
    });
    if (!response.ok) throw new Error("Failed to create invoice");
    return response.json();
  },

  createLineItem: async (invoiceId: number, itemData: any) => {
    const response = await fetch(
      `${API_BASE_URL}/invoices/${invoiceId}/items`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(itemData),
      },
    );
    if (!response.ok) throw new Error("Failed to create line item");
    return response.json();
  },

  updateTax: async (id: string, taxRate: number) => {
    const response = await fetch(`${API_BASE_URL}/invoices/${id}/tax`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ taxRate }),
    });
    return response.json();
  },

  // 3 & 4. Archive/Restore
  toggleArchive: async (
    id: string | number,
    isArchived: boolean,
  ): Promise<Invoice> => {
    const response = await fetch(`${API_BASE_URL}/invoices/${id}/archive`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ isArchived }),
    });
    if (!response.ok) throw new Error("Archive toggle failed");
    return response.json();
  },
};
