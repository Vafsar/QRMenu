import { useLocation, useNavigate } from 'react-router-dom';
import './OrderSuccess.css';

export default function OrderSuccess() {
  const { state } = useLocation();
  const navigate = useNavigate();

  return (
    <div className="success-page">
      <div className="success-card">
        <div className="success-icon">✓</div>
        <h1 className="success-title">Siparişiniz Alındı!</h1>
        <p className="success-msg">
          Masa {state?.tableNumber || ''} için siparişiniz mutfağa iletildi.
          Kısa süre içinde hazırlanacaktır.
        </p>
        {state?.orderId && (
          <div className="success-order-id">Sipariş #{state.orderId}</div>
        )}
        <button
          className="btn btn-primary btn-lg"
          onClick={() => navigate(-1)}
          style={{ marginTop: 24 }}
        >
          ← Menüye Dön
        </button>
      </div>
    </div>
  );
}
