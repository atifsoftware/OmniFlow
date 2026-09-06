'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    try {
      const savedTheme = (localStorage.getItem('admin-theme') as 'dark' | 'light') || 'dark';
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } catch {}
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    try {
      localStorage.setItem('admin-theme', nextTheme);
    } catch {}
  };

  const closeSidebar = () => setMobileOpen(false);
  const toggleSidebar = () => setMobileOpen(!mobileOpen);

  const navItems = [
    { label: 'হোম / ড্যাশবোর্ড', href: '/admin', icon: 'fas fa-th-large' },
    { label: 'ইউজার ব্যবস্থাপনা', href: '/admin/users', icon: 'fas fa-users' },
    { label: 'অর্ডার ও বিক্রয়', href: '/admin/orders', icon: 'fas fa-shopping-cart' },
    { label: 'পণ্য ও ক্যাটালগ', href: '/admin/catalog', icon: 'fas fa-boxes' },
    { label: 'সিস্টেম সেটিংস', href: '/admin/settings', icon: 'fas fa-cog' },
  ];

  const getPageTitle = () => {
    if (pathname === '/admin/users') return 'ইউজার ব্যবস্থাপনা';
    if (pathname === '/admin/orders') return 'অর্ডার ও বিক্রয়';
    if (pathname === '/admin/catalog') return 'পণ্য ও ক্যাটালগ';
    if (pathname === '/admin/settings') return 'সিস্টেম সেটিংস';
    return 'ড্যাশবোর্ড';
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      {/* Sidebar Overlay (Mobile) */}
      <div
        className={`adm-overlay ${mobileOpen ? 'open' : ''}`}
        onClick={closeSidebar}
      />

      {/* ===== SIDEBAR ===== */}
      <aside className={`adm-sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="adm-brand">
          <Link href="/admin" style={{ textDecoration: 'none' }}>
            <div className="brand-logo" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img
                src="/images/logo.png"
                alt="OmniFlow Logo"
                style={{
                  height: '38px',
                  width: '38px',
                  objectFit: 'cover',
                  borderRadius: '10px',
                  boxShadow: '0 0 15px rgba(14, 165, 233, 0.4)',
                  border: '1px solid rgba(14, 165, 233, 0.3)',
                }}
              />
              <div className="brand-text">
                <div
                  className="brand-name"
                  style={{
                    fontSize: '20px',
                    fontWeight: 800,
                    color: 'var(--text-sidebar-main, #f8fafc)',
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  OmniFlow<span style={{ color: '#0ea5e9' }}>.js</span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* User Profile (Top) */}
        <div className="sidebar-profile">
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar">A</div>
            <div className="status-dot"></div>
          </div>
          <div className="profile-details">
            <div className="profile-name">Admin User</div>
            <div className="profile-status">
              <i className="fas fa-circle" style={{ fontSize: '6px', color: '#10b981' }}></i> Online
            </div>
          </div>
        </div>

        {/* Nav Sections */}
        <nav className="adm-nav">
          <div className="nav-section">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeSidebar}
                  className={`nav-link-item ${isActive ? 'active' : ''}`}
                >
                  <div className="nav-icon">
                    <i className={item.icon}></i>
                  </div>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Links & Logout */}
          <div className="nav-section">
            <Link href="/" className="nav-link-item">
              <div className="nav-icon">
                <i className="fas fa-home"></i>
              </div>
              <span>ওয়েবসাইট হোম</span>
            </Link>
            <a
              href="http://localhost:4000/api/docs"
              target="_blank"
              rel="noreferrer"
              className="nav-link-item"
            >
              <div className="nav-icon">
                <i className="fas fa-book-open"></i>
              </div>
              <span>ডকুমেন্টেশন</span>
            </a>
            <Link href="/login" className="nav-link-item">
              <div className="nav-icon">
                <i className="fas fa-sign-out-alt"></i>
              </div>
              <span>লগআউট</span>
            </Link>
          </div>
        </nav>

        {/* Sidebar Footer Actions */}
        <div className="sidebar-footer-actions">
          <Link href="/login" className="footer-action-link" title="লগআউট">
            <i className="fas fa-power-off me-1"></i> লগআউট
          </Link>
        </div>
      </aside>

      {/* ===== TOPBAR ===== */}
      <header className="adm-topbar">
        <button className="topbar-toggle" onClick={toggleSidebar} aria-label="Toggle Navigation">
          <i className="fas fa-bars"></i>
        </button>

        <div className="breadcrumb-adm d-flex align-items-center gap-2">
          <img
            src="/images/logo.png"
            alt="Icon"
            style={{ width: '24px', height: '24px', borderRadius: '6px', objectFit: 'cover' }}
          />
          <Link href="/admin" style={{ color: '#94a3b8', textDecoration: 'none' }}>
            Admin
          </Link>
          <i className="fas fa-chevron-right" style={{ fontSize: '10px', margin: '0 4px' }}></i>
          <strong>{getPageTitle()}</strong>
        </div>

        <div className="topbar-actions">
          {/* Light / Dark Theme Toggle Button */}
          <button
            id="themeToggleBtn"
            className="topbar-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'লাইট মোডে পরিবর্তন করুন' : 'ডার্ক মোডে পরিবর্তন করুন'}
          >
            <i className={theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon'}></i>
          </button>
          <div className="topbar-divider"></div>
          <Link href="/" className="topbar-site-link">
            <i className="fas fa-external-link-alt"></i>
            <span>সাইট দেখুন</span>
          </Link>
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="adm-content">
        <div className="adm-page">{children}</div>
      </main>
    </div>
  );
}
