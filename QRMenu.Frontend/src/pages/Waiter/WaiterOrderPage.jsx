import { useState, useEffect } from 'react';
import { getTables, getCategories, getMenuItems, createOrder } from '../../services/api';
import './WaiterOrderPage.css';

export default function WaiterOrderPage() {
  const [tables, setTables] = useState([]);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [orderModal, setOrderModal] = useState(null); // seçili masa
  const [activeCategory, setActiveCategory] = useState(null);
  const [cart, setCart] = useState({});
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    Promise.all([getTables(), getCategories(), getMenuItems()])
      .then(([t, c, m]) => {
        setTables(t.filter(x => x.isActive));
        setCategories(c.filter(x => x.isActive));
        setItems(m.filter(x => x.isActive && x.isAvailable));
      })
      .finally(() => setLoading(false));
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openModal = (table) => {
    setOrderModal(table);
    setCart({});
    setNotes('');
    setActiveCategory(null);
  };

  const closeModal = () => {
    setOrderModal(null);
    setCart({});
    setNotes('');
    setActiveCategory(null);
  };

  const setQty = (itemId, delta) => {
    setCart(prev => {
      const current = prev[itemId]?.qty || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const { [itemId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [itemId]: { qty: next } };
    });
  };

  const cartItems = Object.entries(cart).map(([id, { qty }]) => {
    const item = items.find(i => i.id === parseInt(id));
    return item ? { ...item, qty } : null;
  }).filter(Boolean);

  const cartTotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);

  const filteredItems = activeCategory
    ? items.filter(i => i.categoryId === activeCategory)
    : items;

  const handleSubmit = async () => {
    if (cartItems.length === 0) { showToast('Sepet boş.', 'error'); return; }
    setSubmitting(true);
    try {
      await createOrder({
        tableId: orderModal.id,
        customerName: 'Garson',
        notes: notes || null,
        items: cartItems.map(i => ({ menuItemId: i.id, quantity: i.qty, notes: null }))
      });
      showToast(`Masa ${orderModal.tableNumber} siparişi alındı!`);
      closeModal();
    } catch {
      showToast('Sipariş gönderilemedi.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="loading-screen" style={{ minHeight: '60vh' }}>
      <div className="spinner" /><p>Yükleniyor...</p>
    </div>
  );

  return (
    <div className="waiter-page">
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      <div className="page-header">
        <div>
          <h1 className="page-title">Sipariş Al</h1>
          <p className="page-subtitle">Sipariş almak için masa seçin</p>
        </div>
      </div>

      {/* Masa kartları */}
      <div className="waiter-tables-grid">
        {tables.map(t => (
          <button key={t.id} className="waiter-table-card" onClick={() => openModal(t)}>
            <span className="wtc-icon">⊡</span>
            <span className="wtc-number">Masa {t.tableNumber}</span>
            {t.description && <span className="wtc-desc">{t.description}</span>}
          </button>
        ))}
        {tables.length === 0 && (
          <p style={{ color: 'var(--sage)', gridColumn: '1/-1' }}>Aktif masa bulunamadı.</p>
        )}
      </div>

      {/* Sipariş modal */}
      {orderModal && (
        <div className="order-modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="order-modal">

            {/* Modal başlık */}
            <div className="order-modal-header">
              <div>
                <h2 className="order-modal-title">Masa {orderModal.tableNumber}</h2>
                {orderModal.description && (
                  <p className="order-modal-sub">{orderModal.description}</p>
                )}
              </div>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>

            {/* Kategori sekmeleri */}
            <div className="order-cat-tabs">
              <button
                className={`cat-tab ${!activeCategory ? 'active' : ''}`}
                onClick={() => setActiveCategory(null)}
              >
                Tümü
              </button>
              {categories.map(c => (
                <button
                  key={c.id}
                  className={`cat-tab ${activeCategory === c.id ? 'active' : ''}`}
                  onClick={() => setActiveCategory(c.id)}
                >
                  {c.name}
                </button>
              ))}
            </div>

            {/* Ürün listesi */}
            <div className="order-items-list">
              {filteredItems.map(item => {
                const qty = cart[item.id]?.qty || 0;
                return (
                  <div key={item.id} className={`order-item ${qty > 0 ? 'in-cart' : ''}`}>
                    <div className="order-item-info">
                      <span className="order-item-name">{item.name}</span>
                      {item.description && (
                        <span className="order-item-desc">{item.description}</span>
                      )}
                      <span className="order-item-price">₺{item.price.toFixed(2)}</span>
                    </div>
                    <div className="order-item-qty">
                      <button className="qty-btn" onClick={() => setQty(item.id, -1)} disabled={qty === 0}>−</button>
                      <span className="qty-val">{qty}</span>
                      <button className="qty-btn plus" onClick={() => setQty(item.id, 1)}>+</button>
                    </div>
                  </div>
                );
              })}
              {filteredItems.length === 0 && (
                <p style={{ padding: '24px', textAlign: 'center', color: 'var(--sage)' }}>
                  Bu kategoride ürün yok.
                </p>
              )}
            </div>

            {/* Not */}
            {cartCount > 0 && (
              <div className="order-notes">
                <textarea
                  className="input"
                  rows={2}
                  placeholder="Sipariş notu (isteğe bağlı)..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  style={{ resize: 'none' }}
                />
              </div>
            )}

            {/* Modal footer */}
            <div className="order-modal-footer">
              {cartCount > 0 ? (
                <>
                  <div className="order-footer-summary">
                    <span className="order-footer-count">{cartCount} ürün</span>
                    <span className="order-footer-total">₺{cartTotal.toFixed(2)}</span>
                  </div>
                  <button
                    className="btn btn-primary btn-lg order-submit-btn"
                    onClick={handleSubmit}
                    disabled={submitting}
                  >
                    {submitting ? 'Gönderiliyor...' : 'Siparişi Gönder →'}
                  </button>
                </>
              ) : (
                <p className="order-footer-empty">Sepete ürün ekleyin</p>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
