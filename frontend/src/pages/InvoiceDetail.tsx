// UI, page that fetches invoice details and displays them

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { invoiceService } from '../services/api';
import type { Invoice } from '../types/invoice';

export default function InvoiceDetail() {
  const { id } = useParams<{ id: string }>(); // Dynamically get ID from URL
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchInvoice = async () => {
      try {
        setLoading(true);
        const data = await invoiceService.getInvoice(id);
        setInvoice(data);
      } catch (err) {
        setError("Could not find this invoice.");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [id]); // Re-run if the URL ID changes

  if (loading) return <div className="p-10 text-center animate-pulse">Fetching details...</div>;
  if (error || !invoice) return <div className="p-10 text-center text-red-500 font-bold">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-xl rounded-xl border border-gray-100 my-10">
      {/* Dynamic Header */}
      <div className="flex justify-between items-center border-b pb-6 mb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-blue-500">Invoice Detail</span>
          <h1 className="text-4xl font-black text-slate-900 mt-1">{invoice.invoiceNumber}</h1>
        </div>
        <div className={`px-6 py-2 rounded-full text-sm font-black uppercase tracking-tighter ${
          invoice.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
        }`}>
          {invoice.status}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase">Grand Total</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">${invoice.total}</p>
        </div>
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase">Total Collected</p>
          <p className="text-3xl font-bold text-emerald-600 mt-1">${invoice.amountPaid}</p>
        </div>
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
          <p className="text-xs font-bold text-blue-400 uppercase">Remaining Balance</p>
          <p className="text-3xl font-bold text-blue-700 mt-1">${invoice.balanceDue}</p>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="overflow-hidden rounded-xl border border-slate-100 mb-10">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr className="text-xs font-bold text-slate-500 uppercase">
              <th className="px-6 py-4">Description</th>
              <th className="px-6 py-4">Quantity</th>
              <th className="px-6 py-4">Unit Price</th>
              <th className="px-6 py-4 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoice.lineItems.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 text-slate-700 font-medium">{item.description}</td>
                <td className="px-6 py-4 text-slate-600">{item.quantity}</td>
                <td className="px-6 py-4 text-slate-600">${item.unitPrice}</td>
                <td className="px-6 py-4 text-right text-slate-900 font-bold">${item.lineTotal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}