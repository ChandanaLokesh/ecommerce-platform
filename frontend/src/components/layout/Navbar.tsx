import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{
      background: '#1a1a2e', color: '#fff', padding: '0 2rem',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      height: '64px', position: 'sticky', top: 0, zIndex: 100,
      boxShadow: '0 2px 12px rgba(0,0,0,0.3)'
    }}>
      <Link to="/" style={{ color: '#e94560', fontSize: '1.4rem', fontWeight: 700, textDecoration: 'none' }}>
        🛒 ShopNow
      </Link>

      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <Link to="/products" style={navLinkStyle}>Products</Link>

        {isAuthenticated ? (
          <>
            <Link to="/cart" style={navLinkStyle}>
              Cart {cartCount > 0 && (
                <span style={{
                  background: '#e94560', borderRadius: '50%',
                  padding: '2px 7px', fontSize: '0.75rem', marginLeft: '4px'
                }}>{cartCount}</span>
              )}
            </Link>
            <Link to="/orders" style={navLinkStyle}>My Orders</Link>
            {isAdmin && <Link to="/admin" style={{ ...navLinkStyle, color: '#f5a623' }}>Admin</Link>}
            <button onClick={handleLogout} style={{
              background: 'transparent', border: '1px solid #e94560',
              color: '#e94560', padding: '6px 16px', borderRadius: '6px',
              cursor: 'pointer', fontSize: '0.9rem'
            }}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={navLinkStyle}>Login</Link>
            <Link to="/register" style={{
              background: '#e94560', color: '#fff',
              padding: '6px 16px', borderRadius: '6px', textDecoration: 'none', fontSize: '0.9rem'
            }}>Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
};

const navLinkStyle: React.CSSProperties = {
  color: '#ccc', textDecoration: 'none', fontSize: '0.95rem',
  transition: 'color 0.2s',
};
