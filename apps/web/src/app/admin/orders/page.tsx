'use client';

import { useState } from 'react';

export default function AdminOrdersPage() {
  const [orders] = useState([
    { id: 'ORD-9021', customer: 'Tanvir Ahmed', total: '৳ ১৪,৫০০', status: 'Completed', date: 'এইমাত্র' },
    { id: 'ORD-9020', customer: 'Sadia Rahman', total: '৳ ৩,২০০', status: 'Processing', date: '১২ মিনিট আগে' },
    { id: 'ORD-9019', customer: 'Imran Hossain', total: '৳ ২৮,০০০', status: 'Completed', date: '৪৫ মিনিট আগে' },
    { id: 'ORD-9018', customer: 'Nasir Uddin', total: '৳ ৭,৬৫০', status: 'Pending', date: '২ ঘণ্টা আগে' },
    { id: 'ORD-9017', customer: 'Fahim Faisal', total: '৳ ৫,৪০০', status: 'Cancelled', date: '৫ ঘণ্টা আগে' },
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return (
          <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '4px 10px', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 600 }}>
            ● ডেলিভারি সম্পন্ন
          </span>
        );
      case 'Processing':
        return (
          <span style={{ background: 'rgba(14, 165, 233, 0.15)', color: '#0ea5e9', padding: '4px 10px', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 600 }}>
            ● প্রসেসিং
          </span>
        );
      case 'Pending':
        return (
          <span style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', padding: '4px 10px', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 600 }}>
            ● অপেক্ষমান
          </span>
        );
      default:
        return (
          <span style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e', padding: '4px 10px', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 600 }}>
            ● বাতিল
          </span>
        );
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: "'Hind Siliguri', sans-serif", color: 'var(--text-main, #f8fafc)', margin: '0 0 4px 0' }}>
          অর্ডার ও বিক্রয় ব্যবস্থাপনা
        </h2>
        <p style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.9rem', fontFamily: "'Hind Siliguri', sans-serif", margin: 0 }}>
          ই-কমার্স ও ERP সমস্ত সেলস অর্ডার ও ইনভয়েস মনিটরিং
        </p>
      </div>

      <div className="table-container-premium" style={{ border: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))', borderRadius: '18px', overflow: 'hidden', background: 'var(--bg-card, rgba(30, 41, 59, 0.7))' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-secondary, rgba(15, 23, 42, 0.5))', borderBottom: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))', color: 'var(--text-muted, #94a3b8)', fontSize: '0.85rem', fontFamily: "'Hind Siliguri', sans-serif" }}>
                <th style={{ padding: '14px 18px' }}>অর্ডার আইডি</th>
                <th style={{ padding: '14px 18px' }}>গ্রাহকের নাম</th>
                <th style={{ padding: '14px 18px' }}>মোট মূল্য</th>
                <th style={{ padding: '14px 18px' }}>স্ট্যাটাস</th>
                <th style={{ padding: '14px 18px' }}>অর্ডার সময়</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((ord) => (
                <tr key={ord.id} style={{ borderBottom: '1px solid var(--border-color, rgba(255, 255, 255, 0.05))' }}>
                  <td style={{ padding: '14px 18px', fontWeight: 700, color: '#38bdf8', fontFamily: "'Inter', sans-serif" }}>{ord.id}</td>
                  <td style={{ padding: '14px 18px', color: 'var(--text-main, #f8fafc)', fontWeight: 600 }}>{ord.customer}</td>
                  <td style={{ padding: '14px 18px', color: 'var(--text-main, #f8fafc)', fontWeight: 700, fontFamily: "'Inter', sans-serif" }}>{ord.total}</td>
                  <td style={{ padding: '14px 18px' }}>{getStatusBadge(ord.status)}</td>
                  <td style={{ padding: '14px 18px', color: 'var(--text-muted, #94a3b8)', fontSize: '0.85rem', fontFamily: "'Hind Siliguri', sans-serif" }}>{ord.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
