import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Order } from '../types';
import * as orderApi from '../api/orderApi';

const statusColors: Record<string, string> = {
  CREATED: '#f5a623', CONFIRMED: '#4caf50', SHIPPED: '#2196f3',
  DELIVERED: '#4caf50', CANCELLED: '#f44336',
};

const statusSteps = ['CREATED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

export const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    orderApi.getOrderById(Number(id)).then(r => setOrder(r.data))
      .catch(() => navigate('/orders'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem', color: '#888' }}>Loading...</div>;
  if (!order) return null;

  const stepIndex = statusSteps.indexOf(order.status);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <button onClick={() => navigate('/orders')} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', marginBottom: '1.5rem' }}>← Back to Orders</button>
      
      <div style={{ background: '#1a1a2e', borderRadius: '12px', padding: '2rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ color: '#fff', margin: 0 }}>Order #{order.id}</h1>
          <span style={{ background: statusColors[order.status] + '22', color: statusColors[order.status], padding: '6px 16px', borderRadius: '20px', fontWeight: 600 }}>
            {order.status}
          </span>
        </div>

        {order.status !== 'CANCELLED' && (
          <div style={{ display: 'flex', marginBottom: '2rem' }}>
            {statusSteps.map((step, i) => (
              <React.Fragment key={step}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: i <= stepIndex ? '#e94560' : '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.85rem' }}>
                    {i < stepIndex ? '✓' : i + 1}
                  </div>
                  <span style={{ color: i <= stepIndex ? '#fff' : '#666', fontSize: '0.75rem', marginTop: '4px', textAlign: 'center' }}>{step}</span>
                </div>
                {i < statusSteps.length - 1 && (
                  <div style={{ flex: 1, height: '2px', background: i < stepIndex ? '#e94560' : '#333', alignSelf: 'flex-start', marginTop: '15px' }} />
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        <p style={{ color: '#aaa', margin: 0 }}>📍 {order.shippingAddress}</p>
        <p style={{ color: '#666', fontSize: '0.85rem', margin: '4px 0 0' }}>Placed on {new Date(order.createdAt).toLocaleString()}</p>
      </div>

      <div style={{ background: '#1a1a2e', borderRadius: '12px', padding: '1.5rem' }}>
        <h2 style={{ color: '#fff', marginTop: 0 }}>Items</h2>
        {order.items.map(item => (
          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid #2a2a40' }}>
            <div>
              <p style={{ color: '#fff', margin: 0 }}>{item.productName}</p>
              <p style={{ color: '#888', margin: '4px 0', fontSize: '0.85rem' }}>Qty: {item.quantity} × ${item.unitPrice.toFixed(2)}</p>
            </div>
            <span style={{ color: '#fff', fontWeight: 700 }}>${item.subtotal.toFixed(2)}</span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1rem' }}>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>Total</span>
          <span style={{ color: '#e94560', fontWeight: 700, fontSize: '1.3rem' }}>${order.totalAmount.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};
