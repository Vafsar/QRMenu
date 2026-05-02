import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { clearAuth, getUsername } from '../../services/authService';
import './AdminLayout.css';

const navItems = [
  { to: '/admin', label: 'Panel', icon: '◈', end: true },
  { to: '/admin/categories', label: 'Kategoriler', icon: '⊞' },
  { to: '/admin/items', label: 'Ürünler', icon: '◉' },
  { to: '/admin/tables', label: 'Masalar & QR', icon: '⊡' },
  { to: '/admin/orders', label: 'Siparişler', icon: '◎' },
  { to: '/admin/users', label: 'Kullanıcılar', icon: '⊗' },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const username = getUsername() || 'Admin';

  const handleLogout = () => {
    clearAuth();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="admin-layout">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="logo-icon">◈</span>
            <div>
              <div className="logo-title">QR Menü</div>
              <div className="logo-sub">Yönetim Paneli</div>
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

      {/* Main */}
      <div className="admin-main">
        <header className="admin-topbar">
          <button className="menu-toggle" onClick={() => setSidebarOpen(true)}>☰</button>
          <div className="topbar-title">Yönetim Paneli</div>
          <div className="topbar-actions">
            <a href="/menu/1" target="_blank" className="btn btn-ghost btn-sm">
              👁 Menüyü Görüntüle
            </a>
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
