import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { invoiceService } from '../services/api';

export default function Dashboard() {
  const [userName, setUserName] = useState('');
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Load User and Fetch Invoices
  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    setUserName(storedName || 'User');

    const fetchInvoices = async () => {
      try {
        const data = await invoiceService.getInvoices();
        setInvoices(data);
      } catch (err) {
        console.error("Failed to fetch invoices", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const newInvoice = await invoiceService.createInvoice({
        customerName,
        dueDate,
      });
      setIsModalOpen(false);
      navigate(`/invoice/${newInvoice.id}`);
    } catch (err) {
      alert("Failed to create invoice. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Overdue Logic Styles
  const getStatusStyles = (invoice: any) => {
    if (invoice.status === 'PAID') return "bg-emerald-100 text-emerald-700";
    const isOverdue = new Date(invoice.dueDate) < new Date();
    if (isOverdue) return "bg-rose-100 text-rose-700";
    return "bg-slate-100 text-slate-700";
  };

  // 3. Stats Calculations
  const totalRevenue = invoices
    .filter(inv => inv.status === 'PAID')
    .reduce((sum, inv) => sum + (inv.total || 0), 0);
  
  const pendingBalance = invoices
    .filter(inv => inv.status !== 'PAID')
    .reduce((sum, inv) => sum + (inv.total || 0), 0);

  return (
    <div className="min-h-screen bg-[#F8F9FB] font-sans text-slate-900 p-4 md:p-10">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Welcome back, <span className="text-indigo-600">{userName}</span>!
            </h1>
            <p className="text-slate-500 mt-1 font-medium">Here's what's happening with your invoices today.</p>
          </div>
          
          <button 
            onClick={handleLogout}
            className="px-6 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-all"
          >
            Logout
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Total Collected</p>
            <p className="text-3xl font-bold">₹{totalRevenue.toLocaleString()}</p>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Pending Balance</p>
            <p className="text-3xl font-bold text-amber-600">₹{pendingBalance.toLocaleString()}</p>
            <p className="mt-4 text-slate-400 text-xs font-medium">
              {invoices.filter(i => i.status !== 'PAID').length} invoices awaiting payment
            </p>
          </div>

          <div className="bg-indigo-600 p-8 rounded-[2.5rem] shadow-xl shadow-indigo-100 text-white">
            <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mb-2">Actions</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full mt-4 py-4 bg-white text-indigo-600 rounded-2xl font-bold text-sm hover:bg-indigo-50 transition-all shadow-lg"
            >
              + Create New Invoice
            </button>
          </div>
        </div>

        {/* Invoice Table Section */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-900">Recent Invoices</h3>
          </div>
          
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-20 text-center text-slate-400">Loading invoices...</div>
            ) : invoices.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                    <th className="px-8 py-4">Client</th>
                    <th className="px-8 py-4">Status</th>
                    <th className="px-8 py-4">Due Date</th>
                    <th className="px-8 py-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {invoices.map((inv) => (
                    <tr 
                      key={inv.id} 
                      onClick={() => navigate(`/invoice/${inv.id}`)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="px-8 py-5 font-bold text-slate-700">{inv.customerName}</td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusStyles(inv)}`}>
                          {inv.status === 'PAID' ? 'Paid' : (new Date(inv.dueDate) < new Date() ? 'Overdue' : 'Draft')}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-sm font-medium text-slate-500">
                        {new Date(inv.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-8 py-5 text-right font-bold text-slate-900">
                        ₹{inv.total?.toLocaleString() || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-20 text-center">
                <p className="text-slate-400 font-medium">No invoices found. Create your first one!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- CREATE INVOICE MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">New Invoice</h3>
              <p className="text-slate-500 text-sm font-medium mt-1">Set up a new client billing cycle.</p>
            </div>
            
            <form onSubmit={handleCreateInvoice} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Client Name</label>
                <input 
                  type="text" required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all font-medium"
                  placeholder="e.g. Acme Corp"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Due Date</label>
                <input 
                  type="date" required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all font-medium"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 font-bold text-slate-500 hover:bg-slate-50 rounded-2xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting || !customerName || !dueDate}
                  className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 disabled:bg-slate-200 transition-all shadow-lg"
                >
                  {isSubmitting ? 'Creating...' : 'Create Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}