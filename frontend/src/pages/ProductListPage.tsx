import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Product, Page } from '../types';
import * as productApi from '../api/productApi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export const ProductListPage = () => {
  const [pageData, setPageData] = useState<Page<Product> | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<number | null>(null);
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = query
        ? await productApi.searchProducts(query, currentPage)
        : await productApi.getProducts(currentPage);
      setPageData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, query]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0);
    setQuery(search);
  };

  const handleAddToCart = async (productId: number) => {
    if (!isAuthenticated) return alert('Please login to add items to cart');
    setAddingId(productId);
    try { await addItem(productId, 1); }
    catch (err) { alert('Failed to add item'); }
    finally { setAddingId(null); }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ color: '#fff', marginBottom: '1.5rem' }}>Products</h1>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
          style={{ flex: 1, padding: '10px 16px', background: '#1a1a2e', border: '1px solid #333', borderRadius: '8px', color: '#fff', fontSize: '1rem' }} />
        <button type="submit" style={{ padding: '10px 24px', background: '#e94560', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
          Search
        </button>
        {query && <button type="button" onClick={() => { setQuery(''); setSearch(''); setCurrentPage(0); }}
          style={{ padding: '10px 16px', background: '#333', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          Clear
        </button>}
      </form>

      {loading ? (
        <div style={{ textAlign: 'center', color: '#888', padding: '4rem' }}>Loading products...</div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {pageData?.content.map(product => (
              <div key={product.id} style={{
                background: '#1a1a2e', borderRadius: '12px', overflow: 'hidden',
                transition: 'transform 0.2s', border: '1px solid #2a2a40'
              }}>
                <div style={{ height: '200px', background: '#0f0f1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
                  {product.imageUrl ? <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : '📦'}
                </div>
                <div style={{ padding: '1.2rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#e94560', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {product.category || 'General'}
                  </span>
                  <h3 style={{ color: '#fff', margin: '0.5rem 0', fontSize: '1rem' }}>
                    <Link to={`/products/${product.id}`} style={{ color: '#fff', textDecoration: 'none' }}>
                      {product.name}
                    </Link>
                  </h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                    <span style={{ color: '#e94560', fontSize: '1.2rem', fontWeight: 700 }}>
                      ${product.price.toFixed(2)}
                    </span>
                    <span style={{ color: product.stockQuantity > 0 ? '#4caf50' : '#f44336', fontSize: '0.8rem' }}>
                      {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of stock'}
                    </span>
                  </div>
                  <button onClick={() => handleAddToCart(product.id)} disabled={product.stockQuantity === 0 || addingId === product.id}
                    style={{ width: '100%', marginTop: '1rem', padding: '10px', background: product.stockQuantity > 0 ? '#e94560' : '#333', color: '#fff', border: 'none', borderRadius: '8px', cursor: product.stockQuantity > 0 ? 'pointer' : 'not-allowed', fontWeight: 600 }}>
                    {addingId === product.id ? 'Adding...' : product.stockQuantity > 0 ? '+ Add to Cart' : 'Out of Stock'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {pageData && pageData.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
              {Array.from({ length: pageData.totalPages }, (_, i) => (
                <button key={i} onClick={() => setCurrentPage(i)}
                  style={{ padding: '8px 16px', background: i === currentPage ? '#e94560' : '#1a1a2e', color: '#fff', border: '1px solid #333', borderRadius: '6px', cursor: 'pointer' }}>
                  {i + 1}
                </button>
              ))}
            </div>
          )}

          {pageData?.content.length === 0 && (
            <div style={{ textAlign: 'center', color: '#888', padding: '4rem' }}>
              No products found{query && ` for "${query}"`}
            </div>
          )}
        </>
      )}
    </div>
  );
};
