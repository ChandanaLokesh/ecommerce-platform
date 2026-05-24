import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Product } from '../types';
import * as productApi from '../api/productApi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    productApi.getProductById(Number(id))
      .then(r => setProduct(r.data))
      .catch(() => navigate('/products'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) return navigate('/login');
    setAdding(true);
    try { await addItem(product!.id, qty); alert('Added to cart!'); }
    catch { alert('Failed to add to cart'); }
    finally { setAdding(false); }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem', color: '#888' }}>Loading...</div>;
  if (!product) return null;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        ← Back
      </button>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', background: '#1a1a2e', borderRadius: '16px', padding: '2rem' }}>
        <div style={{ background: '#0f0f1a', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '320px', fontSize: '5rem' }}>
          {product.imageUrl ? <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} /> : '📦'}
        </div>
        <div>
          <span style={{ color: '#e94560', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{product.category}</span>
          <h1 style={{ color: '#fff', margin: '0.5rem 0 1rem', fontSize: '1.8rem' }}>{product.name}</h1>
          <p style={{ color: '#aaa', lineHeight: 1.7, marginBottom: '1.5rem' }}>{product.description}</p>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#e94560', marginBottom: '1rem' }}>
            ${product.price.toFixed(2)}
          </div>
          <p style={{ color: product.stockQuantity > 0 ? '#4caf50' : '#f44336', marginBottom: '1.5rem' }}>
            {product.stockQuantity > 0 ? `✓ ${product.stockQuantity} in stock` : '✗ Out of stock'}
          </p>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
            <label style={{ color: '#ccc' }}>Qty:</label>
            <input type="number" min={1} max={product.stockQuantity} value={qty}
              onChange={e => setQty(Math.max(1, Math.min(product.stockQuantity, Number(e.target.value))))}
              style={{ width: '70px', padding: '8px', background: '#0f0f1a', border: '1px solid #333', borderRadius: '8px', color: '#fff', textAlign: 'center' }} />
          </div>
          <button onClick={handleAddToCart} disabled={product.stockQuantity === 0 || adding}
            style={{ width: '100%', padding: '14px', background: product.stockQuantity > 0 ? '#e94560' : '#333', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '1.1rem', fontWeight: 700, cursor: product.stockQuantity > 0 ? 'pointer' : 'not-allowed' }}>
            {adding ? 'Adding...' : '+ Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};
