import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Order } from '../types';
import * as orderApi from '../api/orderApi';

const statusColors: Record<string, string> = {
  CREATED: '#f5a623', CONFIRMED: '#4caf50', SHIPPED: '#2196f3',
  DELIVERED: '#4caf50', CANCELLED: '#f44336',
};

export const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderApi.getMyOrders().then(r => setOrders(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem', color: '#888' }}>Loading orders...</div>;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ color: '#fff', marginBottom: '2rem' }}>My Orders</h1>
      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#888' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
          <p>No orders yet.</p>
          <Link to="/products" style={{ color: '#e94560' }}>Start shopping →</Link>
        </div>
      ) : orders.map(order => (
        <Link key={order.id} to={`/orders/${order.id}`} style={{ textDecoration: 'none' }}>
          <div style={{ background: '#1a1a2e', borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem', border: '1px solid #2a2a40', cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ color: '#fff', margin: 0 }}>Order #{order.id}</h3>
                <p style={{ color: '#888', margin: '4px 0', fontSize: '0.85rem' }}>{new Date(order.createdAt).toLocaleDateString()}</p>
                <p style={{ color: '#aaa', margin: '8px 0 0', fontSize: '0.9rem' }}>{order.items.length} item(s)</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ background: statusColors[order.status] + '22', color: statusColors[order.status], padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>
                  {order.status}
                </span>
                <p style={{ color: '#e94560', fontWeight: 700, fontSize: '1.2rem', margin: '8px 0 0' }}>
                  ${order.totalAmount.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};
