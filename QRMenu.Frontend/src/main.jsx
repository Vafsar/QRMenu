import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

import { isAuthenticated, getRole } from './services/authService';
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
import WaiterLayout from './pages/Waiter/WaiterLayout';
import WaiterOrderPage from './pages/Waiter/WaiterOrderPage';

function ProtectedRoute({ children, allowedRoles }) {
  if (!isAuthenticated()) return <Navigate to="/admin/login" replace />;
  const role = getRole();
  if (!role) return <Navigate to="/admin/login" replace />;
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={role === 'Waiter' ? '/waiter' : '/admin'} replace />;
  }
  return children;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Müşteri rotaları */}
        <Route path="/menu/:tableId" element={
          <CartProvider><CustomerMenu /></CartProvider>
        } />
        <Route path="/order-success" element={<OrderSuccess />} />

        {/* Giriş */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin rotaları */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['Admin']}><AdminLayout /></ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="items" element={<AdminMenuItems />} />
          <Route path="tables" element={<AdminTables />} />
          <Route path="orders" element={<AdminOrders />} />
        </Route>

        {/* Garson rotaları */}
        <Route path="/waiter" element={
          <ProtectedRoute allowedRoles={['Waiter']}><WaiterLayout /></ProtectedRoute>
        }>
          <Route index element={<WaiterOrderPage />} />
          <Route path="orders" element={<AdminOrders />} />
        </Route>

        <Route path="/" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
