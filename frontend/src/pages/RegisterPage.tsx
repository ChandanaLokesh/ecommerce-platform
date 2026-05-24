import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as authApi from '../api/authApi';

export const RegisterPage = () => {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.register(form);
      login(res.data);
      navigate('/products');
    } catch (err: any) {
      const msg = err.response?.data?.message || Object.values(err.response?.data?.fieldErrors || {}).join(', ');
      setError(msg || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#1a1a2e', padding: '2.5rem', borderRadius: '12px', width: '100%', maxWidth: '480px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
        <h1 style={{ color: '#e94560', marginBottom: '0.5rem' }}>Create account</h1>
        <p style={{ color: '#888', marginBottom: '2rem' }}>Start shopping today</p>

        {error && <div style={{ background: 'rgba(233,69,96,0.1)', border: '1px solid #e94560', color: '#e94560', padding: '10px', borderRadius: '8px', marginBottom: '1rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {(['firstName', 'lastName'] as const).map(f => (
              <div key={f}>
                <label style={{ display: 'block', color: '#ccc', marginBottom: '6px', fontSize: '0.9rem' }}>
                  {f === 'firstName' ? 'First name' : 'Last name'}
                </label>
                <input name={f} value={form[f]} onChange={handleChange} required
                  style={{ width: '100%', padding: '10px', background: '#0f0f1a', border: '1px solid #333', borderRadius: '8px', color: '#fff', fontSize: '1rem', boxSizing: 'border-box' }} />
              </div>
            ))}
          </div>

          {[['email', 'Email', 'email'], ['password', 'Password', 'password'], ['phone', 'Phone (optional)', 'tel']].map(([name, label, type]) => (
            <div key={name} style={{ marginTop: '1rem' }}>
              <label style={{ display: 'block', color: '#ccc', marginBottom: '6px', fontSize: '0.9rem' }}>{label}</label>
              <input name={name} type={type} value={form[name as keyof typeof form]}
                onChange={handleChange} required={name !== 'phone'}
                style={{ width: '100%', padding: '10px', background: '#0f0f1a', border: '1px solid #333', borderRadius: '8px', color: '#fff', fontSize: '1rem', boxSizing: 'border-box' }} />
            </div>
          ))}

          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '12px', background: '#e94560', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', marginTop: '1.5rem' }}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#888' }}>
          Already have an account? <Link to="/login" style={{ color: '#e94560' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};
