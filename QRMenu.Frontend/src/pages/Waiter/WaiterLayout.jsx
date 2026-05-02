import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { clearAuth, getUsername } from '../../services/authService';
import '../Admin/AdminLayout.css';
import './WaiterLayout.css';

const navItems = [
  { to: '/waiter', label: 'Sipariş Al', icon: '◎', end: true },
  { to: '/waiter/orders', label: 'Siparişler', icon: '⊞' },
];

export default function WaiterLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const username = getUsername() || 'Garson';

  const handleLogout = () => {
    clearAuth();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="admin-layout">
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <aside className={`sidebar waiter-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="logo-icon">◎</span>
            <div>
              <div className="logo-title">QR Menü</div>
              <div className="logo-sub">Garson Paneli</div>
            </div>
          </div>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <span className="user-avatar">◉</span>
            <span className="user-name">{username}</span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            ⊗ Çıkış
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <button className="menu-toggle" onClick={() => setSidebarOpen(true)}>☰</button>
          <div className="topbar-title">Garson Paneli</div>
          <div className="topbar-actions">
            <button className="btn btn-ghost btn-sm topbar-logout" onClick={handleLogout}>
              ⊗ Çıkış
            </button>
          </div>
        </header>
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
