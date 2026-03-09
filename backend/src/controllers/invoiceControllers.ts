// this file contains the logic for invoice related endpoints
// routes makes the call to these functions

import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 1. Get Invoice Details
export const getInvoiceById = async (
  req: any,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const loggedInUserId = req.user.userId; // This comes from our authenticateToken middleware

    const invoice = await prisma.invoice.findUnique({
      where: { id: Number(id) },
      include: {
        lineItems: true,
        payments: true,
      },
    });

    // CHECK: Does invoice exist AND does it belong to the current user?
    if (!invoice || invoice.userId !== loggedInUserId) {
      res.status(404).json({ message: "Invoice not found or access denied" });
      return;
    }

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// 2. Add Payment (with Business Rules)
export const addPayment = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      res.status(400).json({ message: "Amount must be greater than 0" });
      return;
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: Number(id) },
    });
    if (!invoice) {
      res.status(404).json({ message: "Invoice not found" });
      return;
    }

    if (amount > invoice.balanceDue) {
      res.status(400).json({ message: "Payment exceeds balance due" });
      return;
    }

    const updatedInvoice = await prisma.$transaction(async (tx) => {
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
          status: newBalance === 0 ? "PAID" : invoice.status,
        },
        // Include relations so the frontend doesn't crash on update
        include: {
          lineItems: true,
          payments: true,
        },
      });
    });

    res.json(updatedInvoice);
  } catch (error) {
    res.status(500).json({ error: "Payment processing failed" });
  }
};

export const createInvoice = async (req: any, res: any) => {
  try {
    const { customerName, dueDate } = req.body;
    const userId = req.user.id; // From authenticateToken middleware

    // Generate a simple unique invoice number (e.g., INV-1710255...)
    const invoiceNumber = `INV-${Date.now()}`;

    const newInvoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        customerName,
        dueDate: new Date(dueDate),
        issueDate: new Date(),
        status: "DRAFT",
        userId: userId,
        // Prisma will use defaults for total, amountPaid, etc.
      }
    });

    res.status(201).json(newInvoice);
  } catch (error) {
    console.error("Create Invoice Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 3 & 4. Archive & Restore Invoice
export const toggleArchive = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { isArchived } = req.body; // Expecting { "isArchived": true } or false

    const updated = await prisma.invoice.update({
      where: { id: Number(id) },
      data: { isArchived: Boolean(isArchived) },
      // Include relations so the frontend doesn't crash on update
      include: {
        lineItems: true,
        payments: true,
      },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update archive status" });
  }
};

// create new line item for invoice
export const createLineItem = async (req: any, res: any) => {
  try {
    const { id } = req.params; // The Invoice ID
    const { description, quantity, unitPrice } = req.body;

    // 1. Calculate the total for this specific line
    const lineTotal = quantity * unitPrice;

    // 2. Use a Transaction to ensure the item is saved AND the invoice is updated
    const result = await prisma.$transaction(async (tx) => {
      // Create the new line item
      const newItem = await tx.invoiceLine.create({
        data: {
          invoiceId: Number(id),
          description,
          quantity: Number(quantity),
          unitPrice: Number(unitPrice),
          lineTotal: lineTotal,
        },
      });

      // Fetch the invoice to get current tax rate and totals
      const invoice = await tx.invoice.findUnique({
        where: { id: Number(id) },
      });

      if (!invoice) throw new Error("Invoice not found");

      // Calculate new overall totals
      const newTotal = invoice.total + lineTotal; 
      // Note: If you want to include tax in the DB 'total', 
      // you'd multiply lineTotal * (1 + invoice.taxRate) here.
      
      const newBalance = newTotal - invoice.amountPaid;

      // Update the parent Invoice
      await tx.invoice.update({
        where: { id: Number(id) },
        data: {
          total: newTotal,
          balanceDue: newBalance,
        },
      });

      return newItem;
    });

    res.status(201).json(result);
  } catch (error) {
    console.error("Create Line Item Error:", error);
    res.status(500).json({ message: "Failed to add item to invoice" });
  }
};
