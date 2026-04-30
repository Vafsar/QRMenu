import { useState, useEffect } from 'react';
import { getOrders, updateOrderStatus, deleteOrder } from '../../services/api';
import './AdminOrders.css';

const STATUS_LABELS = ['Bekliyor', 'Onaylandı', 'Hazırlanıyor', 'Hazır', 'Teslim Edildi', 'İptal'];
const STATUS_COLORS = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
const STATUS_NEXT = { 0: 1, 1: 2, 2: 3, 3: 4 };
const STATUS_NEXT_LABEL = { 0: 'Onayla', 1: 'Hazırlamaya Başla', 2: 'Hazır', 3: 'Teslim Et' };

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [detail, setDetail] = useState(null);
  const [toast, setToast] = useState(null);

  const load = () => {
    const params = filter !== '' ? { status: parseInt(filter) } : {};
    getOrders(params).then(setOrders).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [filter]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleNext = async (order) => {
    const nextStatus = STATUS_NEXT[order.status];
    if (nextStatus === undefined) return;
    await updateOrderStatus(order.id, nextStatus);
    showToast(`Sipariş durumu: ${STATUS_LABELS[nextStatus]}`);
    load();
    if (detail?.id === order.id) setDetail(prev => ({ ...prev, status: nextStatus }));
  };

  const handleCancel = async (id) => {
    if (!confirm('Bu siparişi iptal etmek istiyor musunuz?')) return;
    await updateOrderStatus(id, 5);
    showToast('Sipariş iptal edildi.');
    load();
    if (detail?.id === id) setDetail(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('Bu siparişi silmek istiyor musunuz?')) return;
    await deleteOrder(id);
    showToast('Sipariş silindi.');
    load();
    if (detail?.id === id) setDetail(null);
  };

  if (loading) return <div className="loading-screen" style={{ minHeight: '60vh' }}><div className="spinner" /></div>;

  return (
    <div>
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      <div className="page-header">
        <div>
          <h1 className="page-title">Siparişler</h1>
          <p className="page-subtitle">{orders.length} sipariş • 30sn'de bir yenilenir</p>
        </div>
        <select className="input" style={{ width: 180 }} value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">Tüm Siparişler</option>
          {STATUS_LABELS.map((l, i) => <option key={i} value={i}>{l}</option>)}
        </select>
      </div>

      <div className="orders-layout">
        <div className="orders-list card table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Masa</th>
                <th>Müşteri</th>
                <th>Tutar</th>
                <th>Tarih</th>
                <th>Durum</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className={detail?.id === o.id ? 'selected-row' : ''} style={{ cursor: 'pointer' }}>
                  <td onClick={() => setDetail(o)} style={{ fontWeight: 700 }}>#{o.id}</td>
                  <td onClick={() => setDetail(o)}>Masa {o.tableNumber}</td>
                  <td onClick={() => setDetail(o)}>{o.customerName}</td>
                  <td onClick={() => setDetail(o)} style={{ fontWeight: 600 }}>₺{o.totalAmount.toFixed(2)}</td>
                  <td onClick={() => setDetail(o)} style={{ color: 'var(--sage)', fontSize: 12 }}>
                    {new Date(o.createdAt).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td onClick={() => setDetail(o)}>
                    <span className={`badge badge-${STATUS_COLORS[o.status]}`}>{STATUS_LABELS[o.status]}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {STATUS_NEXT[o.status] !== undefined && (
                        <button className="btn btn-success btn-sm" onClick={() => handleNext(o)}>
                          {STATUS_NEXT_LABEL[o.status]}
                        </button>
                      )}
                      {o.status !== 5 && o.status !== 4 && (
                        <button className="btn btn-ghost btn-sm" onClick={() => handleCancel(o.id)}>İptal</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--sage)', padding: '40px' }}>Sipariş bulunamadı.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {detail && (
          <div className="order-detail card">
            <div className="order-detail-header">
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>Sipariş #{detail.id}</div>
                <div style={{ fontSize: 13, color: 'var(--sage)' }}>Masa {detail.tableNumber} • {detail.customerName}</div>
              </div>
              <button className="modal-close" onClick={() => setDetail(null)}>✕</button>
            </div>

            <div className="order-detail-status">
              <span className={`badge badge-${STATUS_COLORS[detail.status]}`}>{STATUS_LABELS[detail.status]}</span>
              <span style={{ fontSize: 12, color: 'var(--sage)' }}>
                {new Date(detail.createdAt).toLocaleString('tr-TR')}
              </span>
            </div>

            {detail.notes && (
              <div className="order-notes">
                <strong>Not:</strong> {detail.notes}
              </div>
            )}

            <div className="order-items-list">
              {detail.items.map(item => (
                <div key={item.id} className="order-item-row">
                  <div className="order-item-qty">{item.quantity}x</div>
                  <div className="order-item-name">
                    {item.menuItemName}
                    {item.notes && <div style={{ fontSize: 12, color: 'var(--sage)' }}>{item.notes}</div>}
                  </div>
                  <div className="order-item-price">₺{(item.unitPrice * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>

            <div className="order-total">
              <span>Toplam</span>
              <span>₺{detail.totalAmount.toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              {STATUS_NEXT[detail.status] !== undefined && (
                <button className="btn btn-success btn-sm" style={{ flex: 1 }} onClick={() => handleNext(detail)}>
                  {STATUS_NEXT_LABEL[detail.status]}
                </button>
              )}
              {detail.status !== 5 && detail.status !== 4 && (
                <button className="btn btn-ghost btn-sm" onClick={() => handleCancel(detail.id)}>İptal</button>
              )}
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(detail.id)}>Sil</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
