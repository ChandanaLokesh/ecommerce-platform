import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import * as cartApi from '../api/cartApi';

export const CartPage = () => {
  const { cart, fetchCart, removeItem } = useCart();
  const navigate = useNavigate();

  useEffect(() => { fetchCart(); }, []);

  const handleUpdateQty = async (itemId: number, qty: number) => {
    await cartApi.updateCartItem(itemId, qty);
    fetchCart();
  };

  if (!cart || cart.items.length === 0) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛒</div>
        <h2 style={{ color: '#fff' }}>Your cart is empty</h2>
        <Link to="/products" style={{ color: '#e94560', textDecoration: 'none', fontSize: '1rem' }}>Continue Shopping →</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ color: '#fff', marginBottom: '2rem' }}>Shopping Cart</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
        <div>
          {cart.items.map(item => (
            <div key={item.id} style={{ background: '#1a1a2e', borderRadius: '12px', padding: '1.2rem', marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ background: '#0f0f1a', borderRadius: '8px', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', flexShrink: 0 }}>📦</div>
              <div style={{ flex: 1 }}>
                <h3 style={{ color: '#fff', margin: 0 }}>{item.productName}</h3>
                <p style={{ color: '#e94560', margin: '4px 0' }}>${item.unitPrice.toFixed(2)} each</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button onClick={() => handleUpdateQty(item.id, item.quantity - 1)} disabled={item.quantity <= 1}
                  style={{ width: '32px', height: '32px', background: '#333', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1.2rem' }}>−</button>
                <span style={{ color: '#fff', width: '30px', textAlign: 'center' }}>{item.quantity}</span>
                <button onClick={() => handleUpdateQty(item.id, item.quantity + 1)}
                  style={{ width: '32px', height: '32px', background: '#333', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1.2rem' }}>+</button>
              </div>
              <span style={{ color: '#fff', fontWeight: 700, minWidth: '70px', textAlign: 'right' }}>${item.subtotal.toFixed(2)}</span>
              <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', color: '#f44336', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>
          ))}
        </div>

        <div style={{ background: '#1a1a2e', borderRadius: '12px', padding: '1.5rem', height: 'fit-content' }}>
          <h2 style={{ color: '#fff', marginTop: 0 }}>Order Summary</h2>
          <div style={{ borderTop: '1px solid #333', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: '#aaa' }}>Items ({cart.items.length})</span>
              <span style={{ color: '#fff' }}>${cart.totalPrice.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <span style={{ color: '#aaa' }}>Shipping</span>
              <span style={{ color: '#4caf50' }}>Free</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #333', paddingTop: '1rem', marginBottom: '1.5rem' }}>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>Total</span>
              <span style={{ color: '#e94560', fontWeight: 700, fontSize: '1.2rem' }}>${cart.totalPrice.toFixed(2)}</span>
            </div>
            <button onClick={() => navigate('/checkout')} style={{ width: '100%', padding: '14px', background: '#e94560', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}>
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
