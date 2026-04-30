import { useState, useEffect, useRef } from 'react';
import { getMenuItems, getCategories, createMenuItem, updateMenuItem, deleteMenuItem } from '../../services/api';
import './AdminMenuItems.css';

export default function AdminMenuItems() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filterCat, setFilterCat] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', sortOrder: 1, categoryId: '', isActive: true, isAvailable: true });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const fileRef = useRef();

  const load = () => {
    Promise.all([getMenuItems(filterCat || undefined), getCategories()])
      .then(([its, cats]) => { setItems(its); setCategories(cats); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filterCat]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openCreate = () => {
    setForm({ name: '', description: '', price: '', sortOrder: items.length + 1, categoryId: categories[0]?.id || '', isActive: true, isAvailable: true });
    setImageFile(null); setImagePreview(null);
    setModal('create');
  };

  const openEdit = (item) => {
    setForm({ name: item.name, description: item.description || '', price: item.price, sortOrder: item.sortOrder, categoryId: item.categoryId, isActive: item.isActive, isAvailable: item.isAvailable });
    setImageFile(null); setImagePreview(item.imagePath ? item.imagePath : null);
    setModal(item);
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = ev => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.price || !form.categoryId) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('description', form.description);
      fd.append('price', parseFloat(form.price));
      fd.append('sortOrder', parseInt(form.sortOrder));
      fd.append('categoryId', parseInt(form.categoryId));
      if (modal !== 'create') {
        fd.append('isActive', form.isActive);
        fd.append('isAvailable', form.isAvailable);
      }
      if (imageFile) fd.append('image', imageFile);

      if (modal === 'create') {
        await createMenuItem(fd);
        showToast('Ürün oluşturuldu.');
      } else {
        await updateMenuItem(modal.id, fd);
        showToast('Ürün güncellendi.');
      }
      setModal(null);
      load();
    } catch { showToast('Bir hata oluştu.', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bu ürünü silmek istiyor musunuz?')) return;
    await deleteMenuItem(id);
    showToast('Ürün silindi.');
    load();
  };

  if (loading) return <div className="loading-screen" style={{ minHeight: '60vh' }}><div className="spinner" /></div>;

  return (
    <div>
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      <div className="page-header">
        <div>
          <h1 className="page-title">Ürünler</h1>
          <p className="page-subtitle">{items.length} ürün</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <select className="input" style={{ width: 180 }} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
            <option value="">Tüm Kategoriler</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button className="btn btn-primary" onClick={openCreate}>+ Yeni Ürün</button>
        </div>
      </div>

      <div className="items-grid">
        {items.map(item => (
          <div key={item.id} className={`item-card card ${!item.isActive ? 'inactive' : ''}`}>
            <div className="item-img-wrap">
              {item.imagePath
                ? <img src={item.imagePath} alt={item.name} className="item-img" />
                : <div className="item-img-placeholder">◉</div>
              }
              {!item.isAvailable && <span className="item-unavailable-badge">Tükendi</span>}
            </div>
            <div className="item-body">
              <div className="item-cat">{item.categoryName}</div>
              <div className="item-name">{item.name}</div>
              {item.description && <div className="item-desc">{item.description}</div>}
              <div className="item-footer">
                <div className="item-price">₺{parseFloat(item.price).toFixed(2)}</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => openEdit(item)}>Düzenle</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)}>Sil</button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: 'var(--sage)' }}>
            Ürün bulunamadı.
          </div>
        )}
      </div>

      {modal !== null && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">{modal === 'create' ? 'Yeni Ürün' : 'Ürünü Düzenle'}</h2>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>

            {/* Image upload */}
            <div className="form-group">
              <label className="label">Ürün Görseli</label>
              <div className="img-upload-area" onClick={() => fileRef.current.click()}>
                {imagePreview
                  ? <img src={imagePreview} alt="preview" className="img-preview" />
                  : <div className="img-placeholder"><span>📷</span><span>Görsel yükle</span></div>
                }
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImage} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="label">Ürün Adı *</label>
                <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ör: Izgara Köfte" />
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="label">Açıklama</label>
                <textarea className="input" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Kısa açıklama" style={{ resize: 'vertical' }} />
              </div>
              <div className="form-group">
                <label className="label">Fiyat (₺) *</label>
                <input className="input" type="number" min="0" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0.00" />
              </div>
              <div className="form-group">
                <label className="label">Sıra</label>
                <input className="input" type="number" min="1" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value }))} />
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="label">Kategori *</label>
                <select className="input" value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}>
                  <option value="">Seçiniz...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              {modal !== 'create' && (
                <>
                  <div className="form-group">
                    <label className="label">Durum</label>
                    <select className="input" value={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.value === 'true' }))}>
                      <option value="true">Aktif</option>
                      <option value="false">Pasif</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="label">Stok</label>
                    <select className="input" value={form.isAvailable} onChange={e => setForm(f => ({ ...f, isAvailable: e.target.value === 'true' }))}>
                      <option value="true">Mevcut</option>
                      <option value="false">Tükendi</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
              <button className="btn btn-ghost" onClick={() => setModal(null)}>İptal</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
