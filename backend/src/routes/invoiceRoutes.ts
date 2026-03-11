import { Router } from 'express';
import { 
  getInvoiceById, 
  addPayment, 
  toggleArchive, 
  createLineItem,
  updateInvoiceTax,
  createInvoice
} from '../controllers/invoiceControllers.js'; // Match your filename 'invoiceControllers.ts'
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

// 1. Get Invoice Details
router.get('/:id', authenticateToken, getInvoiceById);

// Create Invoice (New)
router.post('/', authenticateToken, createInvoice);

// 2. Add Payment
router.post('/:id/payments', authenticateToken, addPayment);

router.patch('/:id/tax', authenticateToken, updateInvoiceTax);

router.post('/:id/items', authenticateToken, createLineItem);

// 3 & 4. Archive/Restore Invoice
router.post('/:id/archive', authenticateToken, toggleArchive);

export default router;