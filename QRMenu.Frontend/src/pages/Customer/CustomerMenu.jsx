import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMenu, createOrder } from '../../services/api';
import { useCart } from '../../context/CartContext';
import './CustomerMenu.css';

export default function CustomerMenu() {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const { items, total, count, dispatch } = useCart();

  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [orderModal, setOrderModal] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [placing, setPlacing] = useState(false);
  const [search, setSearch] = useState('');
  const categoryRefs = useRef({});

  useEffect(() => {
    getMenu(tableId)
      .then(data => { setMenu(data); setActiveCategory(data.categories[0]?.id); })
      .catch(() => setError('Menü yüklenemedi. QR kodu tekrar okutun.'))
      .finally(() => setLoading(false));
  }, [tableId]);

  const addToCart = (item) => {
    dispatch({ type: 'ADD_ITEM', item: { menuItemId: item.id, name: item.name, price: item.price } });
  };

  const getQty = (id) => items.find(i => i.menuItemId === id)?.quantity || 0;

  const scrollToCategory = (catId) => {
    setActiveCategory(catId);
    categoryRefs.current[catId]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const filteredCategories = menu?.categories.map(cat => ({
    ...cat,
    items: search
      ? cat.items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.description?.toLowerCase().includes(search.toLowerCase()))
      : cat.items
  })).filter(cat => cat.items.length > 0);

  const handlePlaceOrder = async () => {
    if (!customerName.trim()) return;
    setPlacing(true);
    try {
      const order = await createOrder({
        tableId: parseInt(tableId),
        customerName,
        notes: orderNote,
        items: items.map(i => ({ menuItemId: i.menuItemId, quantity: i.quantity, notes: '' }))
      });
      dispatch({ type: 'CLEAR' });
      navigate('/order-success', { state: { orderId: order.id, tableNumber: menu.table.tableNumber } });
    } catch {
      alert('Sipariş gönderilemedi, lütfen tekrar deneyin.');
    } finally {
      setPlacing(false);
    }
  };

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner" />
      <p>Menü yükleniyor...</p>
    </div>
  );

  if (error) return (
    <div className="loading-screen">
      <div style={{ fontSize: 48 }}>⚠️</div>
      <p style={{ color: 'var(--danger)' }}>{error}</p>
    </div>
  );

  return (
    <div className="customer-app">
      {/* Header */}
      <header className="customer-header">
        <div className="customer-header-inner">
          <div className="header-left">
            <div className="header-logo">◈</div>
            <div>
              <div className="header-title">Menü</div>
              <div className="header-table">Masa {menu.table.tableNumber}</div>
            </div>
          </div>
          <button className="cart-btn" onClick={() => setCartOpen(true)}>
            <span className="cart-icon">🛒</span>
            <span>Sepet</span>
            {count > 0 && <span className="cart-badge">{count}</span>}
          </button>
        </div>

        {/* Search */}
        <div className="header-search">
          <input
            className="search-input"
            type="text"
            placeholder="🔍 Ürün ara..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Category Pills */}
        {!search && (
          <div className="category-pills">
            {menu.categories.map(cat => (
              <button
                key={cat.id}
                className={`pill ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => scrollToCategory(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Menu Content */}
      <main className="customer-main">
        {filteredCategories?.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--sage)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <p>"{search}" için sonuç bulunamadı.</p>
          </div>
        )}

        {filteredCategories?.map(cat => (
          <section
            key={cat.id}
            className="menu-category"
            ref={el => categoryRefs.current[cat.id] = el}
          >
            <div className="category-header">
              <h2 className="category-title">{cat.name}</h2>
              {cat.description && <p className="category-desc">{cat.description}</p>}
            </div>

            <div className="menu-items">
              {cat.items.map(item => {
                const qty = getQty(item.id);
                return (
                  <div key={item.id} className="menu-item-card">
                    {item.imagePath && (
                      <div className="menu-item-img-wrap">
                        <img src={item.imagePath} alt={item.name} className="menu-item-img" />
                      </div>
                    )}
                    <div className="menu-item-body">
                      <div className="menu-item-name">{item.name}</div>
                      {item.description && <div className="menu-item-desc">{item.description}</div>}
                      <div className="menu-item-footer">
                        <div className="menu-item-price">₺{parseFloat(item.price).toFixed(2)}</div>
                        {qty === 0 ? (
                          <button className="add-btn" onClick={() => addToCart(item)}>
                            + Ekle
                          </button>
                        ) : (
                          <div className="qty-controls">
                            <button onClick={() => dispatch({ type: 'UPDATE_QTY', menuItemId: item.id, qty: qty - 1 })}>−</button>
                            <span>{qty}</span>
                            <button onClick={() => dispatch({ type: 'UPDATE_QTY', menuItemId: item.id, qty: qty + 1 })}>+</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </main>

      {/* Floating Cart Button */}
      {count > 0 && !cartOpen && (
        <div className="floating-cart" onClick={() => setCartOpen(true)}>
          <span>🛒 {count} ürün</span>
          <span>₺{total.toFixed(2)}</span>
          <span className="floating-cart-arrow">→</span>
        </div>
      )}

      {/* Cart Drawer */}
      {cartOpen && (
        <div className="cart-overlay" onClick={e => e.target === e.currentTarget && setCartOpen(false)}>
          <div className="cart-drawer">
            <div className="cart-header">
              <h2 className="cart-title">Sepetim</h2>
              <button className="modal-close" onClick={() => setCartOpen(false)}>✕</button>
            </div>

            {items.length === 0 ? (
              <div className="cart-empty">
                <div style={{ fontSize: 48 }}>🛒</div>
                <p>Sepetiniz boş</p>
                <button className="btn btn-primary btn-sm" onClick={() => setCartOpen(false)}>Menüye Dön</button>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {items.map(item => (
                    <div key={item.menuItemId} className="cart-item">
                      <div className="cart-item-name">{item.name}</div>
                      <div className="cart-item-controls">
                        <div className="qty-controls">
                          <button onClick={() => dispatch({ type: 'UPDATE_QTY', menuItemId: item.menuItemId, qty: item.quantity - 1 })}>−</button>
                          <span>{item.quantity}</span>
                          <button onClick={() => dispatch({ type: 'UPDATE_QTY', menuItemId: item.menuItemId, qty: item.quantity + 1 })}>+</button>
                        </div>
                        <div className="cart-item-price">₺{(item.price * item.quantity).toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cart-total">
                  <span>Toplam</span>
                  <span>₺{total.toFixed(2)}</span>
                </div>

                <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 16 }}
                  onClick={() => { setCartOpen(false); setOrderModal(true); }}>
                  Sipariş Ver
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Order Confirm Modal */}
      {orderModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Siparişi Onayla</h2>
              <button className="modal-close" onClick={() => setOrderModal(false)}>✕</button>
            </div>

            <div className="order-summary">
              {items.map(i => (
                <div key={i.menuItemId} className="order-summary-row">
                  <span>{i.quantity}x {i.name}</span>
                  <span>₺{(i.price * i.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="order-summary-total">
                <span>Toplam</span>
                <span>₺{total.toFixed(2)}</span>
              </div>
            </div>

            <div className="form-group">
              <label className="label">İsminiz *</label>
              <input className="input" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Ör: Ahmet" />
            </div>
            <div className="form-group">
              <label className="label">Sipariş Notu</label>
              <textarea className="input" rows={2} value={orderNote} onChange={e => setOrderNote(e.target.value)} placeholder="Ör: Az pişmiş olsun" style={{ resize: 'vertical' }} />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setOrderModal(false)}>Geri</button>
              <button className="btn btn-primary" style={{ flex: 2 }} onClick={handlePlaceOrder} disabled={placing || !customerName.trim()}>
                {placing ? 'Gönderiliyor...' : '✓ Siparişi Gönder'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
