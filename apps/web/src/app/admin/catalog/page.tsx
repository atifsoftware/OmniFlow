'use client';

import { useState } from 'react';

export default function AdminCatalogPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const [products] = useState([
    { id: 'SKU-1001', name: 'Wireless Ergonomic Keyboard', category: 'Accessories', price: '৳ ৪,৫০০', cost: '৳ ৩,২০০', stock: 45, status: 'In Stock' },
    { id: 'SKU-1002', name: 'Precision Gaming Mouse', category: 'Accessories', price: '৳ ২,৮০০', cost: '৳ ১,৯০০', stock: 120, status: 'In Stock' },
    { id: 'SKU-1003', name: 'Ultra-Wide 34" Curved Monitor', category: 'Monitors', price: '৳ ৪২,০০০', cost: '৳ ৩৫,০০০', stock: 8, status: 'Low Stock' },
    { id: 'SKU-1004', name: 'USB-C Multiport Hub Adapter', category: 'Peripherals', price: '৳ ১,৯৫০', cost: '৳ ১,২০০', stock: 0, status: 'Out of Stock' },
    { id: 'SKU-1005', name: 'Mechanical RGB Keyboard Blue Switch', category: 'Accessories', price: '৳ ৫,২০০', cost: '৳ ৩,৮০০', stock: 24, status: 'In Stock' },
  ]);

  const filteredProducts = products.filter((p) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = !q || p.id.toLowerCase().includes(q) || p.name.toLowerCase().includes(q);
    const matchesCat = categoryFilter === 'ALL' || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const triggerToast = (title: string, message: string) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('show-toast', {
          detail: { title, message, type: 'success' },
        })
      );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div className="adm-page-header">
        <div className="adm-page-title">
          <div className="title-icon">
            <i className="fas fa-boxes"></i>
          </div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 800 }}>পণ্য ও ক্যাটালগ ইনভেন্টরি</div>
            <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)' }}>
              ই-কমার্স প্রোডাক্ট ক্যাটালগ, ক্যাটাগরি, মূল্য ও মাল্টি-ওয়্যারহাউস স্টক ট্র্যাকিং
            </div>
          </div>
        </div>

        <button
          type="button"
          className="btn-adm-primary"
          onClick={() => triggerToast('নতুন পণ্য', 'পণ্য এন্ট্রি ও বারকোড জেনারেটর ওপেন হয়েছে')}
        >
          <i className="fas fa-plus"></i>
          <span>নতুন পণ্য যোগ করুন</span>
        </button>
      </div>

      {/* KPI Stats Widgets */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
        }}
      >
        <div className="live-stat-card">
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>মোট পণ্য (SKUs)</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>৩৪৮ টি</div>
          <div style={{ fontSize: '11.5px', color: '#10b981', marginTop: '6px' }}>১২টি ক্যাটাগরিতে বিভক্ত</div>
        </div>
        <div className="live-stat-card">
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>স্টকে আছে (In Stock)</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>৩২২ টি</div>
          <div style={{ fontSize: '11.5px', color: '#10b981', marginTop: '6px' }}>পর্যাপ্ত মজুদ রয়েছে</div>
        </div>
        <div className="live-stat-card">
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>সীমিত স্টক (Low Stock)</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>১৮ টি</div>
          <div style={{ fontSize: '11.5px', color: '#f59e0b', marginTop: '6px' }}>রি-অর্ডার লেভেল স্পর্শ করেছে</div>
        </div>
        <div className="live-stat-card">
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>স্টক শেষ (Out of Stock)</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#ef4444', marginTop: '4px' }}>৮ টি</div>
          <div style={{ fontSize: '11.5px', color: '#ef4444', marginTop: '6px' }}>সাপ্লায়ার অর্ডার প্রয়োজন</div>
        </div>
      </div>

      {/* Table Container */}
      <div
        style={{
          background: 'var(--card-bg)',
          borderRadius: '16px',
          border: '1px solid var(--border-color)',
          overflow: 'hidden',
          boxShadow: 'var(--card-shadow)',
        }}
      >
        {/* Filters bar */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '240px' }}>
            <input
              type="text"
              placeholder="SKU কোড অথবা পণ্যের নাম খুঁজুন..."
              className="form-control"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ maxWidth: '320px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <select
              className="form-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ width: '170px' }}
            >
              <option value="ALL">সব ক্যাটাগরি</option>
              <option value="Accessories">Accessories</option>
              <option value="Monitors">Monitors</option>
              <option value="Peripherals">Peripherals</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
            <thead>
              <tr style={{ background: 'var(--body-bg)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 18px', textAlign: 'left' }}>SKU কোড</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>পণ্যের বিবরণ</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>ক্যাটাগরি</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>বিক্রয় মূল্য</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>কেনা মূল্য</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>মজুদ সংখ্যা</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>অবস্থা</th>
                <th style={{ padding: '12px 18px', textAlign: 'right' }}>অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px 18px', fontWeight: 800, color: 'var(--adm-primary)', fontFamily: "'Inter', sans-serif" }}>
                    {p.id}
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-main)' }}>
                    {p.name}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        background: 'rgba(100, 116, 139, 0.12)',
                        color: 'var(--text-main)',
                      }}
                    >
                      {p.category}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 800, fontFamily: "'Inter', sans-serif", color: 'var(--text-main)' }}>
                    {p.price}
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}>
                    {p.cost}
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 700, fontFamily: "'Inter', sans-serif" }}>
                    {p.stock} pcs
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        background:
                          p.status === 'In Stock'
                            ? 'rgba(16, 185, 129, 0.12)'
                            : p.status === 'Low Stock'
                            ? 'rgba(245, 158, 11, 0.12)'
                            : 'rgba(239, 68, 68, 0.12)',
                        color:
                          p.status === 'In Stock'
                            ? '#10b981'
                            : p.status === 'Low Stock'
                            ? '#f59e0b'
                            : '#ef4444',
                      }}
                    >
                      ● {p.status === 'In Stock' ? 'মজুদ আছে' : p.status === 'Low Stock' ? 'সীমিত স্টক' : 'স্টক শেষ'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 18px', textAlign: 'right' }}>
                    <button
                      type="button"
                      className="btn-adm-outline"
                      style={{ height: '32px', padding: '0 10px', fontSize: '12px' }}
                      onClick={() => triggerToast('বারকোড', `${p.id} এর Code128 বারকোড স্টিকার প্রিন্ট হচ্ছে`)}
                      title="বারকোড প্রিন্ট"
                    >
                      <i className="fas fa-barcode"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
