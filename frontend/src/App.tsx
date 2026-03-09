// decides which page to show based on the url
// eg: /invoice/1 shows invoice with id 1

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import InvoiceDetail from "./pages/InvoiceDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import type { JSX } from "react/jsx-runtime";
import Dashboard from "./pages/Dashboard";

// PROTECTED: No token? Go to login.
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
};

// PUBLIC: Already logged in? Go to dashboard.
const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem("token");
  return token ? <Navigate to="/dashboard" replace /> : children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* 1. Root forces the URL to /register */}
        <Route path="/" element={<Navigate to="/register" replace />} />

        {/* 2. REMOVED PublicRoute from Register */}
        {/* Now, even if you are logged in, this page WILL show */}
        <Route path="/register" element={<Register />} />

        {/* 3. KEEP PublicRoute for Login (optional, but standard) */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* 4. Dashboard (Protected) */}
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />

        {/* ... other routes */}
      </Routes>
    </Router>
  );
}

export default App;
