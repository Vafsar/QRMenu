import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAdmin } from '../../services/api';
import { setAuth } from '../../services/authService';
import './AdminLogin.css';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      setError('Kullanıcı adı ve şifre zorunludur.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await loginAdmin(form);
      setAuth(data.token, data.username);
      navigate('/admin', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Giriş başarısız. Bilgilerinizi kontrol edin.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Sol panel — dekoratif */}
      <div className="login-brand">
        <div className="brand-content">
          <div className="brand-logo">◈</div>
          <h1 className="brand-title">QR Menü</h1>
          <p className="brand-tagline">Restoran Yönetim Sistemi</p>
          <div className="brand-features">
            <div className="brand-feature">
              <span className="feature-icon">⊞</span>
              <span>Kategori & Ürün Yönetimi</span>
            </div>
            <div className="brand-feature">
              <span className="feature-icon">⊡</span>
              <span>Masa & QR Kod Sistemi</span>
            </div>
            <div className="brand-feature">
              <span className="feature-icon">◎</span>
              <span>Anlık Sipariş Takibi</span>
            </div>
          </div>
        </div>
        <div className="brand-decoration">
          <div className="deco-circle deco-1" />
          <div className="deco-circle deco-2" />
          <div className="deco-circle deco-3" />
        </div>
      </div>

      {/* Sağ panel — form */}
      <div className="login-panel">
        <div className="login-card">
          <div className="login-header">
            <div className="login-icon">◈</div>
            <h2 className="login-title">Yönetici Girişi</h2>
            <p className="login-subtitle">Devam etmek için oturum açın</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            {error && (
              <div className="login-error">
                <span className="error-icon">⚠</span>
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="label" htmlFor="username">Kullanıcı Adı</label>
              <div className="input-wrap">
                <span className="input-icon">◉</span>
                <input
                  id="username"
                  className="input login-input"
                  type="text"
                  placeholder="admin"
                  autoComplete="username"
                  autoFocus
                  value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="label" htmlFor="password">Şifre</label>
              <div className="input-wrap">
                <span className="input-icon">⊠</span>
                <input
                  id="password"
                  className="input login-input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(s => !s)}
                  tabIndex={-1}
                >
                  {showPassword ? '◑' : '◐'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={`btn btn-primary btn-lg login-btn ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="btn-spinner" />
                  Giriş yapılıyor...
                </>
              ) : (
                'Giriş Yap'
              )}
            </button>
          </form>

          <div className="login-footer">
            <span>QR Menü Yönetim Paneli</span>
            <span className="footer-dot">·</span>
            <span>v1.0.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
