// this file authenticates the user
// intercepts the incoming request and checks if the token is valid before allowing access to protected routes
// it checks for the presence of a JWT token in the "Authorization" header of the request
// if the token is valid, it allows the request to proceed to the next middleware or controller
// if the token is missing or invalid, it responds with an error message

import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'default';

export const authenticateToken = (req: any, res: Response, next: NextFunction) => {
  // 1. Get the token from the "Authorization" header
  // looks for a header like Authorization: Bearer <your_token>
  // if no token is found, then error is thrown
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // 2. If there is no token, deny access
  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  // 3. Verify the token
  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token." });
    }

    // 4. Attach the user info to the request so controllers can use it
    req.user = decoded;
    next();
  });
};

export const createInvoice = async (req: any, res: any) => {
  try {
    const { customerName, dueDate } = req.body;
    
    // CHANGE THIS: Match the property name used in getInvoiceById
    const userId = req.user.userId; 

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: No user ID found" });
    }

    const invoiceNumber = `INV-${Date.now()}`;

    const newInvoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        customerName,
        dueDate: new Date(dueDate),
        issueDate: new Date(),
        status: "DRAFT",
        userId: userId, // Now this will be a valid number
      },
      // IMPORTANT: Include these so the frontend frontend state 
      // stays consistent with your interface
      include: {
        lineItems: true,
        payments: true,
      }
    });

    res.status(201).json(newInvoice);
  } catch (error) {
    console.error("Create Invoice Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};