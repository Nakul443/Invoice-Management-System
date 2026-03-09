import { Router } from 'express';
import { 
  getInvoiceById, 
  addPayment, 
  toggleArchive 
} from '../controllers/invoiceControllers.js'; // Match your filename 'invoiceControllers.ts'
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

// 1. Get Invoice Details
router.get('/:id', authenticateToken, getInvoiceById);

// 2. Add Payment
router.post('/:id/payments', authenticateToken, addPayment);

// 3 & 4. Archive/Restore Invoice
router.post('/:id/archive', authenticateToken, toggleArchive);

export default router;