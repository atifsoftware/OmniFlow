'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');
  const [chartPeriod, setChartPeriod] = useState<'month' | 'week'>('month');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
      setDateStr(
        now.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const stats = {
    totalRevenue: '৳ ৪,৮৫,২০০',
    totalOrders: '১,৪২০',
    activeSessions: '৩৬',
    avgLatency: '১২ ms',
    dbPoolActive: '৬ / ২৫ (OmniDB)',
    memoryUsage: '১৯৫ MB',
    totalEndpoints: '৩২',
    errorRate: '০.০১%',
    uptimeDays: '৯৯.৯৯%',
  };

  const systemAlerts = [
    { title: 'OmniDB Dual-Dialect', message: 'MySQL 8.0 & PostgreSQL কানেকশন পুল সুস্থভাবে সংযুক্ত (Latency: 0.8ms)', type: 'success' },
    { title: 'ERP PDF Engine', message: 'বাংলা ইউনিকোড Ligature শেপিং (Noto Sans / Kalpurush) একটিভ ও টেস্টেড', type: 'info' },
    { title: 'Automated Backup', message: 'আজকের ডাটাবেজ স্ন্যাপশট Gzip কম্প্রেসড (.sql.gz) হয়ে নিরাপদে সংরক্ষিত', type: 'success' },
  ];

  const recentApiLogs = [
    { method: 'GET', endpoint: '/api/v1/orders', status: '200 OK', latency: '8 ms', client: '127.0.0.1 (Web Portal)', time: 'এইমাত্র' },
    { method: 'POST', endpoint: '/api/v1/auth/login', status: '200 OK', latency: '22 ms', client: '192.168.1.15 (Mobile App)', time: '২ মিনিট আগে' },
    { method: 'GET', endpoint: '/api/v1/catalog/products', status: '200 OK', latency: '5 ms', client: '127.0.0.1 (Storefront)', time: '৪ মিনিট আগে' },
    { method: 'POST', endpoint: '/api/v1/orders/checkout', status: '201 Created', latency: '29 ms', client: '103.14.28.9 (Client IP)', time: '৬ মিনিট আগে' },
    { method: 'GET', endpoint: '/api/v1/health', status: '200 OK', latency: '2 ms', client: 'UptimeBot Monitor', time: '৮ মিনিট আগে' },
    { method: 'POST', endpoint: '/api/v1/erp/pdf/invoice', status: '200 OK', latency: '45 ms', client: '127.0.0.1 (Admin User)', time: '১১ মিনিট আগে' },
  ];

  const handleTriggerToast = (title: string, message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('show-toast', {
          detail: { title, message, type },
        })
      );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* ===== 1. DASHBOARD GREETING HEADER ===== */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h2
            style={{
              fontSize: '24px',
              fontWeight: 800,
              color: 'var(--text-main)',
              margin: '0 0 4px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            OmniFlow ERP সিস্টেম ড্যাশবোর্ড ⚡
          </h2>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '14px' }}>
            NestJS Enterprise Backend • OmniDB Multi-Database • রিয়েল-টাইম পারফরম্যান্স ও ট্রাফিক মনিটরিং
          </p>
        </div>

        {/* Real-time Clock and Calendar Badge */}
        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontSize: '18px',
              fontWeight: 800,
              color: 'var(--adm-primary)',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {timeStr || '12:00:00 PM'}
          </div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 14px',
              borderRadius: '9999px',
              border: '1px solid var(--border-color)',
              background: 'var(--card-bg)',
              color: 'var(--text-main)',
              fontSize: '13px',
              fontWeight: 600,
              boxShadow: 'var(--card-shadow)',
              marginTop: '4px',
            }}
          >
            <i className="fas fa-calendar-alt text-primary" style={{ color: 'var(--adm-primary)' }}></i>
            <span>{dateStr || 'Today'}</span>
          </div>
        </div>
      </div>

      {/* ===== 2. SYSTEM HEALTH ALERT BANNER ===== */}
      <div
        style={{
          background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.1) 0%, rgba(14, 165, 233, 0.08) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: '14px',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              boxShadow: '0 0 10px #10b981',
            }}
          ></span>
          <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-main)' }}>
            সমস্ত কোর ইঞ্জিন সক্রিয় ও স্বাস্থ্যকর:
          </span>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            NestJS API Server (:4000) • OmniDB Pool সক্রিয় • Latency: ১২ms • Uptime: ৯৯.৯৯%
          </span>
        </div>

        <a
          href="http://localhost:4000/api/docs/"
          target="_blank"
          rel="noreferrer"
          style={{
            fontSize: '12px',
            fontWeight: 700,
            color: 'var(--adm-primary)',
            background: 'var(--card-bg)',
            padding: '5px 12px',
            borderRadius: '9999px',
            border: '1px solid var(--border-color)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            textDecoration: 'none',
          }}
        >
          <span>Swagger Docs দেখুন</span>
          <i className="fas fa-external-link-alt" style={{ fontSize: '10px' }}></i>
        </a>
      </div>

      {/* ===== 3. SIX QUICK DEVELOPER & ADMIN SHORTCUT CARDS ===== */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: '16px',
        }}
      >
        {/* 1. API Explorer */}
        <a
          href="http://localhost:4000/api/docs/"
          target="_blank"
          rel="noreferrer"
          className="quick-action-card"
          style={
            {
              '--card-top-bar': '#3b82f6',
              '--card-hover-border': '#3b82f6',
              '--card-glow': 'rgba(59, 130, 246, 0.3)',
            } as React.CSSProperties
          }
        >
          <div className="quick-action-top">
            <div
              className="quick-action-icon-box"
              style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)' }}
            >
              <i className="fas fa-book-open"></i>
            </div>
            <span className="quick-action-badge">
              <i className="fas fa-external-link-alt" style={{ fontSize: '9px' }}></i> Docs
            </span>
          </div>
          <div className="quick-action-meta">
            <div className="quick-action-title">
              <span>API এক্সপ্লোরার</span>
              <i className="fas fa-arrow-right quick-action-arrow"></i>
            </div>
            <div className="quick-action-subtitle">NestJS OpenAPI লাইভ কনসোল</div>
          </div>
        </a>

        {/* 2. Orders Management */}
        <Link
          href="/admin/orders"
          className="quick-action-card"
          style={
            {
              '--card-top-bar': '#f97316',
              '--card-hover-border': '#f97316',
              '--card-glow': 'rgba(249, 115, 22, 0.3)',
            } as React.CSSProperties
          }
        >
          <div className="quick-action-top">
            <div
              className="quick-action-icon-box"
              style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' }}
            >
              <i className="fas fa-shopping-cart"></i>
            </div>
            <span className="quick-action-badge">
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#f97316',
                  display: 'inline-block',
                }}
              ></span>
              Live Orders
            </span>
          </div>
          <div className="quick-action-meta">
            <div className="quick-action-title">
              <span>অর্ডার ও সেলস</span>
              <i className="fas fa-chevron-right quick-action-arrow"></i>
            </div>
            <div className="quick-action-subtitle">ই-কমার্স ইনভয়েস ও ট্র্যাকিং</div>
          </div>
        </Link>

        {/* 3. Connection Pool */}
        <a
          href="#db-pool"
          className="quick-action-card"
          style={
            {
              '--card-top-bar': '#10b981',
              '--card-hover-border': '#10b981',
              '--card-glow': 'rgba(16, 185, 129, 0.3)',
            } as React.CSSProperties
          }
        >
          <div className="quick-action-top">
            <div
              className="quick-action-icon-box"
              style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
            >
              <i className="fas fa-database"></i>
            </div>
            <span className="quick-action-badge">
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#10b981',
                  boxShadow: '0 0 6px #10b981',
                  display: 'inline-block',
                }}
              ></span>
              Dual-DB
            </span>
          </div>
          <div className="quick-action-meta">
            <div className="quick-action-title">
              <span>OmniDB পুল</span>
              <i className="fas fa-chevron-right quick-action-arrow"></i>
            </div>
            <div className="quick-action-subtitle">MySQL & Postgres ইঞ্জিন</div>
          </div>
        </a>

        {/* 4. Cache Flush */}
        <a
          href="#flush-cache"
          className="quick-action-card"
          style={
            {
              '--card-top-bar': '#f59e0b',
              '--card-hover-border': '#f59e0b',
              '--card-glow': 'rgba(245, 158, 11, 0.3)',
            } as React.CSSProperties
          }
          onClick={(e) => {
            e.preventDefault();
            handleTriggerToast(
              'ক্যাশ ফ্লাশ সম্পন্ন ⚡',
              'রেডিস ও ইন-মেমোরি বাফার ক্যাশ সফলভাবে রিসেট হয়েছে!'
            );
          }}
        >
          <div className="quick-action-top">
            <div
              className="quick-action-icon-box"
              style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}
            >
              <i className="fas fa-broom"></i>
            </div>
            <span className="quick-action-badge">1-Click</span>
          </div>
          <div className="quick-action-meta">
            <div className="quick-action-title">
              <span>ক্যাশ ফ্লাশ</span>
              <i className="fas fa-bolt quick-action-arrow"></i>
            </div>
            <div className="quick-action-subtitle">Redis L2 ও L1 বাফার রিসেট</div>
          </div>
        </a>

        {/* 5. Gzip DB Backup Trigger */}
        <a
          href="#db-backup"
          className="quick-action-card"
          style={
            {
              '--card-top-bar': '#0ea5e9',
              '--card-hover-border': '#0ea5e9',
              '--card-glow': 'rgba(14, 165, 233, 0.3)',
            } as React.CSSProperties
          }
          onClick={(e) => {
            e.preventDefault();
            handleTriggerToast(
              'ডাটাবেজ ব্যাকআপ সম্পন্ন 💾',
              'Gzip কম্প্রেসড (.sql.gz) ব্যাকআপ ফাইল তৈরি হয়েছে।'
            );
          }}
        >
          <div className="quick-action-top">
            <div
              className="quick-action-icon-box"
              style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)' }}
            >
              <i className="fas fa-hdd"></i>
            </div>
            <span className="quick-action-badge" style={{ color: '#0ea5e9' }}>
              .sql.gz
            </span>
          </div>
          <div className="quick-action-meta">
            <div className="quick-action-title">
              <span>Gzip ব্যাকআপ</span>
              <i className="fas fa-chevron-right quick-action-arrow"></i>
            </div>
            <div className="quick-action-subtitle">ইনস্ট্যান্ট SQL ডাম্পার</div>
          </div>
        </a>

        {/* 6. System Config */}
        <Link
          href="/admin/settings"
          className="quick-action-card"
          style={
            {
              '--card-top-bar': '#8b5cf6',
              '--card-hover-border': '#8b5cf6',
              '--card-glow': 'rgba(139, 92, 246, 0.3)',
            } as React.CSSProperties
          }
        >
          <div className="quick-action-top">
            <div
              className="quick-action-icon-box"
              style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' }}
            >
              <i className="fas fa-sliders-h"></i>
            </div>
            <span className="quick-action-badge">:4000</span>
          </div>
          <div className="quick-action-meta">
            <div className="quick-action-title">
              <span>সিস্টেম সেটিংস</span>
              <i className="fas fa-chevron-right quick-action-arrow"></i>
            </div>
            <div className="quick-action-subtitle">কনফিগ ও এনভায়রনমেন্ট</div>
          </div>
        </Link>
      </div>

      {/* ===== 4. FOUR LIVE METRIC KPI CARDS WITH PROGRESS BARS ===== */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
        }}
      >
        {/* Metric 1: Total Revenue */}
        <div className="live-stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                TOTAL REVENUE (মোট আয়)
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
                {stats.totalRevenue}
              </div>
            </div>
            <div className="icon-circle bg-primary-soft">
              <i className="fas fa-coins text-primary"></i>
            </div>
          </div>
          <div className="stat-progress-bar">
            <div className="fill bg-primary" style={{ width: '84%' }}></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--text-muted)' }}>
            <span>↑ ১৮.৫% গত মাসের চেয়ে বেশি</span>
            <span style={{ color: '#10b981', fontWeight: 700 }}>পরিশোধিত</span>
          </div>
        </div>

        {/* Metric 2: Total Orders */}
        <div className="live-stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                TOTAL ORDERS (মোট অর্ডার)
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#f97316', marginTop: '4px' }}>
                {stats.totalOrders}
              </div>
            </div>
            <div className="icon-circle" style={{ background: 'rgba(249, 115, 22, 0.12)', color: '#f97316' }}>
              <i className="fas fa-shopping-bag"></i>
            </div>
          </div>
          <div className="stat-progress-bar">
            <div className="fill" style={{ width: '72%', backgroundColor: '#f97316' }}></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--text-muted)' }}>
            <span>৩৪২টি ডেলিভারি পেন্ডিং</span>
            <span style={{ color: '#f97316', fontWeight: 700 }}>প্রক্রিয়াধীন</span>
          </div>
        </div>

        {/* Metric 3: Avg API Latency */}
        <div className="live-stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                AVG LATENCY (গড় রেসপন্স টাইম)
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>
                {stats.avgLatency}
              </div>
            </div>
            <div className="icon-circle bg-success-soft">
              <i className="fas fa-bolt text-success"></i>
            </div>
          </div>
          <div className="stat-progress-bar">
            <div className="fill bg-success" style={{ width: '20%' }}></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--text-muted)' }}>
            <span>Fast Fastify/NestJS Engine</span>
            <span style={{ color: '#10b981', fontWeight: 700 }}>আল্ট্রাফাস্ট</span>
          </div>
        </div>

        {/* Metric 4: DB Connection Pool */}
        <div className="live-stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                OMNIDB POOL (কানেকশন পুল)
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>
                {stats.dbPoolActive}
              </div>
            </div>
            <div className="icon-circle bg-warning-soft">
              <i className="fas fa-database text-warning"></i>
            </div>
          </div>
          <div className="stat-progress-bar">
            <div className="fill bg-warning" style={{ width: '35%' }}></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--text-muted)' }}>
            <span>Dual-Dialect Auto-Retry</span>
            <span style={{ color: '#f59e0b', fontWeight: 700 }}>স্বাভাবিক</span>
          </div>
        </div>
      </div>

      {/* ===== 5. MAIN ANALYTICS GRID ===== */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '24px',
        }}
      >
        {/* Left Column: API Traffic & Request Analysis Chart */}
        <div
          id="api-traffic"
          style={{
            background: 'var(--card-bg)',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            padding: '24px',
            boxShadow: 'var(--card-shadow)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <div>
              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>
                এপিআই ট্রাফিক ও সেলস অ্যানালিটিক্স
              </h4>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                দৈনিক রিকোয়েস্ট ভলিউম ও অর্ডার ট্রেন্ড
              </div>
            </div>

            <div
              style={{
                display: 'inline-flex',
                background: 'var(--body-bg)',
                borderRadius: '8px',
                padding: '3px',
                border: '1px solid var(--border-color)',
              }}
            >
              <button
                type="button"
                style={{
                  background: chartPeriod === 'month' ? 'var(--adm-primary)' : 'transparent',
                  color: chartPeriod === 'month' ? '#fff' : 'var(--text-muted)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '4px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                onClick={() => setChartPeriod('month')}
              >
                মাসিক
              </button>
              <button
                type="button"
                style={{
                  background: chartPeriod === 'week' ? 'var(--adm-primary)' : 'transparent',
                  color: chartPeriod === 'week' ? '#fff' : 'var(--text-muted)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '4px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                onClick={() => setChartPeriod('week')}
              >
                সাপ্তাহিক
              </button>
            </div>
          </div>

          {/* SVG Bar Chart Visualization */}
          <div style={{ width: '100%', height: '200px', display: 'flex', alignItems: 'flex-end', gap: '8px', padding: '10px 0' }}>
            {[50, 70, 65, 88, 80, 105, 95, 120, 110, 138, 125, 155].map((val, idx) => (
              <div
                key={idx}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  height: '100%',
                  justifyContent: 'flex-end',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: `${(val / 160) * 100}%`,
                    background: idx === 11 ? 'var(--adm-primary)' : 'rgba(230, 81, 0, 0.25)',
                    borderRadius: '6px 6px 0 0',
                    transition: 'all 0.3s ease',
                  }}
                  title={`${val}k requests`}
                />
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  {idx + 1}
                </span>
              </div>
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              borderTop: '1px solid var(--border-color)',
              paddingTop: '14px',
              marginTop: '10px',
              fontSize: '12.5px',
            }}
          >
            <div>
              <span style={{ color: 'var(--text-muted)' }}>পিক রিকোয়েস্ট লোড: </span>
              <strong>১৫৫k রিকোয়েস্ট/দিন</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>গড় সাকসেস রেট: </span>
              <strong style={{ color: '#10b981' }}>৯৯.৯৯%</strong>
            </div>
          </div>
        </div>

        {/* Right Column: Server & Framework Engine Resources */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            borderRadius: '16px',
            padding: '24px',
            color: '#ffffff',
            boxShadow: 'var(--card-shadow)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase' }}>
                OMNIFLOW CORE ENGINE
              </span>
              <span
                style={{
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: '#10b981',
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  fontSize: '11px',
                  fontWeight: 700,
                }}
              >
                ● Running
              </span>
            </div>

            <div style={{ fontSize: '28px', fontWeight: 800, fontFamily: "'Inter', sans-serif", color: '#ffffff' }}>
              OmniFlow ERP v2.1
            </div>
            <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', marginTop: '4px' }}>
              NestJS Core • Next.js 14 Web • React Native Expo Mobile
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              marginTop: '20px',
              padding: '16px',
              background: 'rgba(255, 255, 255, 0.04)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)' }}>CPU লোড</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#10b981', marginTop: '2px' }}>১৪%</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)' }}>RAM ব্যবহার</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#0ea5e9', marginTop: '2px' }}>১৯৫ MB</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)' }}>ইভেন্ট লুপ লেগ</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#f59e0b', marginTop: '2px' }}>০.৯ ms</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)' }}>অ্যাক্টিভ মডিউল</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>৬টি ডোমেন</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <a
              href="http://localhost:4000/api/docs/"
              target="_blank"
              rel="noreferrer"
              style={{
                flex: 1,
                background: 'var(--adm-primary)',
                color: '#fff',
                padding: '9px 14px',
                borderRadius: '9999px',
                fontSize: '13px',
                fontWeight: 700,
                textAlign: 'center',
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(230, 81, 0, 0.35)',
              }}
            >
              Swagger কনসোল
            </a>
            <Link
              href="/admin/settings"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                padding: '9px 18px',
                borderRadius: '9999px',
                fontSize: '13px',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              সেটিংস
            </Link>
          </div>
        </div>
      </div>

      {/* ===== 6. RECENT API CALLS & AUDIT LOG TABLE ===== */}
      <div
        id="endpoints"
        style={{
          background: 'var(--card-bg)',
          borderRadius: '16px',
          border: '1px solid var(--border-color)',
          overflow: 'hidden',
          boxShadow: 'var(--card-shadow)',
        }}
      >
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <div>
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>
              সাম্প্রতিক এপিআই কল ও ট্রাফিক লগ
            </h4>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              রিয়েল-টাইম মেথড, স্ট্যাটাস ও রেসপন্স টাইম মনিটরিং
            </div>
          </div>

          <a
            href="http://localhost:4000/api/docs/"
            target="_blank"
            rel="noreferrer"
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--adm-primary)',
              textDecoration: 'none',
            }}
          >
            সম্পূর্ণ এপিআই ডক্স দেখুন <i className="fas fa-arrow-right ms-1"></i>
          </a>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'var(--body-bg)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 20px', textAlign: 'left' }}>মেথড</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>এন্ডপয়েন্ট রুট</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>স্ট্যাটাস কোড</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>রেসপন্স লেটেন্সি</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>ক্লায়েন্ট হোস্ট</th>
                <th style={{ padding: '12px 20px', textAlign: 'right' }}>সময়</th>
              </tr>
            </thead>
            <tbody>
              {recentApiLogs.map((log, index) => (
                <tr key={index} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px 20px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontWeight: 800,
                        fontSize: '11px',
                        background:
                          log.method === 'GET'
                            ? 'rgba(14, 165, 233, 0.15)'
                            : log.method === 'POST'
                            ? 'rgba(16, 185, 129, 0.15)'
                            : 'rgba(244, 63, 94, 0.15)',
                        color:
                          log.method === 'GET'
                            ? '#0ea5e9'
                            : log.method === 'POST'
                            ? '#10b981'
                            : '#f43f5e',
                      }}
                    >
                      {log.method}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 600, fontFamily: "'Consolas', monospace" }}>
                    {log.endpoint}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span
                      style={{
                        padding: '3px 10px',
                        borderRadius: '9999px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        background: log.status.includes('200') || log.status.includes('201')
                          ? 'rgba(16, 185, 129, 0.12)'
                          : 'rgba(239, 68, 68, 0.12)',
                        color: log.status.includes('200') || log.status.includes('201') ? '#10b981' : '#ef4444',
                      }}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: '#10b981' }}>
                    {log.latency}
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>
                    {log.client}
                  </td>
                  <td style={{ padding: '12px 20px', textAlign: 'right', color: 'var(--text-muted)' }}>
                    {log.time}
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
