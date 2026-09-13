'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Footer() {
  const pathname = usePathname();

  if (pathname.startsWith('/admin') || pathname === '/login') {
    return null;
  }

  return (
    <footer
      style={{
        borderTop: '1px solid var(--border-subtle)',
        background: 'linear-gradient(180deg, rgba(10, 14, 23, 0.9) 0%, rgba(6, 9, 15, 0.98) 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top Accent Gradient Line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, transparent 0%, var(--adm-primary, #e65100) 50%, transparent 100%)',
          opacity: 0.8,
        }}
      />

      <div className="container" style={{ maxWidth: '1240px', margin: '0 auto', padding: '48px 24px 32px' }}>
        {/* 4-Column Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '36px',
            marginBottom: '40px',
          }}
        >
          {/* Col 1: Brand & Overview */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Link
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                textDecoration: 'none',
                color: 'var(--text-primary)',
                fontWeight: 700,
                fontSize: '1.25rem',
              }}
            >
              <span
                style={{
                  background: 'linear-gradient(135deg, #e65100, #ff851b)',
                  borderRadius: '8px',
                  padding: '5px 10px',
                  fontSize: '1rem',
                  color: '#fff',
                  boxShadow: '0 2px 10px rgba(230, 81, 0, 0.4)',
                }}
              >
                ⚡
              </span>
              <span>OmniFlow ERP</span>
            </Link>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.7, margin: 0 }}>
              পরবর্তী প্রজন্মের আধুনিক এন্টারপ্রাইজ ERP ও ই-কমার্স প্ল্যাটফর্ম। উচ্চ-গতি, জিরো-ডাউনটাইম ও শতভাগ বাংলা ইউনিকোড ইঞ্জিনে নির্মিত।
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#10b981',
                  boxShadow: '0 0 8px #10b981',
                }}
              />
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#10b981', fontFamily: "'Inter', sans-serif" }}>
                System 100% Operational (:4000)
              </span>
            </div>
          </div>

          {/* Col 2: Platform Links */}
          <div>
            <h4
              style={{
                fontSize: '0.95rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: '16px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              ইআরপি প্ল্যাটফর্ম
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>
                <Link href="/admin" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}>
                  <i className="fas fa-chart-line me-2" style={{ width: '16px', color: 'var(--adm-primary)' }}></i>
                  অ্যাডমিন ড্যাশবোর্ড
                </Link>
              </li>
              <li>
                <Link href="/admin/orders" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}>
                  <i className="fas fa-shopping-bag me-2" style={{ width: '16px', color: '#f59e0b' }}></i>
                  অর্ডার ও সেলস
                </Link>
              </li>
              <li>
                <Link href="/admin/catalog" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}>
                  <i className="fas fa-boxes me-2" style={{ width: '16px', color: '#10b981' }}></i>
                  ইনভেন্টরি ও ক্যাটালগ
                </Link>
              </li>
              <li>
                <Link href="/admin/users" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}>
                  <i className="fas fa-users-cog me-2" style={{ width: '16px', color: '#0ea5e9' }}></i>
                  ইউজার ও আরব্যাক (RBAC)
                </Link>
              </li>
              <li>
                <Link href="/admin/settings" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}>
                  <i className="fas fa-sliders-h me-2" style={{ width: '16px', color: '#8b5cf6' }}></i>
                  সিস্টেম কনফিগারেশন
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Core Engines */}
          <div>
            <h4
              style={{
                fontSize: '0.95rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: '16px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              কোর আর্কিটেকচার
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>
                <a href="#erp-engines" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>
                  <i className="fas fa-file-pdf me-2" style={{ width: '16px', color: '#ef4444' }}></i>
                  বাংলা ইউনিকোড PDF ইঞ্জিন
                </a>
              </li>
              <li>
                <a href="#erp-engines" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>
                  <i className="fas fa-calculator me-2" style={{ width: '16px', color: '#f59e0b' }}></i>
                  প্রেসিশন মানি ম্যাথ
                </a>
              </li>
              <li>
                <a href="#erp-engines" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>
                  <i className="fas fa-database me-2" style={{ width: '16px', color: '#10b981' }}></i>
                  OmniDB ডুয়াল ডাটাবেজ
                </a>
              </li>
              <li>
                <a href="#erp-engines" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>
                  <i className="fas fa-shield-alt me-2" style={{ width: '16px', color: '#0ea5e9' }}></i>
                  এন্টারপ্রাইজ অডিট ট্রেইল
                </a>
              </li>
              <li>
                <a href="#erp-engines" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>
                  <i className="fas fa-file-excel me-2" style={{ width: '16px', color: '#14b8a6' }}></i>
                  ৫০k+ রো স্ট্রিমিং এক্সপোর্ট
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Developers & APIs */}
          <div>
            <h4
              style={{
                fontSize: '0.95rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: '16px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              ডেভেলপার ও ডক্স
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>
                <a
                  href="http://localhost:4000/api/docs"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}
                >
                  <i className="fas fa-book-open me-2" style={{ width: '16px', color: 'var(--adm-primary)' }}></i>
                  Swagger OpenAPI 3.0 ↗
                </a>
              </li>
              <li>
                <a href="#code-explorer" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>
                  <i className="fas fa-code me-2" style={{ width: '16px', color: '#10b981' }}></i>
                  লাইভ কোড এক্সপ্লোরার
                </a>
              </li>
              <li>
                <Link href="/login" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>
                  <i className="fas fa-key me-2" style={{ width: '16px', color: '#a855f7' }}></i>
                  নিরাপদ স্টাফ লগইন
                </Link>
              </li>
              <li>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <i className="fas fa-layer-group me-2" style={{ width: '16px' }}></i>
                  Turborepo + NestJS 10
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '24px 0' }} />

        {/* Bottom Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
          }}
        >
          <div>
            © 2026 <strong>OmniFlow Framework</strong>. সর্বস্বত্ব সংরক্ষিত। উচ্চ কার্যক্ষমতা ও আধুনিক এন্টারপ্রাইজ স্কেলে নির্মিত।
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', fontFamily: "'Inter', sans-serif" }}>
            <span className="badge badge-purple" style={{ fontSize: '11px', padding: '2px 8px' }}>
              v1.2.0-enterprise
            </span>
            <span>TypeScript Monorepo</span>
            <span>•</span>
            <span style={{ color: '#10b981' }}>● All Services Healthy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
