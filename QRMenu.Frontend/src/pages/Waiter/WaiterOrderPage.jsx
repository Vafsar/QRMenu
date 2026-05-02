import { useState, useEffect } from 'react';
import { getTables, getCategories, getMenuItems, createOrder } from '../../services/api';
import './WaiterOrderPage.css';

export default function WaiterOrderPage() {
  const [tables, setTables] = useState([]);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedTable, setSelectedTable] = useState(null);
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
    if (!selectedTable) { showToast('Lütfen bir masa seçin.', 'error'); return; }
    if (cartItems.length === 0) { showToast('Sepet boş.', 'error'); return; }

    setSubmitting(true);
    try {
      await createOrder({
        tableId: selectedTable.id,
        customerName: 'Garson',
        notes: notes || null,
        items: cartItems.map(i => ({ menuItemId: i.id, quantity: i.qty, notes: null }))
      });
      setCart({});
      setNotes('');
      showToast(`Masa ${selectedTable.tableNumber} siparişi alındı!`);
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
          <p className="page-subtitle">Masa seçin, ürün ekleyin, siparişi gönderin</p>
        </div>
      </div>

      {/* Masa seçimi */}
      <div className="waiter-section">
        <div className="waiter-section-label">Masa Seçin</div>
        <div className="table-chips">
          {tables.map(t => (
            <button
              key={t.id}
              className={`table-chip ${selectedTable?.id === t.id ? 'selected' : ''}`}
              onClick={() => setSelectedTable(t)}
            >
              Masa {t.tableNumber}
              {t.description && <span className="chip-sub">{t.description}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Kategori filtresi */}
      <div className="waiter-section">
        <div className="category-tabs">
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
      </div>

      {/* Ürün listesi */}
      <div className="waiter-items">
        {filteredItems.map(item => {
          const qty = cart[item.id]?.qty || 0;
          return (
            <div key={item.id} className={`waiter-item ${qty > 0 ? 'in-cart' : ''}`}>
              <div className="waiter-item-info">
                <div className="waiter-item-name">{item.name}</div>
                {item.description && (
                  <div className="waiter-item-desc">{item.description}</div>
                )}
                <div className="waiter-item-price">₺{item.price.toFixed(2)}</div>
              </div>
              <div className="waiter-item-qty">
                <button className="qty-btn" onClick={() => setQty(item.id, -1)} disabled={qty === 0}>−</button>
                <span className="qty-val">{qty}</span>
                <button className="qty-btn plus" onClick={() => setQty(item.id, 1)}>+</button>
              </div>
            </div>
          );
        })}
        {filteredItems.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--sage)' }}>
            Bu kategoride ürün bulunmuyor.
          </div>
        )}
      </div>

      {/* Notlar */}
      {cartCount > 0 && (
        <div className="waiter-section" style={{ marginBottom: 100 }}>
          <div className="waiter-section-label">Sipariş Notu (İsteğe Bağlı)</div>
          <textarea
            className="input"
            rows={2}
            placeholder="Özel istek veya not..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            style={{ resize: 'none' }}
          />
        </div>
      )}

      {/* Sabit alt bar */}
      {cartCount > 0 && (
        <div className="waiter-cart-bar">
          <div className="cart-bar-info">
            <span className="cart-badge">{cartCount}</span>
            <span className="cart-bar-label">ürün</span>
            {selectedTable && (
              <span className="cart-bar-table">· Masa {selectedTable.tableNumber}</span>
            )}
          </div>
          <div className="cart-bar-total">₺{cartTotal.toFixed(2)}</div>
          <button
            className="btn btn-primary cart-bar-btn"
            onClick={handleSubmit}
            disabled={submitting || !selectedTable}
          >
            {submitting ? 'Gönderiliyor...' : 'Siparişi Gönder →'}
          </button>
        </div>
      )}
    </div>
  );
}
