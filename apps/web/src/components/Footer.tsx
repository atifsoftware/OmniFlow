'use client';

import { usePathname } from 'next/navigation';

export function Footer() {
  const pathname = usePathname();

  if (pathname.startsWith('/admin') || pathname === '/login') {
    return null;
  }

  return (
    <footer style={{
      borderTop: '1px solid var(--border-subtle)',
      padding: '48px 0 32px',
      marginTop: '80px',
      background: 'rgba(10, 14, 23, 0.95)',
    }}>
      <div className="container" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>⚡ OmniFlow Enterprise Full-Stack</span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '600px' }}>
          Unified Monorepo Architecture: NestJS (Core Engine) • Next.js (Web & Admin) • React Native (Expo App) • TypeScript Across the Stack.
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          © 2026 OmniFlow Framework. Built with high performance and modular architecture.
        </p>
      </div>
    </footer>
  );
}
