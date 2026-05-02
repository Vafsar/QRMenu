import { useState, useEffect } from 'react';
import { getTables, createTable, updateTable, deleteTable, regenerateQR } from '../../services/api';
import './AdminTables.css';

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function AdminTables() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ tableNumber: '', description: '', isActive: true });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [qrModal, setQrModal] = useState(null);

  const load = () => getTables().then(setTables).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openCreate = () => {
    setForm({ tableNumber: '', description: '', isActive: true });
    setModal('create');
  };

  const openEdit = (t) => {
    setForm({ tableNumber: t.tableNumber, description: t.description || '', isActive: t.isActive });
    setModal(t);
  };

  const handleSave = async () => {
    if (!form.tableNumber.trim()) return;
    setSaving(true);
    try {
      if (modal === 'create') {
        await createTable({ tableNumber: form.tableNumber, description: form.description });
        showToast('Masa oluşturuldu. QR kod üretildi!');
      } else {
        await updateTable(modal.id, { tableNumber: form.tableNumber, description: form.description, isActive: form.isActive });
        showToast('Masa güncellendi.');
      }
      setModal(null);
      load();
    } catch { showToast('Bir hata oluştu.', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bu masayı silmek istiyor musunuz?')) return;
    await deleteTable(id);
    showToast('Masa silindi.');
    load();
  };

  const handleRegenerateQR = async (id) => {
    await regenerateQR(id);
    showToast('QR kod yenilendi.');
    load();
  };

  const handlePrint = (table) => {
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>Masa ${table.tableNumber} - QR Kod</title>
      <style>
        body { font-family: 'DM Sans', sans-serif; text-align: center; padding: 40px; background: #FAF7F2; }
        h1 { font-family: Georgia, serif; font-size: 32px; margin-bottom: 8px; }
        p { color: #6B7280; margin-bottom: 24px; }
        img { width: 280px; height: 280px; border: 8px solid #1C1917; border-radius: 16px; }
        .url { margin-top: 16px; font-size: 12px; color: #9CA3AF; word-break: break-all; }
      </style></head>
      <body>
        <h1>Masa ${table.tableNumber}</h1>
        ${table.description ? `<p>${table.description}</p>` : ''}
        <p>QR kodu okutarak menüye ulaşın</p>
        <img src="${API_BASE}${table.qrCodePath}" />
        <div class="url">${window.location.origin}/menu/${table.id}</div>
      </body></html>
    `);
    win.document.close();
    win.print();
  };

  if (loading) return <div className="loading-screen" style={{ minHeight: '60vh' }}><div className="spinner" /></div>;

  return (
    <div>
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      <div className="page-header">
        <div>
          <h1 className="page-title">Masalar & QR Kodlar</h1>
          <p className="page-subtitle">{tables.length} masa</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Yeni Masa</button>
      </div>

      <div className="tables-grid">
        {tables.map(t => (
          <div key={t.id} className={`table-card card ${!t.isActive ? 'inactive' : ''}`}>
            <div className="table-card-header">
              <div>
                <div className="table-number">Masa {t.tableNumber}</div>
                {t.description && <div className="table-desc">{t.description}</div>}
              </div>
              <span className={`badge ${t.isActive ? 'badge-ready' : 'badge-cancelled'}`}>
                {t.isActive ? 'Aktif' : 'Pasif'}
              </span>
            </div>

            <div className="qr-wrap" onClick={() => t.qrCodePath && setQrModal(t)}>
              {t.qrCodePath
                ? <img src={`${API_BASE}${t.qrCodePath}`} alt={`Masa ${t.tableNumber} QR`} className="qr-img" />
                : <div className="qr-placeholder">QR Yok — "QR Yenile" tıklayın</div>
              }
              {t.qrCodePath && <div className="qr-overlay">Büyüt</div>}
            </div>

            <div className="table-link">
              <a href={`/menu/${t.id}`} target="_blank" rel="noreferrer">
                /menu/{t.id} ↗
              </a>
            </div>

            <div className="table-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => openEdit(t)}>Düzenle</button>
              <button className="btn btn-ghost btn-sm" onClick={() => handleRegenerateQR(t.id)}>QR Yenile</button>
              <button className="btn btn-ghost btn-sm" onClick={() => handlePrint(t)}>Yazdır</button>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(t.id)}>Sil</button>
            </div>
          </div>
        ))}
        {tables.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: 'var(--sage)' }}>
            Masa bulunamadı.
          </div>
        )}
      </div>

      {/* QR Zoom Modal */}
      {qrModal && (
        <div className="modal-overlay" onClick={() => setQrModal(null)}>
          <div className="modal" style={{ maxWidth: 360, textAlign: 'center' }}>
            <div className="modal-header">
              <h2 className="modal-title">Masa {qrModal.tableNumber}</h2>
              <button className="modal-close" onClick={() => setQrModal(null)}>✕</button>
            </div>
            <img src={`${API_BASE}${qrModal.qrCodePath}`} alt="QR" style={{ width: '100%', borderRadius: 12 }} />
            <p style={{ fontSize: 13, color: 'var(--sage)', marginTop: 12 }}>
              {window.location.origin}/menu/{qrModal.id}
            </p>
            <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 16 }} onClick={() => handlePrint(qrModal)}>
              🖨 Yazdır
            </button>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {modal !== null && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">{modal === 'create' ? 'Yeni Masa' : 'Masayı Düzenle'}</h2>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="form-group">
              <label className="label">Masa Numarası *</label>
              <input className="input" value={form.tableNumber} onChange={e => setForm(f => ({ ...f, tableNumber: e.target.value }))} placeholder="Ör: 1, A1, Bahçe-3" />
            </div>
            <div className="form-group">
              <label className="label">Açıklama</label>
              <input className="input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Ör: Pencere kenarı" />
            </div>
            {modal !== 'create' && (
              <div className="form-group">
                <label className="label">Durum</label>
                <select className="input" value={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.value === 'true' }))}>
                  <option value="true">Aktif</option>
                  <option value="false">Pasif</option>
                </select>
              </div>
            )}
            {modal === 'create' && (
              <p style={{ fontSize: 13, color: 'var(--sage)', marginBottom: 16 }}>
                💡 Masa oluşturulduğunda QR kod otomatik olarak üretilir.
              </p>
            )}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
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
