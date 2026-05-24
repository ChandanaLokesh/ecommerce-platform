import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as authApi from '../api/authApi';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      login(res.data);
      navigate('/products');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h1 style={{ color: '#e94560', marginBottom: '0.5rem' }}>Welcome back</h1>
        <p style={{ color: '#888', marginBottom: '2rem' }}>Sign in to your account</p>

        {error && <div style={errorStyle}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>Email</label>
          <input style={inputStyle} type="email" value={email}
            onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" />

          <label style={labelStyle}>Password</label>
          <input style={inputStyle} type="password" value={password}
            onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />

          <button type="submit" disabled={loading} style={btnStyle}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#888' }}>
          Don't have an account? <Link to="/register" style={{ color: '#e94560' }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
};

const pageStyle: React.CSSProperties = {
  minHeight: '100vh', background: '#0f0f1a',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};
const cardStyle: React.CSSProperties = {
  background: '#1a1a2e', padding: '2.5rem', borderRadius: '12px',
  width: '100%', maxWidth: '420px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
};
const labelStyle: React.CSSProperties = {
  display: 'block', color: '#ccc', marginBottom: '6px', fontSize: '0.9rem',
};
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', background: '#0f0f1a',
  border: '1px solid #333', borderRadius: '8px', color: '#fff',
  fontSize: '1rem', marginBottom: '1.2rem', boxSizing: 'border-box',
};
const btnStyle: React.CSSProperties = {
  width: '100%', padding: '12px', background: '#e94560',
  color: '#fff', border: 'none', borderRadius: '8px',
  fontSize: '1rem', fontWeight: 600, cursor: 'pointer',
};
const errorStyle: React.CSSProperties = {
  background: 'rgba(233,69,96,0.1)', border: '1px solid #e94560',
  color: '#e94560', padding: '10px', borderRadius: '8px', marginBottom: '1rem',
};
