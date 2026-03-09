// decides which page to show based on the url
// eg: /invoice/1 shows invoice with id 1

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import InvoiceDetail from './pages/InvoiceDetail';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900">
        <Routes>
          {/* Automatically sends you to invoice 1 */}
          <Route path="/" element={<Navigate to="/invoice/1" replace />} />
          
          {/* The Dynamic Route */}
          <Route path="/invoice/:id" element={<InvoiceDetail />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;