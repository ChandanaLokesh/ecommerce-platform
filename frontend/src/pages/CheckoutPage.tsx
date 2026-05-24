import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import * as orderApi from '../api/orderApi';

export const CheckoutPage = () => {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!cart || cart.items.length === 0) {
    navigate('/cart');
    return null;
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const items = cart.items.map(i => ({ productId: i.productId, quantity: i.quantity }));
      const res = await orderApi.createOrder({ items, shippingAddress: address });
      await clearCart();
      navigate(`/orders/${res.data.id}`, { state: { success: true } });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Order failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ color: '#fff', marginBottom: '2rem' }}>Checkout</h1>
      {error && <div style={{ background: 'rgba(233,69,96,0.1)', border: '1px solid #e94560', color: '#e94560', padding: '12px', borderRadius: '8px', marginBottom: '1.5rem' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
        <form onSubmit={handlePlaceOrder}>
          <div style={{ background: '#1a1a2e', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h2 style={{ color: '#fff', marginTop: 0 }}>Shipping Address</h2>
            <textarea value={address} onChange={e => setAddress(e.target.value)} required
              rows={4} placeholder="Enter full shipping address..."
              style={{ width: '100%', padding: '12px', background: '#0f0f1a', border: '1px solid #333', borderRadius: '8px', color: '#fff', fontSize: '1rem', resize: 'vertical', boxSizing: 'border-box' }} />
          </div>
          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '16px', background: '#e94560', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer' }}>
            {loading ? 'Placing Order...' : '🎉 Place Order'}
          </button>
        </form>

        <div style={{ background: '#1a1a2e', borderRadius: '12px', padding: '1.5rem', height: 'fit-content' }}>
          <h2 style={{ color: '#fff', marginTop: 0 }}>Order Summary</h2>
          {cart.items.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', paddingBottom: '0.8rem', borderBottom: '1px solid #2a2a40' }}>
              <div>
                <p style={{ color: '#fff', margin: 0, fontSize: '0.9rem' }}>{item.productName}</p>
                <p style={{ color: '#888', margin: '2px 0', fontSize: '0.8rem' }}>Qty: {item.quantity}</p>
              </div>
              <span style={{ color: '#fff' }}>${item.subtotal.toFixed(2)}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem' }}>
            <span style={{ color: '#fff', fontWeight: 700 }}>Total</span>
            <span style={{ color: '#e94560', fontWeight: 700, fontSize: '1.2rem' }}>${cart.totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
