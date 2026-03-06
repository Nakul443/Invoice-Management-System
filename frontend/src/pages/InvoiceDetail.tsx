// UI, page that fetches invoice details and displays them
// handles the logic (It handles the logic (fetching data on load) and the visual layout)

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { invoiceService } from '../services/api';
import type { Invoice } from '../types/invoice';

export default function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await invoiceService.getInvoice(id);
      setInvoice(data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || paymentAmount <= 0) return;

    setIsSubmitting(true);
    try {
      const updatedInvoice = await invoiceService.addPayment(id, paymentAmount);
      setInvoice(updatedInvoice);
      setIsModalOpen(false);
      setPaymentAmount(0);
    } catch (err) {
      alert("Payment failed: " + err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleArchive = async () => {
    if (!id || !invoice) return;
    try {
      const updatedInvoice = await invoiceService.toggleArchive(id, !invoice.isArchived);
      setInvoice(updatedInvoice);
    } catch (err) {
      alert("Archive toggle failed: " + err);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
    </div>
  );

  if (!invoice) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center p-8 bg-white shadow-xl rounded-2xl">
        <h2 className="text-2xl font-bold text-slate-800">Invoice not found</h2>
        <p className="text-slate-500 mt-2">The record you are looking for doesn't exist.</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 my-10 relative">
      
      {/* Archive Warning Banner */}
      {invoice.isArchived && (
        <div className="bg-amber-500 text-white text-center py-2 rounded-t-2xl font-bold text-sm tracking-wider uppercase">
          This Invoice is Archived
        </div>
      )}

      <div className={`bg-white shadow-2xl rounded-2xl overflow-hidden border ${invoice.isArchived ? 'border-amber-200 opacity-90' : 'border-slate-100'}`}>
        
        {/* Header Section */}
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-blue-600">Invoice Detail</span>
            <h1 className="text-4xl font-black text-slate-900 mt-1">{invoice.invoiceNumber}</h1>
            <p className="text-slate-500 font-medium mt-1">Client: {invoice.customerName}</p>
          </div>
          
          <div className="flex flex-col items-end gap-3 w-full md:w-auto">
            <div className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-tighter ${
              invoice.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {invoice.status}
            </div>
            <button 
              onClick={handleToggleArchive}
              className={`text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg border transition-all ${
                invoice.isArchived 
                ? 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100' 
                : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
              }`}
            >
              {invoice.isArchived ? 'Restore Invoice' : 'Archive Invoice'}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 bg-slate-50/50">
          <div className="p-8 text-center md:text-left">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Amount</p>
            <p className="text-3xl font-black text-slate-800 mt-1">${invoice.total.toLocaleString()}</p>
          </div>
          <div className="p-8 text-center md:text-left">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Amount Paid</p>
            <p className="text-3xl font-black text-emerald-600 mt-1">${invoice.amountPaid.toLocaleString()}</p>
          </div>
          <div className="p-8 text-center md:text-left bg-blue-50/30">
            <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">Balance Due</p>
            <p className="text-3xl font-black text-blue-700 mt-1">${invoice.balanceDue.toLocaleString()}</p>
          </div>
        </div>

        {/* Table & Actions */}
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Line Items</h2>
            <button 
              onClick={() => setIsModalOpen(true)}
              disabled={invoice.balanceDue <= 0 || invoice.isArchived}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-200 flex items-center gap-2"
            >
              <span>+</span> Record Payment
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Qty</th>
                  <th className="px-6 py-4">Unit Price</th>
                  <th className="px-6 py-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.lineItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-6 py-4 text-slate-700 font-semibold">{item.description}</td>
                    <td className="px-6 py-4 text-slate-500">{item.quantity}</td>
                    <td className="px-6 py-4 text-slate-500">${item.unitPrice.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right text-slate-900 font-black">${item.lineTotal.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- PAYMENT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Record Payment</h3>
                <p className="text-slate-500 text-sm mt-1 font-medium">Updating balance for {invoice.invoiceNumber}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-2xl">×</button>
            </div>
            
            <form onSubmit={handlePayment}>
              <div className="mb-8">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Payment Amount ($)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">$</span>
                  <input 
                    type="number" 
                    step="0.01"
                    max={invoice.balanceDue}
                    autoFocus
                    value={paymentAmount || ''}
                    onChange={(e) => setPaymentAmount(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-3xl font-black text-slate-800 focus:border-blue-500 focus:ring-0 outline-none transition-all placeholder:text-slate-200"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="flex justify-between mt-3 px-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Max Payable</span>
                  <span className="text-[10px] font-black text-blue-600 uppercase">${invoice.balanceDue.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 font-bold text-slate-500 hover:bg-slate-100 rounded-2xl transition-all"
                >
                  Go Back
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting || paymentAmount <= 0 || paymentAmount > invoice.balanceDue}
                  className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 transition-all shadow-xl shadow-blue-200"
                >
                  {isSubmitting ? 'Syncing...' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}