'use client';

import { useState } from 'react';

export default function AdminDashboardPage() {
  const [stats] = useState({
    usersCount: '১,২৮০',
    activeOrders: '৩৪২',
    totalRevenue: '৳ ৪,৮৫,২০০',
    osType: 'Windows NT (10.0.26100)',
    cpuModel: 'AMD Ryzen / Intel Core (Multi-Core)',
    cpuCores: '8 Cores (PM2 Cluster)',
    memoryUsage: '৬৬.৪ MB / ৮.০ GB',
    uptime: '৭ দিন ১৪ ঘণ্টা ২৩ মিনিট',
    nodeVersion: 'v20.14.0 LTS',
  });

  const [logs] = useState([
    {
      id: 1,
      userName: 'Admin User',
      action: 'অর্ডার অনুমোদন',
      description: 'অর্ডার #ORD-9021 সফলভাবে পরিশোধিত ও অনুমোদিত হয়েছে।',
      time: 'এইমাত্র',
    },
    {
      id: 2,
      userName: 'Sadia Rahman',
      action: 'নতুন রেজিস্ট্রেশন',
      description: 'নতুন গ্রাহক একাউন্ট নিবন্ধিত ও ওটিপি যাচাই সম্পন্ন হয়েছে।',
      time: '১২ মিনিট আগে',
    },
    {
      id: 3,
      userName: 'System Queue',
      action: 'ক্যাশ ইনভ্যালিডেশন',
      description: 'রেডিস L2 ক্যাশ এবং ইন-মেমোরি L1 বাফার স্বয়ংক্রিয় রিফ্রেশ সম্পন্ন।',
      time: '২৮ মিনিট আগে',
    },
    {
      id: 4,
      userName: 'Tanvir Ahmed',
      action: 'ইনভেন্টরি স্টক আপডেট',
      description: 'প্রোডাক্ট SKU-402 এর ৫০ ইউনিট ইনভেন্টরি রিস্টক করা হয়েছে।',
      time: '৪৫ মিনিট আগে',
    },
    {
      id: 5,
      userName: 'OmniDB Engine',
      action: 'ডাটাবেজ হেলথ চেক',
      description: 'MariaDB 10.11 কানেকশন পুল পিং সম্পন্ন (Latency: 0.8ms)।',
      time: '১ ঘণ্টা আগে',
    },
  ]);

  return (
    <div>
      {/* Top 3 KPI Stats Widgets */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          marginBottom: '1.75rem',
        }}
      >
        {/* Users Widget */}
        <div
          className="card"
          style={{
            padding: '1.5rem',
            background: 'var(--bg-card, rgba(30, 41, 59, 0.7))',
            border: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
            borderRadius: '18px',
            boxShadow: 'var(--shadow-premium, 0 15px 35px rgba(0, 0, 0, 0.3))',
            transition: 'transform 0.25s ease, box-shadow 0.25s ease',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h5 style={{ color: 'var(--text-muted, #94a3b8)', margin: 0, fontFamily: "'Hind Siliguri', sans-serif", fontWeight: 600, fontSize: '1.05rem' }}>
              মোট ব্যবহারকারী
            </h5>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'rgba(14, 165, 233, 0.15)',
                color: '#0ea5e9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
              }}
            >
              <i className="fas fa-users"></i>
            </div>
          </div>
          <h2 style={{ color: 'var(--text-main, #f8fafc)', fontWeight: 800, fontFamily: "'Inter', sans-serif", margin: 0, fontSize: '2rem' }}>
            {stats.usersCount}
          </h2>
          <p style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.82rem', margin: '6px 0 0 0', fontFamily: "'Hind Siliguri', sans-serif" }}>
            সিস্টেমে নিবন্ধিত মোট সক্রিয় অ্যাকাউন্টস
          </p>
        </div>

        {/* Orders Widget */}
        <div
          className="card"
          style={{
            padding: '1.5rem',
            background: 'var(--bg-card, rgba(30, 41, 59, 0.7))',
            border: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
            borderRadius: '18px',
            boxShadow: 'var(--shadow-premium, 0 15px 35px rgba(0, 0, 0, 0.3))',
            transition: 'transform 0.25s ease, box-shadow 0.25s ease',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h5 style={{ color: 'var(--text-muted, #94a3b8)', margin: 0, fontFamily: "'Hind Siliguri', sans-serif", fontWeight: 600, fontSize: '1.05rem' }}>
              সক্রিয় অর্ডার ও ট্রানজ্যাকশন
            </h5>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
              }}
            >
              <i className="fas fa-shopping-cart"></i>
            </div>
          </div>
          <h2 style={{ color: 'var(--text-main, #f8fafc)', fontWeight: 800, fontFamily: "'Inter', sans-serif", margin: 0, fontSize: '2rem' }}>
            {stats.activeOrders}
          </h2>
          <p style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.82rem', margin: '6px 0 0 0', fontFamily: "'Hind Siliguri', sans-serif" }}>
            চলতি মাসের সফলভাবে গৃহীত অর্ডার সংখ্যা
          </p>
        </div>

        {/* Revenue Widget */}
        <div
          className="card"
          style={{
            padding: '1.5rem',
            background: 'var(--bg-card, rgba(30, 41, 59, 0.7))',
            border: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
            borderRadius: '18px',
            boxShadow: 'var(--shadow-premium, 0 15px 35px rgba(0, 0, 0, 0.3))',
            transition: 'transform 0.25s ease, box-shadow 0.25s ease',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h5 style={{ color: 'var(--text-muted, #94a3b8)', margin: 0, fontFamily: "'Hind Siliguri', sans-serif", fontWeight: 600, fontSize: '1.05rem' }}>
              মোট রেভিনিউ ও আয়
            </h5>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'rgba(245, 158, 11, 0.15)',
                color: '#f59e0b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
              }}
            >
              <i className="fas fa-chart-line"></i>
            </div>
          </div>
          <h2 style={{ color: 'var(--text-main, #f8fafc)', fontWeight: 800, fontFamily: "'Inter', sans-serif", margin: 0, fontSize: '2rem' }}>
            {stats.totalRevenue}
          </h2>
          <p style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.82rem', margin: '6px 0 0 0', fontFamily: "'Hind Siliguri', sans-serif" }}>
            মোট বিক্রিত পণ্যের নেট টার্নওভার
          </p>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Left Column: Server Environment Diagnostic */}
        <div
          className="card"
          style={{
            padding: '1.75rem',
            background: 'var(--bg-card, rgba(30, 41, 59, 0.7))',
            border: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
            borderRadius: '18px',
            boxShadow: 'var(--shadow-premium, 0 15px 35px rgba(0, 0, 0, 0.3))',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
              paddingBottom: '0.85rem',
              marginBottom: '1.25rem',
            }}
          >
            <h4
              style={{
                color: '#0ea5e9',
                fontWeight: 700,
                fontSize: '1.15rem',
                fontFamily: "'Hind Siliguri', sans-serif",
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <i className="fas fa-server"></i> সার্ভার এনভায়রনমেন্ট ডায়াগনস্টিক
            </h4>
            <span
              style={{
                background: 'rgba(14, 165, 233, 0.15)',
                color: '#0ea5e9',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.4rem 0.8rem',
                borderRadius: '20px',
              }}
            >
              System Health
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem 1rem',
                background: 'var(--bg-secondary, rgba(30, 41, 59, 0.45))',
                borderRadius: '12px',
                border: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
              }}
            >
              <span style={{ fontFamily: "'Hind Siliguri', sans-serif", fontWeight: 600, color: 'var(--text-muted, #94a3b8)', fontSize: '0.9rem' }}>
                <i className="fas fa-desktop" style={{ color: '#38bdf8', marginRight: '8px' }}></i> অপারেটিং সিস্টেম
              </span>
              <span style={{ fontWeight: 700, color: 'var(--text-main, #f8fafc)', fontFamily: "'Inter', sans-serif", fontSize: '0.9rem' }}>
                {stats.osType}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem 1rem',
                background: 'var(--bg-secondary, rgba(30, 41, 59, 0.45))',
                borderRadius: '12px',
                border: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
              }}
            >
              <span style={{ fontFamily: "'Hind Siliguri', sans-serif", fontWeight: 600, color: 'var(--text-muted, #94a3b8)', fontSize: '0.9rem' }}>
                <i className="fas fa-microchip" style={{ color: '#a855f7', marginRight: '8px' }}></i> সিপিইউ মডেল
              </span>
              <span
                style={{
                  fontWeight: 700,
                  color: 'var(--text-main, #f8fafc)',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.85rem',
                  maxWidth: '220px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {stats.cpuModel}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem 1rem',
                background: 'var(--bg-secondary, rgba(30, 41, 59, 0.45))',
                borderRadius: '12px',
                border: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
              }}
            >
              <span style={{ fontFamily: "'Hind Siliguri', sans-serif", fontWeight: 600, color: 'var(--text-muted, #94a3b8)', fontSize: '0.9rem' }}>
                <i className="fas fa-brain" style={{ color: '#f43f5e', marginRight: '8px' }}></i> সিপিইউ কোর সংখ্যা
              </span>
              <span style={{ fontWeight: 700, color: 'var(--text-main, #f8fafc)', fontFamily: "'Inter', sans-serif", fontSize: '0.9rem' }}>
                {stats.cpuCores}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem 1rem',
                background: 'var(--bg-secondary, rgba(30, 41, 59, 0.45))',
                borderRadius: '12px',
                border: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
              }}
            >
              <span style={{ fontFamily: "'Hind Siliguri', sans-serif", fontWeight: 600, color: 'var(--text-muted, #94a3b8)', fontSize: '0.9rem' }}>
                <i className="fas fa-memory" style={{ color: '#eab308', marginRight: '8px' }}></i> মেমরি ব্যবহার
              </span>
              <span style={{ fontWeight: 700, color: 'var(--text-main, #f8fafc)', fontFamily: "'Inter', sans-serif", fontSize: '0.9rem' }}>
                {stats.memoryUsage}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem 1rem',
                background: 'var(--bg-secondary, rgba(30, 41, 59, 0.45))',
                borderRadius: '12px',
                border: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
              }}
            >
              <span style={{ fontFamily: "'Hind Siliguri', sans-serif", fontWeight: 600, color: 'var(--text-muted, #94a3b8)', fontSize: '0.9rem' }}>
                <i className="fas fa-stopwatch" style={{ color: '#10b981', marginRight: '8px' }}></i> সার্ভার আপটাইম
              </span>
              <span style={{ fontWeight: 700, color: 'var(--text-main, #f8fafc)', fontFamily: "'Inter', sans-serif", fontSize: '0.9rem' }}>
                {stats.uptime}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem 1rem',
                background: 'var(--bg-secondary, rgba(30, 41, 59, 0.45))',
                borderRadius: '12px',
                border: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
              }}
            >
              <span style={{ fontFamily: "'Hind Siliguri', sans-serif", fontWeight: 600, color: 'var(--text-muted, #94a3b8)', fontSize: '0.9rem' }}>
                <i className="fab fa-node-js" style={{ color: '#22c55e', marginRight: '8px' }}></i> Node.js ভার্সন
              </span>
              <span style={{ fontWeight: 700, color: '#10b981', fontFamily: "'Inter', sans-serif", fontSize: '0.9rem' }}>
                {stats.nodeVersion}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Activity Logs */}
        <div
          className="card"
          style={{
            padding: '1.75rem',
            background: 'var(--bg-card, rgba(30, 41, 59, 0.7))',
            border: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
            borderRadius: '18px',
            boxShadow: 'var(--shadow-premium, 0 15px 35px rgba(0, 0, 0, 0.3))',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
              paddingBottom: '0.85rem',
              marginBottom: '1.25rem',
            }}
          >
            <h4
              style={{
                color: '#10b981',
                fontWeight: 700,
                fontSize: '1.15rem',
                fontFamily: "'Hind Siliguri', sans-serif",
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <i className="fas fa-list-ul"></i> সাম্প্রতিক অ্যাক্টিভিটি লগস
            </h4>
            <span
              style={{
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.4rem 0.8rem',
                borderRadius: '20px',
              }}
            >
              Real-time
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {logs.map((log) => (
              <div
                key={log.id}
                style={{
                  padding: '0.9rem 1rem',
                  background: 'var(--bg-secondary, rgba(30, 41, 59, 0.45))',
                  border: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
                  borderRadius: '12px',
                  transition: 'background-color 0.2s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <strong style={{ color: 'var(--text-main, #f8fafc)', fontSize: '0.9rem', fontFamily: "'Hind Siliguri', sans-serif", fontWeight: 700 }}>
                    {log.userName}
                  </strong>
                  <small style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.75rem', fontWeight: 600 }}>
                    {log.time}
                  </small>
                </div>
                <div style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.85rem', fontFamily: "'Hind Siliguri', sans-serif" }}>
                  <span style={{ color: '#38bdf8', fontWeight: 600, marginRight: '6px' }}>[{log.action}]</span>
                  {log.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
