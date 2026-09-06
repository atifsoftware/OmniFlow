'use client';

import { useState } from 'react';

export default function AdminSettingsPage() {
  const [appName, setAppName] = useState('OmniFlow ERP');
  const [currency, setCurrency] = useState('BDT (৳)');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h2
          style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            fontFamily: "'Hind Siliguri', sans-serif",
            color: 'var(--text-main, #f8fafc)',
            margin: '0 0 4px 0',
          }}
        >
          সিস্টেম সেটিংস ও কনফিগারেশন
        </h2>
        <p
          style={{
            color: 'var(--text-muted, #94a3b8)',
            fontSize: '0.9rem',
            fontFamily: "'Hind Siliguri', sans-serif",
            margin: 0,
          }}
        >
          গ্লোবাল ERP ভ্যারিয়েবল, ডাটাবেজ ব্যাকআপ ও পরিবেশ নিয়ন্ত্রণ
        </p>
      </div>

      {saved && (
        <div
          style={{
            borderRadius: '12px',
            fontSize: '0.9rem',
            fontFamily: "'Hind Siliguri', sans-serif",
            borderLeft: '4px solid #10b981',
            background: 'rgba(16, 185, 129, 0.12)',
            color: '#10b981',
            padding: '0.85rem 1rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <i className="fas fa-check-circle"></i>
          <span>সেটিংস সফলভাবে সংরক্ষিত হয়েছে!</span>
        </div>
      )}

      <div
        className="card"
        style={{
          padding: '2rem',
          borderRadius: '18px',
          background: 'var(--bg-card, rgba(30, 41, 59, 0.7))',
          border: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
          maxWidth: '680px',
        }}
      >
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ color: 'var(--text-main, #f8fafc)', fontWeight: 600, fontSize: '0.9rem', fontFamily: "'Hind Siliguri', sans-serif" }}>
              অ্যাপ্লিকেশনের নাম
            </label>
            <input
              type="text"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              style={{
                background: 'var(--input-bg, rgba(15, 23, 42, 0.6))',
                border: '1px solid var(--input-border, rgba(255, 255, 255, 0.1))',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                color: 'var(--text-main, white)',
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.95rem',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ color: 'var(--text-main, #f8fafc)', fontWeight: 600, fontSize: '0.9rem', fontFamily: "'Hind Siliguri', sans-serif" }}>
              ডিফল্ট কারেন্সি
            </label>
            <input
              type="text"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              style={{
                background: 'var(--input-bg, rgba(15, 23, 42, 0.6))',
                border: '1px solid var(--input-border, rgba(255, 255, 255, 0.1))',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                color: 'var(--text-main, white)',
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.95rem',
                outline: 'none',
              }}
            />
          </div>

          <button
            type="submit"
            className="btn-gradient-primary"
            style={{
              padding: '0.75rem 1.5rem',
              alignSelf: 'flex-start',
              fontFamily: "'Hind Siliguri', sans-serif",
              fontSize: '0.95rem',
              cursor: 'pointer',
              marginTop: '0.5rem',
            }}
          >
            <i className="fas fa-save me-2"></i> পরিবর্তন সংরক্ষণ করুন
          </button>
        </form>
      </div>
    </div>
  );
}
