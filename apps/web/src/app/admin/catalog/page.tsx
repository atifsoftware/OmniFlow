'use client';

import { useState } from 'react';

export default function AdminCatalogPage() {
  const [products] = useState([
    { id: 'PRD-101', name: 'Wireless Ergonomic Keyboard', category: 'Accessories', price: '৳ ৪,৫০০', stock: 45, status: 'In Stock' },
    { id: 'PRD-102', name: 'Precision Gaming Mouse', category: 'Accessories', price: '৳ ২,৮০০', stock: 120, status: 'In Stock' },
    { id: 'PRD-103', name: 'Ultra-Wide 34" Curved Monitor', category: 'Monitors', price: '৳ ৪২,০০০', stock: 8, status: 'Low Stock' },
    { id: 'PRD-104', name: 'USB-C Multiport Hub', category: 'Peripherals', price: '৳ ১,৯৫০', stock: 0, status: 'Out of Stock' },
  ]);

  const getStockBadge = (status: string) => {
    switch (status) {
      case 'In Stock':
        return <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '4px 10px', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 600 }}>স্টকে আছে</span>;
      case 'Low Stock':
        return <span style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', padding: '4px 10px', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 600 }}>সীমিত স্টক</span>;
      default:
        return <span style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e', padding: '4px 10px', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 600 }}>স্টক শেষ</span>;
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: "'Hind Siliguri', sans-serif", color: 'var(--text-main, #f8fafc)', margin: '0 0 4px 0' }}>
          পণ্য ও ক্যাটালগ ব্যবস্থাপনা
        </h2>
        <p style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.9rem', fontFamily: "'Hind Siliguri', sans-serif", margin: 0 }}>
          ই-কমার্স ক্যাটালগ, ক্যাটাগরি ও ইনভেন্টরি স্টক ট্র্যাকিং
        </p>
      </div>

      <div className="table-container-premium" style={{ border: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))', borderRadius: '18px', overflow: 'hidden', background: 'var(--bg-card, rgba(30, 41, 59, 0.7))' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-secondary, rgba(15, 23, 42, 0.5))', borderBottom: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))', color: 'var(--text-muted, #94a3b8)', fontSize: '0.85rem', fontFamily: "'Hind Siliguri', sans-serif" }}>
                <th style={{ padding: '14px 18px' }}>প্রোডাক্ট কোড</th>
                <th style={{ padding: '14px 18px' }}>পণ্যের নাম</th>
                <th style={{ padding: '14px 18px' }}>ক্যাটাগরি</th>
                <th style={{ padding: '14px 18px' }}>মূল্য</th>
                <th style={{ padding: '14px 18px' }}>স্টক সংখ্যা</th>
                <th style={{ padding: '14px 18px' }}>অবস্থা</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color, rgba(255, 255, 255, 0.05))' }}>
                  <td style={{ padding: '14px 18px', fontWeight: 700, color: '#38bdf8', fontFamily: "'Inter', sans-serif" }}>{p.id}</td>
                  <td style={{ padding: '14px 18px', color: 'var(--text-main, #f8fafc)', fontWeight: 600 }}>{p.name}</td>
                  <td style={{ padding: '14px 18px', color: 'var(--text-muted, #94a3b8)', fontSize: '0.85rem' }}>{p.category}</td>
                  <td style={{ padding: '14px 18px', color: 'var(--text-main, #f8fafc)', fontWeight: 700, fontFamily: "'Inter', sans-serif" }}>{p.price}</td>
                  <td style={{ padding: '14px 18px', fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>{p.stock} pcs</td>
                  <td style={{ padding: '14px 18px' }}>{getStockBadge(p.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
