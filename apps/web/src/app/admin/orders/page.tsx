'use client';

import { useState } from 'react';

export default function AdminOrdersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [orders] = useState([
    { id: 'ORD-9021', customer: 'Tanvir Ahmed', phone: '01711223344', total: '৳ ১৪,৫০০', items: 3, status: 'Completed', date: 'এইমাত্র', method: 'bKash' },
    { id: 'ORD-9020', customer: 'Sadia Rahman', phone: '01811334455', total: '৳ ৩,২০০', items: 1, status: 'Processing', date: '১২ মিনিট আগে', method: 'COD' },
    { id: 'ORD-9019', customer: 'Imran Hossain', phone: '01911445566', total: '৳ ২৮,০০০', items: 6, status: 'Completed', date: '৪৫ মিনিট আগে', method: 'Nagad' },
    { id: 'ORD-9018', customer: 'Nasir Uddin', phone: '01611556677', total: '৳ ৭,৬৫০', items: 2, status: 'Pending', date: '২ ঘণ্টা আগে', method: 'SSLCommerz' },
    { id: 'ORD-9017', customer: 'Fahim Faisal', phone: '01511667788', total: '৳ ৫,৪০০', items: 2, status: 'Cancelled', date: '৫ ঘণ্টা আগে', method: 'COD' },
  ]);

  const filteredOrders = orders.filter((ord) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = !q || ord.id.toLowerCase().includes(q) || ord.customer.toLowerCase().includes(q) || ord.phone.includes(q);
    const matchesStatus = statusFilter === 'ALL' || ord.status === statusFilter;
    return matchesSearch && matchesStatus;
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
            <i className="fas fa-shopping-bag"></i>
          </div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 800 }}>অর্ডার ও বিক্রয় ব্যবস্থাপনা</div>
            <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)' }}>
              ই-কমার্স ও ERP সমস্ত সেলস অর্ডার, পেমেন্ট ও ইনভয়েস মনিটরিং
            </div>
          </div>
        </div>

        <button
          type="button"
          className="btn-adm-primary"
          onClick={() => triggerToast('নতুন অর্ডার', 'ম্যানুয়াল অর্ডার এন্ট্রি উইন্ডো ওপেন হয়েছে')}
        >
          <i className="fas fa-plus"></i>
          <span>নতুন অর্ডার তৈরি</span>
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
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>মোট অর্ডার</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>১,৪২০ টি</div>
          <div style={{ fontSize: '11.5px', color: '#10b981', marginTop: '6px' }}>↑ ১২% এই সপ্তাহে</div>
        </div>
        <div className="live-stat-card">
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>প্রক্রিয়াধীন (Processing)</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#0ea5e9', marginTop: '4px' }}>৩৪২ টি</div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '6px' }}>প্যাকিং ও ডেলিভারি চলমান</div>
        </div>
        <div className="live-stat-card">
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>ডেলিভারি সম্পন্ন</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>১,০২৬ টি</div>
          <div style={{ fontSize: '11.5px', color: '#10b981', marginTop: '6px' }}>সফলভাবে হস্তান্তরিত</div>
        </div>
        <div className="live-stat-card">
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>মোট সেলস ভলিউম</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--adm-primary)', marginTop: '4px' }}>৳ ৪,৮৫,২০০</div>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '6px' }}>আজকের সেলস ৳ ৫২,৩০০</div>
        </div>
      </div>

      {/* Filter and Table Container */}
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
              placeholder="অর্ডার আইডি, গ্রাহক বা ফোন নম্বর খুঁজুন..."
              className="form-control"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ maxWidth: '320px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: '160px' }}
            >
              <option value="ALL">সব স্ট্যাটাস</option>
              <option value="Completed">ডেলিভারি সম্পন্ন</option>
              <option value="Processing">প্রসেসিং</option>
              <option value="Pending">অপেক্ষমান</option>
              <option value="Cancelled">বাতিল</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
            <thead>
              <tr style={{ background: 'var(--body-bg)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 18px', textAlign: 'left' }}>অর্ডার আইডি</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>গ্রাহকের নাম ও ফোন</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>পেমেন্ট মেথড</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>মোট মূল্য</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>স্ট্যাটাস</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>অর্ডার সময়</th>
                <th style={{ padding: '12px 18px', textAlign: 'right' }}>অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((ord) => (
                <tr key={ord.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px 18px', fontWeight: 800, color: 'var(--adm-primary)', fontFamily: "'Inter', sans-serif" }}>
                    {ord.id}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{ord.customer}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{ord.phone}</div>
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
                      {ord.method}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 700, fontFamily: "'Inter', sans-serif", color: 'var(--text-main)' }}>
                    {ord.total}
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>{ord.items}টি আইটেম</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        background:
                          ord.status === 'Completed'
                            ? 'rgba(16, 185, 129, 0.12)'
                            : ord.status === 'Processing'
                            ? 'rgba(14, 165, 233, 0.12)'
                            : ord.status === 'Pending'
                            ? 'rgba(245, 158, 11, 0.12)'
                            : 'rgba(239, 68, 68, 0.12)',
                        color:
                          ord.status === 'Completed'
                            ? '#10b981'
                            : ord.status === 'Processing'
                            ? '#0ea5e9'
                            : ord.status === 'Pending'
                            ? '#f59e0b'
                            : '#ef4444',
                      }}
                    >
                      ● {ord.status === 'Completed' ? 'ডেলিভারি সম্পন্ন' : ord.status === 'Processing' ? 'প্রসেসিং' : ord.status === 'Pending' ? 'অপেক্ষমান' : 'বাতিল'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{ord.date}</td>
                  <td style={{ padding: '12px 18px', textAlign: 'right' }}>
                    <button
                      type="button"
                      className="btn-adm-outline"
                      style={{ height: '32px', padding: '0 10px', fontSize: '12px' }}
                      onClick={() => triggerToast('ইনভয়েস ডাউনলোড', `${ord.id} এর বাংলা PDF ইনভয়েস রেন্ডার হচ্ছে...`)}
                      title="বাংলা ইউনিকোড PDF ইনভয়েস ডাউনলোড"
                    >
                      <i className="fas fa-file-pdf text-danger"></i> PDF
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
