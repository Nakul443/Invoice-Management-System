// UI, page that fetches invoice details and displays them

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { invoiceService } from '../services/api';
import type { Invoice } from '../types/invoice';

export default function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  
  // New State for Payment Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    if (!id) return;
    try {
      const data = await invoiceService.getInvoice(id);
      setInvoice(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || paymentAmount <= 0) return;

    setIsSubmitting(true);
    try {
      const updatedInvoice = await invoiceService.addPayment(id, paymentAmount);
      setInvoice(updatedInvoice); // Update UI with fresh data from backend
      setIsModalOpen(false);
      setPaymentAmount(0);
    } catch (err) {
      alert("Payment failed: " + err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!invoice) return <div className="p-10 text-center">Invoice not found.</div>;

  return (
    <div className="max-w-4xl mx-auto p-8 my-10 relative">
      {/* Existing Header & Stats Grid (Keep your previous code here) */}
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">Payments & Items</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-bold transition-all shadow-md shadow-blue-200"
        >
          + Record Payment
        </button>
      </div>

      {/* Line Items Table (Your existing table code) */}

      {/* --- PAYMENT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Record Payment</h3>
            <p className="text-slate-500 mb-6 text-sm">Enter the amount received from the customer.</p>
            
            <form onSubmit={handlePayment}>
              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Amount ($)</label>
                <input 
                  type="number" 
                  step="0.01"
                  max={invoice.balanceDue}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="0.00"
                  required
                />
                <p className="mt-2 text-xs text-slate-400">Max allowed: ${invoice.balanceDue}</p>
              </div>

              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting || paymentAmount <= 0}
                  className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-200"
                >
                  {isSubmitting ? 'Processing...' : 'Confirm Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}