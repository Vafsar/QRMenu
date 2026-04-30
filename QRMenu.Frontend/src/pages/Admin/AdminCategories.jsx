import { useState, useEffect } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../services/api';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | category object
  const [form, setForm] = useState({ name: '', description: '', sortOrder: 1 });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const load = () => getCategories().then(setCategories).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openCreate = () => {
    setForm({ name: '', description: '', sortOrder: categories.length + 1 });
    setModal('create');
  };

  const openEdit = (cat) => {
    setForm({ name: cat.name, description: cat.description || '', sortOrder: cat.sortOrder });
    setModal(cat);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (modal === 'create') {
        await createCategory({ name: form.name, description: form.description, sortOrder: parseInt(form.sortOrder) });
        showToast('Kategori oluşturuldu.');
      } else {
        await updateCategory(modal.id, { name: form.name, description: form.description, sortOrder: parseInt(form.sortOrder), isActive: modal.isActive });
        showToast('Kategori güncellendi.');
      }
      setModal(null);
      load();
    } catch { showToast('Bir hata oluştu.', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bu kategoriyi silmek istiyor musunuz?')) return;
    await deleteCategory(id);
    showToast('Kategori silindi.');
    load();
  };

  const toggleActive = async (cat) => {
    await updateCategory(cat.id, { name: cat.name, description: cat.description, sortOrder: cat.sortOrder, isActive: !cat.isActive });
    load();
  };

  if (loading) return <div className="loading-screen" style={{ minHeight: '60vh' }}><div className="spinner" /></div>;

  return (
    <div>
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      <div className="page-header">
        <div>
          <h1 className="page-title">Kategoriler</h1>
          <p className="page-subtitle">{categories.length} kategori</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Yeni Kategori</button>
      </div>

      <div className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Sıra</th>
              <th>Kategori Adı</th>
              <th>Açıklama</th>
              <th>Durum</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(cat => (
              <tr key={cat.id}>
                <td style={{ fontWeight: 600, color: 'var(--sage)' }}>{cat.sortOrder}</td>
                <td style={{ fontWeight: 600 }}>{cat.name}</td>
                <td style={{ color: 'var(--sage)' }}>{cat.description || '—'}</td>
                <td>
                  <button
                    onClick={() => toggleActive(cat)}
                    className={`badge ${cat.isActive ? 'badge-ready' : 'badge-cancelled'}`}
                    style={{ cursor: 'pointer', border: 'none' }}
                  >
                    {cat.isActive ? 'Aktif' : 'Pasif'}
                  </button>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(cat)}>Düzenle</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(cat.id)}>Sil</button>
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--sage)', padding: '40px' }}>Kategori bulunamadı.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modal !== null && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">{modal === 'create' ? 'Yeni Kategori' : 'Kategoriyi Düzenle'}</h2>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="form-group">
              <label className="label">Kategori Adı *</label>
              <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ör: Ana Yemekler" />
            </div>
            <div className="form-group">
              <label className="label">Açıklama</label>
              <input className="input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Kısa açıklama" />
            </div>
            <div className="form-group">
              <label className="label">Sıra</label>
              <input className="input" type="number" min="1" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value }))} />
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
