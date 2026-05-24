import React, { useEffect, useState } from 'react';
import { productsApi } from '../../api/products';
import type { Product } from '../../types';

const emptyForm = { name: '', description: '', price: '', stockQuantity: '', category: '', imageUrl: '' };

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    productsApi.getAll(0, 100).then(r => setProducts(r.content)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const handleEdit = (p: Product) => {
    setEditId(p.id);
    setForm({ name: p.name, description: p.description || '', price: String(p.price), stockQuantity: String(p.stockQuantity), category: p.category || '', imageUrl: p.imageUrl || '' });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this product?')) return;
    await productsApi.delete(id);
    load();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, price: Number(form.price), stockQuantity: Number(form.stockQuantity) };
      if (editId) await productsApi.update(editId, payload as any);
      else await productsApi.create(payload as any);
      setShowForm(false); setEditId(null); setForm(emptyForm); load();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h1 style={s.title}>Product Management</h1>
        <button style={s.addBtn} onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}>
          + Add Product
        </button>
      </div>

      {showForm && (
        <div style={s.formCard}>
          <h2 style={s.formTitle}>{editId ? 'Edit Product' : 'New Product'}</h2>
          {error && <div style={s.error}>{error}</div>}
          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.row}>
              <div style={s.col}><label style={s.label}>Name *</label><input style={s.input} required value={form.name} onChange={set('name')} /></div>
              <div style={s.col}><label style={s.label}>Category</label><input style={s.input} value={form.category} onChange={set('category')} /></div>
            </div>
            <div style={s.row}>
              <div style={s.col}><label style={s.label}>Price *</label><input style={s.input} type="number" step="0.01" min="0" required value={form.price} onChange={set('price')} /></div>
              <div style={s.col}><label style={s.label}>Stock *</label><input style={s.input} type="number" min="0" required value={form.stockQuantity} onChange={set('stockQuantity')} /></div>
            </div>
            <label style={s.label}>Description</label>
            <textarea style={{ ...s.input, resize: 'vertical' }} rows={3} value={form.description} onChange={set('description')} />
            <label style={s.label}>Image URL</label>
            <input style={s.input} value={form.imageUrl} onChange={set('imageUrl')} placeholder="https://..." />
            <div style={s.formActions}>
              <button type="submit" style={s.saveBtn} disabled={saving}>{saving ? 'Saving…' : 'Save Product'}</button>
              <button type="button" style={s.cancelBtn} onClick={() => { setShowForm(false); setEditId(null); }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? <div style={s.loading}>Loading…</div> : (
        <table style={s.table}>
          <thead>
            <tr>{['ID', 'Name', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} style={s.tr}>
                <td style={s.td}>#{p.id}</td>
                <td style={s.td}>{p.name}</td>
                <td style={s.td}>{p.category || '—'}</td>
                <td style={s.td}>${Number(p.price).toFixed(2)}</td>
                <td style={s.td}>{p.stockQuantity}</td>
                <td style={s.td}><span style={{ ...s.statusBadge, background: p.active ? '#dcfce7' : '#fee2e2', color: p.active ? '#16a34a' : '#dc2626' }}>{p.active ? 'Active' : 'Inactive'}</span></td>
                <td style={s.td}>
                  <button style={s.editBtn} onClick={() => handleEdit(p)}>Edit</button>
                  <button style={s.deleteBtn} onClick={() => handleDelete(p.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

const s: Record<string, React.CSSProperties> = {
  page: { maxWidth: 1100, margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 28, fontWeight: 700 },
  addBtn: { background: '#e94560', color: '#fff', padding: '10px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600 },
  formCard: { background: '#fff', borderRadius: 12, padding: 28, marginBottom: 28, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' },
  formTitle: { fontSize: 18, fontWeight: 600, marginBottom: 16 },
  error: { background: '#fff0f0', color: '#c00', padding: '10px 14px', borderRadius: 8, marginBottom: 12, fontSize: 14 },
  form: { display: 'flex', flexDirection: 'column', gap: 12 },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  col: { display: 'flex', flexDirection: 'column', gap: 4 },
  label: { fontSize: 12, fontWeight: 500, color: '#555' },
  input: { padding: '9px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14 },
  formActions: { display: 'flex', gap: 12, marginTop: 4 },
  saveBtn: { background: '#1a1a2e', color: '#fff', padding: '10px 24px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 14 },
  cancelBtn: { background: '#f0f0f0', color: '#555', padding: '10px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 14 },
  loading: { textAlign: 'center', padding: 60, color: '#888' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  th: { padding: '12px 14px', textAlign: 'left', fontSize: 12, color: '#888', fontWeight: 500, background: '#f8f9fa', borderBottom: '1px solid #eee' },
  tr: {},
  td: { padding: '12px 14px', fontSize: 14, borderBottom: '1px solid #f5f5f5', color: '#333' },
  statusBadge: { fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 12 },
  editBtn: { background: '#eff6ff', color: '#1d4ed8', border: 'none', cursor: 'pointer', fontSize: 13, padding: '4px 12px', borderRadius: 6, marginRight: 8 },
  deleteBtn: { background: '#fff0f0', color: '#dc2626', border: 'none', cursor: 'pointer', fontSize: 13, padding: '4px 12px', borderRadius: 6 },
};

export default AdminProducts;
