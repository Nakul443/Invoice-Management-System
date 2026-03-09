import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Get the name we saved during login/register
    const storedName = localStorage.getItem('userName');
    setUserName(storedName || 'User');
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

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
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Total Revenue</p>
            <p className="text-3xl font-bold">₹1,24,500</p>
            <div className="mt-4 flex items-center text-emerald-600 text-xs font-bold">
              <span className="bg-emerald-50 px-2 py-1 rounded-lg">↑ 12% from last month</span>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Pending Balance</p>
            <p className="text-3xl font-bold text-amber-600">₹42,000</p>
            <p className="mt-4 text-slate-400 text-xs font-medium">8 invoices awaiting payment</p>
          </div>

          <div className="bg-indigo-600 p-8 rounded-[2.5rem] shadow-xl shadow-indigo-100 text-white">
            <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mb-2">Quick Actions</p>
            <div className="space-y-3 mt-4">
              <button 
                onClick={() => navigate('/invoice/1')}
                className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-2xl font-bold text-sm transition-all"
              >
                View Latest Invoice
              </button>
              <button className="w-full py-3 bg-indigo-500 rounded-2xl font-bold text-sm hover:bg-indigo-400 transition-all">
                + Create New Invoice
              </button>
            </div>
          </div>
        </div>

        {/* Placeholder for Recent Activity */}
        <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 text-center py-20">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No recent activity</h3>
          <p className="text-slate-500 font-medium max-w-xs mx-auto">
            Once you start creating and managing invoices, your activity feed will appear here.
          </p>
        </div>

      </div>
    </div>
  );
}