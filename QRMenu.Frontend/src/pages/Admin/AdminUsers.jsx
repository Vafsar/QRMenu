import { useState, useEffect } from 'react';
import { getUsers, createUser, deleteUser } from '../../services/api';
import { getUsername } from '../../services/authService';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ username: '', password: '', role: 'Waiter' });
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState(null);
  const currentUser = getUsername();

  const load = () => getUsers().then(setUsers).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openModal = () => {
    setForm({ username: '', password: '', role: 'Waiter' });
    setShowPassword(false);
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.username.trim() || !form.password.trim()) return;
    setSaving(true);
    try {
      await createUser(form);
      showToast('Kullanıcı oluşturuldu.');
      setModal(false);
      load();
    } catch (err) {
      const msg = err.response?.data?.message || 'Bir hata oluştu.';
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user) => {
    if (!confirm(`"${user.username}" kullanıcısını silmek istiyor musunuz?`)) return;
    try {
      await deleteUser(user.id);
      showToast('Kullanıcı silindi.');
      load();
    } catch (err) {
      const msg = err.response?.data?.message || 'Silinemedi.';
      showToast(msg, 'error');
    }
  };

  const formatDate = (iso) => new Date(iso).toLocaleDateString('tr-TR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  if (loading) return (
    <div className="loading-screen" style={{ minHeight: '60vh' }}>
      <div className="spinner" />
    </div>
  );

  return (
    <div>
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      <div className="page-header">
        <div>
          <h1 className="page-title">Kullanıcılar</h1>
          <p className="page-subtitle">{users.length} kullanıcı</p>
        </div>
        <button className="btn btn-primary" onClick={openModal}>+ Yeni Kullanıcı</button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Kullanıcı Adı</th>
                <th>Rol</th>
                <th>Oluşturulma</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 16 }}>{u.role === 'Admin' ? '◈' : '◉'}</span>
                      <span style={{ fontWeight: 600 }}>{u.username}</span>
                      {u.username === currentUser && (
                        <span className="badge badge-ready" style={{ fontSize: 11 }}>Siz</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${u.role === 'Admin' ? 'badge-confirmed' : 'badge-pending'}`}>
                      {u.role === 'Admin' ? 'Yönetici' : 'Garson'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--sage)', fontSize: 13 }}>{formatDate(u.createdAt)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(u)}
                      disabled={u.username === currentUser}
                      title={u.username === currentUser ? 'Kendi hesabınızı silemezsiniz' : ''}
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Yeni kullanıcı modal */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Yeni Kullanıcı</h2>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>

            <div className="form-group">
              <label className="label">Kullanıcı Adı *</label>
              <input
                className="input"
                placeholder="kullaniciadi"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="label">Şifre * (en az 6 karakter)</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--sage)', fontSize: 16
                  }}
                  tabIndex={-1}
                >
                  {showPassword ? '◑' : '◐'}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="label">Rol *</label>
              <select
                className="input"
                value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              >
                <option value="Waiter">Garson</option>
                <option value="Admin">Yönetici</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
              <button className="btn btn-ghost" onClick={() => setModal(false)}>İptal</button>
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={saving || !form.username.trim() || !form.password.trim()}
              >
                {saving ? 'Kaydediliyor...' : 'Oluştur'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
