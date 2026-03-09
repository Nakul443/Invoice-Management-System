// decides which page to show based on the url
// eg: /invoice/1 shows invoice with id 1

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import InvoiceDetail from './pages/InvoiceDetail';
import Login from './pages/Login';
import type { JSX } from 'react/jsx-runtime';

// A simple wrapper to protect routes
// checks local storage for JWT
// if it's missing, the user is redirected to the login page
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Route - Only accessible if logged in */}
        <Route 
          path="/invoice/:id" 
          element={
            <PrivateRoute>
              <InvoiceDetail />
            </PrivateRoute>
          } 
        />

        {/* Default redirect (e.g., go to a specific invoice or dashboard) */}
        <Route path="/" element={<Navigate to="/invoice/1" />} />
      </Routes>
    </Router>
  );
}

export default App;