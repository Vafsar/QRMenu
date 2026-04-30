import { useState, useEffect } from 'react';
import { getOrders, getTables, getMenuItems, getCategories } from '../../services/api';
import './AdminDashboard.css';

const STATUS_LABELS = ['Bekliyor', 'Onaylandı', 'Hazırlanıyor', 'Hazır', 'Teslim Edildi', 'İptal'];
const STATUS_COLORS = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];

export default function AdminDashboard() {
  const [stats, setStats] = useState({ orders: 0, tables: 0, items: 0, categories: 0, revenue: 0, pending: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getOrders(), getTables(), getMenuItems(), getCategories()])
      .then(([orders, tables, items, cats]) => {
        const revenue = orders.filter(o => o.status !== 5).reduce((s, o) => s + o.totalAmount, 0);
        const pending = orders.filter(o => o.status === 0).length;
        setStats({ orders: orders.length, tables: tables.length, items: items.length, categories: cats.length, revenue, pending });
        setRecentOrders(orders.slice(0, 8));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="loading-screen" style={{ minHeight: '60vh' }}>
      <div className="spinner" />
      <p>Yükleniyor...</p>
    </div>
  );

  const statCards = [
    { label: 'Toplam Sipariş', value: stats.orders, icon: '◎', color: 'amber' },
    { label: 'Bekleyen Sipariş', value: stats.pending, icon: '⏳', color: 'warning' },
    { label: 'Aktif Masa', value: stats.tables, icon: '⊡', color: 'blue' },
    { label: 'Toplam Gelir', value: `₺${stats.revenue.toFixed(2)}`, icon: '◈', color: 'green' },
  ];

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h1 className="page-title">Genel Bakış</h1>
          <p className="page-subtitle">Tüm istatistikler</p>
        </div>
      </div>

      <div className="stats-grid">
        {statCards.map(c => (
          <div key={c.label} className={`stat-card stat-${c.color}`}>
            <div className="stat-icon">{c.icon}</div>
            <div className="stat-value">{c.value}</div>
            <div className="stat-label">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="card recent-orders">
          <div className="card-header">
            <h3>Son Siparişler</h3>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Masa</th>
                  <th>Müşteri</th>
                  <th>Tutar</th>
                  <th>Durum</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--sage)' }}>Sipariş yok</td></tr>
                )}
                {recentOrders.map(o => (
                  <tr key={o.id}>
                    <td style={{ fontWeight: 600 }}>#{o.id}</td>
                    <td>Masa {o.tableNumber}</td>
                    <td>{o.customerName}</td>
                    <td>₺{o.totalAmount.toFixed(2)}</td>
                    <td>
                      <span className={`badge badge-${STATUS_COLORS[o.status]}`}>
                        {STATUS_LABELS[o.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mini-stats">
          <div className="card mini-stat-card">
            <div className="mini-stat-icon">⊞</div>
            <div className="mini-stat-value">{stats.categories}</div>
            <div className="mini-stat-label">Kategori</div>
          </div>
          <div className="card mini-stat-card">
            <div className="mini-stat-icon">◉</div>
            <div className="mini-stat-value">{stats.items}</div>
            <div className="mini-stat-label">Ürün</div>
          </div>
        </div>
      </div>
    </div>
  );
}
