// this file contains the logic for invoice related endpoints
// routes makes the call to these functions

import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * HELPER: Unified User ID Extractor
 * Ensures we handle both 'id' and 'userId' naming from the token
 */
const getUserId = (req: any) => req.user?.userId || req.user?.id;

// 1. Get Invoice Details
export const getInvoiceById = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const loggedInUserId = getUserId(req);

    const invoice = await prisma.invoice.findUnique({
      where: { id: Number(id) },
      include: {
        lineItems: true,
        payments: true,
      },
    });

    if (!invoice || invoice.userId !== loggedInUserId) {
      res.status(404).json({ message: "Invoice not found or access denied" });
      return;
    }

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getInvoices = async (req: any, res: any) => {
  try {
    const userId = getUserId(req); // Use the helper for consistency
    const invoices = await prisma.invoice.findMany({
      where: { userId: userId },
      orderBy: { id: 'desc' } // Shows newest first
    });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
};

// 2. Create New Invoice
export const createInvoice = async (req: any, res: any) => {
  try {
    const { customerName, dueDate, currency } = req.body;
    const userId = getUserId(req);

    const newInvoice = await prisma.invoice.create({
      data: {
        invoiceNumber: `INV-${Date.now()}`,
        customerName,
        issueDate: new Date(), // Add this to match your new schema
        dueDate: new Date(dueDate),
        userId,
        currency: currency || "INR",
        status: "DRAFT",
        total: 0,
        balanceDue: 0,
        amountPaid: 0,
      }
    });
    res.status(201).json(newInvoice);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create invoice" });
  }
};

// 3. Add Line Item (With Proper Tax Calculation)
export const createLineItem = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { description, quantity, unitPrice } = req.body;
    const lineTotal = quantity * unitPrice;

    const result = await prisma.$transaction(async (tx) => {
      await tx.invoiceLine.create({
        data: {
          invoiceId: Number(id),
          description,
          quantity: Number(quantity),
          unitPrice: Number(unitPrice),
          lineTotal: lineTotal,
        },
      });

      const invoice = await tx.invoice.findUnique({
        where: { id: Number(id) },
        include: { lineItems: true }
      });

      if (!invoice) throw new Error("Invoice not found");

      // Calculate totals based on ALL items + Tax Rate
      const subtotal = invoice.lineItems.reduce((acc, item) => acc + item.lineTotal, 0);
      const taxAmount = subtotal * invoice.taxRate;
      const totalWithTax = subtotal + taxAmount;
      const newBalance = totalWithTax - invoice.amountPaid;

      return await tx.invoice.update({
        where: { id: Number(id) },
        data: {
          total: totalWithTax,
          balanceDue: newBalance,
        },
        include: { lineItems: true, payments: true }
      });
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to add item" });
  }
};

// 4. Update Tax Rate
export const updateInvoiceTax = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { taxRate } = req.body;

    const updated = await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findUnique({
        where: { id: Number(id) },
        include: { lineItems: true }
      });

      if (!invoice) throw new Error("Invoice not found");

      const subtotal = invoice.lineItems.reduce((sum, item) => sum + item.lineTotal, 0);
      const taxAmount = subtotal * taxRate;
      const newTotal = subtotal + taxAmount;
      const newBalance = newTotal - invoice.amountPaid;

      return await tx.invoice.update({
        where: { id: Number(id) },
        data: {
          taxRate: taxRate,
          total: newTotal,
          balanceDue: newBalance
        },
        include: { lineItems: true, payments: true }
      });
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Failed to update tax" });
  }
};

// 5. Add Payment
export const addPayment = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findUnique({ where: { id: Number(id) } });
      if (!invoice) throw new Error("Not found");

      await tx.payment.create({
        data: { amount, invoiceId: Number(id) },
      });

      const newPaid = invoice.amountPaid + amount;
      const newBalance = invoice.total - newPaid;

      return await tx.invoice.update({
        where: { id: Number(id) },
        data: {
          amountPaid: newPaid,
          balanceDue: newBalance,
          status: newBalance <= 0 ? "PAID" : "DRAFT",
        },
        include: { lineItems: true, payments: true }
      });
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Payment failed" });
  }
};

// 6. Archive/Restore
export const toggleArchive = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isArchived } = req.body;

    const updated = await prisma.invoice.update({
      where: { id: Number(id) },
      data: { isArchived: Boolean(isArchived) },
      include: { lineItems: true, payments: true },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Archive failed" });
  }
};