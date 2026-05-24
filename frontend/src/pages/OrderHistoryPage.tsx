import React, { useEffect, useState } from 'react';
import { ordersApi } from '../api/orders';
import type { Order } from '../types';

const STATUS_COLORS: Record<string, string> = {
  CREATED: '#f59e0b',
  CONFIRMED: '#3b82f6',
  SHIPPED: '#8b5cf6',
  DELIVERED: '#16a34a',
  CANCELLED: '#dc2626',
};

const OrderHistoryPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    ordersApi.getMyOrders()
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={s.loading}>Loading orders…</div>;

  if (orders.length === 0) {
    return (
      <div style={s.empty}>
        <p style={s.emptyIcon}>📦</p>
        <h2>No orders yet</h2>
        <a href="/" style={s.shopLink}>Start shopping</a>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <h1 style={s.title}>My Orders</h1>
      <div style={s.list}>
        {orders.map(order => (
          <div key={order.id} style={s.card}>
            <div style={s.cardHeader} onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
              <div>
                <span style={s.orderId}>Order #{order.id}</span>
                <span style={s.date}>{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              <div style={s.headerRight}>
                <span style={{ ...s.statusBadge, background: STATUS_COLORS[order.status] + '22', color: STATUS_COLORS[order.status] }}>
                  {order.status}
                </span>
                <span style={s.total}>${Number(order.totalAmount).toFixed(2)}</span>
                <span style={s.toggle}>{expanded === order.id ? '▲' : '▼'}</span>
              </div>
            </div>

            {expanded === order.id && (
              <div style={s.details}>
                {order.shippingAddress && (
                  <p style={s.address}>📍 {order.shippingAddress}</p>
                )}
                <table style={s.table}>
                  <thead>
                    <tr>
                      <th style={s.th}>Product</th>
                      <th style={s.th}>Qty</th>
                      <th style={s.th}>Unit Price</th>
                      <th style={s.th}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map(item => (
                      <tr key={item.id}>
                        <td style={s.td}>{item.productName}</td>
                        <td style={s.td}>{item.quantity}</td>
                        <td style={s.td}>${Number(item.unitPrice).toFixed(2)}</td>
                        <td style={s.td}>${Number(item.subtotal).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const s: Record<string, React.CSSProperties> = {
  page: { maxWidth: 900, margin: '0 auto' },
  title: { fontSize: 28, fontWeight: 700, marginBottom: 28 },
  loading: { textAlign: 'center', padding: 80, color: '#888' },
  list: { display: 'flex', flexDirection: 'column', gap: 12 },
  card: { background: '#fff', borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)', overflow: 'hidden' },
  cardHeader: { padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' },
  orderId: { fontSize: 15, fontWeight: 600, marginRight: 12 },
  date: { fontSize: 13, color: '#888' },
  headerRight: { display: 'flex', alignItems: 'center', gap: 16 },
  statusBadge: { fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20 },
  total: { fontSize: 16, fontWeight: 700 },
  toggle: { color: '#888', fontSize: 12 },
  details: { borderTop: '1px solid #f0f0f0', padding: '16px 20px' },
  address: { fontSize: 13, color: '#666', marginBottom: 14 },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', fontSize: 12, color: '#888', fontWeight: 500, padding: '6px 8px', borderBottom: '1px solid #eee' },
  td: { fontSize: 14, padding: '8px 8px', borderBottom: '1px solid #f8f8f8', color: '#444' },
  empty: { textAlign: 'center', padding: 80 },
  emptyIcon: { fontSize: 60, marginBottom: 16 },
  shopLink: { display: 'inline-block', marginTop: 16, background: '#e94560', color: '#fff', padding: '10px 24px', borderRadius: 8 },
};

export default OrderHistoryPage;
