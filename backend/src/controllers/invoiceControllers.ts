// this file contains the logic for invoice related endpoints
// routes makes the call to these functions

import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 1. Get Invoice Details
export const getInvoiceById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const invoice = await prisma.invoice.findUnique({
      where: { id: Number(id) },
      include: {
        lineItems: true,
        payments: true,
      },
    });

    if (!invoice) {
      res.status(404).json({ message: 'Invoice not found' });
      return;
    }
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 2. Add Payment (with Business Rules)
export const addPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      res.status(400).json({ message: 'Amount must be greater than 0' });
      return;
    }

    const invoice = await prisma.invoice.findUnique({ where: { id: Number(id) } });
    if (!invoice) {
      res.status(404).json({ message: 'Invoice not found' });
      return;
    }

    if (amount > invoice.balanceDue) {
      res.status(400).json({ message: 'Payment exceeds balance due' });
      return;
    }

    const updatedInvoice = await prisma.$transaction(async (tx) => {
      await tx.payment.create({
        data: { amount, invoiceId: Number(id) }
      });

      const newPaid = invoice.amountPaid + amount;
      const newBalance = invoice.total - newPaid;

      return await tx.invoice.update({
        where: { id: Number(id) },
        data: {
          amountPaid: newPaid,
          balanceDue: newBalance,
          status: newBalance === 0 ? 'PAID' : invoice.status
        },
        // Include relations so the frontend doesn't crash on update
        include: {
          lineItems: true,
          payments: true,
        }
      });
    });

    res.json(updatedInvoice);
  } catch (error) {
    res.status(500).json({ error: 'Payment processing failed' });
  }
};

// 3 & 4. Archive & Restore Invoice
export const toggleArchive = async (req: Request, res: Response): Promise<void> => {
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
      }
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update archive status' });
  }
};