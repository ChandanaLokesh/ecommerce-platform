import React, { useEffect, useState } from 'react';
import { Product } from '../../types';
import * as productApi from '../../api/productApi';
import * as orderApi from '../../api/orderApi';

export const AdminDashboard = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', stockQuantity: '', category: '', imageUrl: '' });
  const [saving, setSaving] = useState(false);

  const fetchProducts = async () => {
    const res = await productApi.getProducts(0, 100);
    setProducts(res.data.content);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleEdit = (p: Product) => {
    setEditProduct(p);
    setForm({ name: p.name, description: p.description || '', price: String(p.price), stockQuantity: String(p.stockQuantity), category: p.category || '', imageUrl: p.imageUrl || '' });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this product?')) return;
    await productApi.deleteProduct(id);
    fetchProducts();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const data = { ...form, price: Number(form.price), stockQuantity: Number(form.stockQuantity) };
    try {
      if (editProduct) await productApi.updateProduct(editProduct.id, data);
      else await productApi.createProduct(data);
      setShowForm(false); setEditProduct(null);
      setForm({ name: '', description: '', price: '', stockQuantity: '', category: '', imageUrl: '' });
      fetchProducts();
    } finally { setSaving(false); }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: '#fff', margin: 0 }}>⚙️ Admin Dashboard</h1>
        <button onClick={() => { setShowForm(!showForm); setEditProduct(null); setForm({ name:'',description:'',price:'',stockQuantity:'',category:'',imageUrl:'' }); }}
          style={{ padding: '10px 20px', background: '#e94560', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
          {showForm ? 'Cancel' : '+ Add Product'}
        </button>
      </div>

      {showForm && (
        <div style={{ background: '#1a1a2e', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem' }}>
          <h2 style={{ color: '#fff', marginTop: 0 }}>{editProduct ? 'Edit Product' : 'New Product'}</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {[['name','Name','text'], ['price','Price','number'], ['stockQuantity','Stock','number'], ['category','Category','text'], ['imageUrl','Image URL','url']].map(([f, l, t]) => (
                <div key={f}>
                  <label style={{ display: 'block', color: '#ccc', marginBottom: '6px', fontSize: '0.9rem' }}>{l}</label>
                  <input type={t} value={form[f as keyof typeof form]} onChange={e => setForm(p => ({ ...p, [f]: e.target.value }))} required={f !== 'imageUrl'}
                    style={{ width: '100%', padding: '10px', background: '#0f0f1a', border: '1px solid #333', borderRadius: '8px', color: '#fff', fontSize: '1rem', boxSizing: 'border-box' }} />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', color: '#ccc', marginBottom: '6px', fontSize: '0.9rem' }}>Description</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3}
                  style={{ width: '100%', padding: '10px', background: '#0f0f1a', border: '1px solid #333', borderRadius: '8px', color: '#fff', fontSize: '1rem', boxSizing: 'border-box', resize: 'vertical' }} />
              </div>
            </div>
            <button type="submit" disabled={saving}
              style={{ marginTop: '1.5rem', padding: '12px 32px', background: '#e94560', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
              {saving ? 'Saving...' : editProduct ? 'Update Product' : 'Create Product'}
            </button>
          </form>
        </div>
      )}

      {loading ? <p style={{ color: '#888' }}>Loading...</p> : (
        <div style={{ background: '#1a1a2e', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#0f0f1a' }}>
                {['ID', 'Name', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', color: '#888', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} style={{ borderTop: '1px solid #2a2a40' }}>
                  <td style={{ padding: '12px 16px', color: '#888', fontSize: '0.85rem' }}>#{p.id}</td>
                  <td style={{ padding: '12px 16px', color: '#fff', fontWeight: 500 }}>{p.name}</td>
                  <td style={{ padding: '12px 16px', color: '#aaa', fontSize: '0.85rem' }}>{p.category}</td>
                  <td style={{ padding: '12px 16px', color: '#e94560', fontWeight: 600 }}>${p.price.toFixed(2)}</td>
                  <td style={{ padding: '12px 16px', color: p.stockQuantity > 0 ? '#4caf50' : '#f44336' }}>{p.stockQuantity}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ background: p.active ? '#4caf5022' : '#f4433622', color: p.active ? '#4caf50' : '#f44336', padding: '2px 10px', borderRadius: '12px', fontSize: '0.8rem' }}>
                      {p.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <button onClick={() => handleEdit(p)} style={{ background: '#2196f322', color: '#2196f3', border: 'none', padding: '4px 12px', borderRadius: '6px', cursor: 'pointer', marginRight: '8px', fontSize: '0.85rem' }}>Edit</button>
                    <button onClick={() => handleDelete(p.id)} style={{ background: '#f4433622', color: '#f44336', border: 'none', padding: '4px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
