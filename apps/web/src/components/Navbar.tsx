'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navbar() {
  const pathname = usePathname();

  if (pathname.startsWith('/admin') || pathname === '/login') {
    return null;
  }

  return (
    <header style={{
      borderBottom: '1px solid var(--border-subtle)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'rgba(10, 14, 23, 0.85)',
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '70px',
      }}>
        {/* Logo */}
        <Link href="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          textDecoration: 'none',
          color: 'var(--text-primary)',
          fontWeight: 700,
          fontSize: '1.25rem',
        }}>
          <span style={{
            background: 'linear-gradient(135deg, #06b6d4, #3b82f6, #a855f7)',
            borderRadius: '8px',
            padding: '6px 10px',
            fontSize: '1rem',
            boxShadow: '0 2px 10px rgba(6, 182, 212, 0.3)'
          }}>⚡</span>
          <span>OmniFlow</span>
          <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>Enterprise</span>
        </Link>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', gap: '28px', alignItems: 'center' }}>
          <Link href="/" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 500, fontSize: '0.95rem' }}>
            Storefront
          </Link>
          <Link href="/admin" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500, fontSize: '0.95rem' }}>
            ERP Dashboard
          </Link>
          <a href="http://localhost:4000/api/docs" target="_blank" rel="noreferrer" style={{
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            fontWeight: 500,
            fontSize: '0.95rem',
          }}>
            Swagger Docs ↗
          </a>
        </nav>

        {/* Action Button */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span className="badge badge-green">● Backend Live (:4000)</span>
          <Link href="/admin" className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
            Admin Portal
          </Link>
        </div>
      </div>
    </header>
  );
}
