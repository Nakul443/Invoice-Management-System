// this file is the main invoice details page

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
      // If invoice doesn't exist, stop loading so we can show the "Not Found" UI
      setInvoice(null); 
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
      if (updatedInvoice) setInvoice(updatedInvoice);
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
      if (updatedInvoice && updatedInvoice.lineItems) {
        setInvoice(updatedInvoice);
      } else {
        await fetchData();
      }
    } catch (err) {
      alert("Archive toggle failed: " + err);
    }
  };

  // --- TAX & TOTAL CALCULATIONS ---
  const subtotal = invoice ? (invoice.lineItems || []).reduce((acc, item) => acc + item.lineTotal, 0) : 0;
  const taxRate = invoice?.taxRate || 0.10; 
  const taxAmount = subtotal * taxRate;
  const totalWithTax = subtotal + taxAmount;
  const amountPaid = invoice ? (invoice.payments || []).reduce((acc, p) => acc + p.amount, 0) : 0;
  const balanceDue = totalWithTax - amountPaid;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FB]">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!invoice) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FB] font-sans">
      <div className="text-center p-12 bg-white rounded-3xl shadow-sm border border-slate-100">
        <h2 className="text-2xl font-bold text-slate-900">Invoice not found</h2>
        <p className="text-slate-500 mt-2">The requested ID is missing or invalid.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FB] font-sans text-slate-900 p-4 md:p-10">
      <div className="max-w-6xl mx-auto">
        
        {/* Navigation Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-slate-400 text-sm font-medium mb-1">
              <span>Invoices</span>
              <span>/</span>
              <span className="text-slate-900">{invoice.invoiceNumber}</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Invoice Details</h1>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button 
              onClick={handleToggleArchive}
              className="flex-1 md:flex-none px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-all"
            >
              {invoice.isArchived ? 'Restore' : 'Archive'}
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              disabled={balanceDue <= 0 || invoice.isArchived}
              className="flex-1 md:flex-none px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 disabled:bg-slate-300 transition-all shadow-lg shadow-indigo-100"
            >
              Record Payment
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Invoice Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">Items Summary</h3>
                  <p className="text-sm text-slate-500 font-medium">Detailed breakdown of charges</p>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                  balanceDue <= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                }`}>
                  {balanceDue <= 0 ? 'PAID' : 'PENDING'}
                </div>
              </div>

              <div className="overflow-hidden">
                <table className="w-full text-left border-separate border-spacing-y-4">
                  <thead>
                    <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-4">
                      <th className="pb-2 pl-4">Description</th>
                      <th className="pb-2">Qty</th>
                      <th className="pb-2">Price</th>
                      <th className="pb-2 pr-4 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(invoice.lineItems || []).map((item) => (
                      <tr key={item.id} className="group">
                        <td className="py-5 pl-4 bg-slate-50 rounded-l-2xl group-hover:bg-slate-100 transition-colors">
                          <span className="font-bold text-slate-800">{item.description}</span>
                        </td>
                        <td className="py-5 bg-slate-50 group-hover:bg-slate-100 transition-colors">
                          <span className="text-slate-500 font-medium">{item.quantity}</span>
                        </td>
                        <td className="py-5 bg-slate-50 group-hover:bg-slate-100 transition-colors">
                          <span className="text-slate-500 font-medium">₹{item.unitPrice.toLocaleString()}</span>
                        </td>
                        <td className="py-5 pr-4 bg-slate-50 rounded-r-2xl text-right group-hover:bg-slate-100 transition-colors">
                          <span className="font-bold text-slate-900">₹{item.lineTotal.toLocaleString()}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payment History */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Payment Activity</h3>
              <div className="space-y-4">
                {invoice.payments && invoice.payments.length > 0 ? invoice.payments.map((p) => (
                  <div key={p.id} className="flex justify-between items-center p-4 rounded-2xl border border-slate-50 hover:border-indigo-100 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">Payment Received</p>
                        <p className="text-xs text-slate-400 font-medium">{new Date(p.paymentDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className="font-bold text-emerald-600 text-sm">+ ₹{p.amount.toLocaleString()}</span>
                  </div>
                )) : (
                  <p className="text-sm text-slate-400 font-medium italic">No payments recorded yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Financial Sidebar */}
          <div className="space-y-6">
            <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-100">
              <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mb-6">Financial Summary</p>
              
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-indigo-200">Subtotal</span>
                  <span className="font-bold">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-indigo-200">Tax ({(taxRate * 100).toFixed(0)}%)</span>
                  <span className="font-bold">₹{taxAmount.toLocaleString()}</span>
                </div>
                
                <div className="h-px bg-indigo-500/30 my-2"></div>
                
                <div>
                  <p className="text-indigo-200 text-sm font-medium mb-1">Total Amount</p>
                  <p className="text-3xl font-bold">₹{totalWithTax.toLocaleString()}</p>
                </div>

                <div className="h-px bg-indigo-500/30 my-2"></div>

                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-indigo-200 text-sm font-medium mb-1">Paid to date</p>
                    <p className="text-xl font-bold text-emerald-300">₹{amountPaid.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-indigo-200 text-sm font-medium mb-1">Balance Due</p>
                    <p className="text-xl font-bold text-white">₹{balanceDue.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6">Customer Details</h4>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase mb-1">Client Name</p>
                  <p className="text-sm font-bold text-slate-800">{invoice.customerName}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase mb-1">Issue Date</p>
                  <p className="text-sm font-bold text-slate-800">{new Date(invoice.issueDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase mb-1">Due Date</p>
                  <p className="text-sm font-bold text-slate-800">{new Date(invoice.dueDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- PAYMENT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-[2rem] p-10 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Add Payment</h3>
              <p className="text-slate-500 text-sm font-medium mt-1">Record a manual payment entry.</p>
            </div>
            
            <form onSubmit={handlePayment} className="space-y-8">
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Amount to Pay (₹)</label>
                <div className="relative group">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-300 group-focus-within:text-indigo-500 transition-colors">₹</span>
                  <input 
                    type="number" step="0.01" max={balanceDue} autoFocus
                    value={paymentAmount || ''}
                    onChange={(e) => setPaymentAmount(Number(e.target.value))}
                    className="w-full pl-12 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-2xl font-bold text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
                    placeholder="0.00" required
                  />
                </div>
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-tight">
                  <span className="text-slate-400">Current Balance</span>
                  <span className="text-indigo-600">₹{balanceDue.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-bold text-slate-500 hover:bg-slate-50 rounded-2xl transition-all">Cancel</button>
                <button type="submit" disabled={isSubmitting || paymentAmount <= 0} className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 disabled:bg-slate-200 transition-all">
                  {isSubmitting ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}