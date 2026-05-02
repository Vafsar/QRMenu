import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

import { isAuthenticated } from './services/authService';
import { CartProvider } from './context/CartContext';
import CustomerMenu from './pages/Customer/CustomerMenu';
import OrderSuccess from './pages/Customer/OrderSuccess';
import AdminLogin from './pages/Admin/AdminLogin';
import AdminLayout from './pages/Admin/AdminLayout';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminCategories from './pages/Admin/AdminCategories';
import AdminMenuItems from './pages/Admin/AdminMenuItems';
import AdminTables from './pages/Admin/AdminTables';
import AdminOrders from './pages/Admin/AdminOrders';

function ProtectedRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/admin/login" replace />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Customer Routes */}
        <Route path="/menu/:tableId" element={
          <CartProvider><CustomerMenu /></CartProvider>
        } />
        <Route path="/order-success" element={<OrderSuccess />} />

        {/* Admin Login */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin Routes — korumalı */}
        <Route path="/admin" element={
          <ProtectedRoute><AdminLayout /></ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="items" element={<AdminMenuItems />} />
          <Route path="tables" element={<AdminTables />} />
          <Route path="orders" element={<AdminOrders />} />
        </Route>

        <Route path="/" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
