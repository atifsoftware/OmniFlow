'use client';

import { useState } from 'react';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'ai'>('overview');

  const stats = [
    { label: 'Total Revenue', value: '৳ 4,85,200', change: '+18.4%', isPositive: true },
    { label: 'Total Orders', value: '1,280', change: '+12.1%', isPositive: true },
    { label: 'Active Products', value: '342', change: '+4.5%', isPositive: true },
    { label: 'Queue Status', value: 'Active (0 failed)', change: 'Healthy', isPositive: true },
  ];

  const recentOrders = [
    { id: 'ORD-9021', customer: 'Tanvir Ahmed', total: '৳ 14,500', status: 'Completed', date: 'Just now' },
    { id: 'ORD-9020', customer: 'Sadia Rahman', total: '৳ 3,200', status: 'Processing', date: '12 min ago' },
    { id: 'ORD-9019', customer: 'Imran Hossain', total: '৳ 28,000', status: 'Completed', date: '45 min ago' },
    { id: 'ORD-9018', customer: 'Nasir Uddin', total: '৳ 7,650', status: 'Pending', date: '2 hours ago' },
  ];

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '6px' }}>
            OmniFlow ERP Admin Portal
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Real-time business intelligence, orders, and system monitoring.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <span className="badge badge-green" style={{ padding: '8px 16px' }}>● MySQL Connected</span>
          <span className="badge badge-blue" style={{ padding: '8px 16px' }}>⚡ OmniDB Engine</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '28px' }}>
        <button
          onClick={() => setActiveTab('overview')}
          className={activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '8px 16px', fontSize: '0.9rem' }}
        >
          📊 Overview
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={activeTab === 'orders' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '8px 16px', fontSize: '0.9rem' }}
        >
          📦 Recent Orders
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '40px',
      }}>
        {stats.map((s, idx) => (
          <div key={idx} className="glass-card" style={{ padding: '24px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{s.label}</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, margin: '8px 0' }}>{s.value}</div>
            <span style={{
              fontSize: '0.85rem',
              color: s.isPositive ? 'var(--accent-emerald)' : 'var(--accent-rose)',
              fontWeight: 600,
            }}>
              {s.change}
            </span>
          </div>
        ))}
      </div>

      {/* Orders Table */}
      <div className="glass-card" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '20px' }}>
          Recent Activity & Orders
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 16px' }}>Order ID</th>
                <th style={{ padding: '12px 16px' }}>Customer</th>
                <th style={{ padding: '12px 16px' }}>Total Amount</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px' }}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((ord, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '16px', fontWeight: 600, color: 'var(--accent-cyan)' }}>{ord.id}</td>
                  <td style={{ padding: '16px' }}>{ord.customer}</td>
                  <td style={{ padding: '16px', fontWeight: 600 }}>{ord.total}</td>
                  <td style={{ padding: '16px' }}>
                    <span className={ord.status === 'Completed' ? 'badge badge-green' : 'badge badge-blue'}>
                      {ord.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{ord.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
