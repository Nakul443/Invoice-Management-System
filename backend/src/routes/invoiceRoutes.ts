import { Router } from 'express';
import { 
  getInvoiceById, 
  addPayment, 
  toggleArchive 
} from '../controllers/invoiceControllers.js'; // Match your filename 'invoiceControllers.ts'

const router = Router();

// 1. Get Invoice Details
router.get('/:id', getInvoiceById);

// 2. Add Payment
router.post('/:id/payments', addPayment);

// 3 & 4. Archive/Restore Invoice
router.post('/:id/archive', toggleArchive);

export default router;