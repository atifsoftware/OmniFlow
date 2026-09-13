'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export interface ToastItem {
  id: string;
  type: 'success' | 'danger' | 'info' | 'warning' | 'secondary';
  title: string;
  message: string;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [user, setUser] = useState<{ name?: string; role?: string } | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    api: true,
    ecommerce: true,
    db: false,
    users: false,
    erp: false,
    security: false,
    logs: false,
    settings: false,
  });
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [lang, setLang] = useState<'bn' | 'en'>('bn');

  useEffect(() => {
    // Theme initialization (Light is default in Nursery ERP design)
    const savedTheme = (localStorage.getItem('admin-theme') as 'light' | 'dark') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Load logged in user
    try {
      const stored = localStorage.getItem('omniflow_user');
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        setUser({ name: 'OmniFlow Admin', role: 'Super Admin' });
      }
    } catch (e) {
      setUser({ name: 'OmniFlow Admin', role: 'Super Admin' });
    }

    // Global toast listener
    const handleToastEvent = (e: any) => {
      const { type, title, message } = e.detail || {};
      const id = Date.now().toString() + Math.random().toString();
      const newToast: ToastItem = {
        id,
        type: type || 'info',
        title: title || 'বিজ্ঞপ্তি',
        message: message || '',
      };
      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    };

    window.addEventListener('show-toast' as any, handleToastEvent);
    return () => {
      window.removeEventListener('show-toast' as any, handleToastEvent);
    };
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('admin-theme', nextTheme);
  };

  const toggleSection = (sec: string) => {
    setExpandedSections((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('omniflow_token');
      localStorage.removeItem('omniflow_user');
    } catch (e) {}
    router.push('/login');
  };

  // Determine current page title for breadcrumb
  let pageTitle = 'সিস্টেম ড্যাশবোর্ড';
  if (pathname === '/admin/users') pageTitle = 'ইউজার ও রোল ব্যবস্থাপনা';
  else if (pathname === '/admin/settings') pageTitle = 'সিস্টেম সেটিংস';
  else if (pathname === '/admin/orders') pageTitle = 'অর্ডার ও বিক্রয় ব্যবস্থাপনা';
  else if (pathname === '/admin/catalog') pageTitle = 'পণ্য ও ক্যাটালগ ইনভেন্টরি';

  return (
    <div className="adm-layout">
      {/* Mobile Sidebar Overlay */}
      <div
        className={`adm-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* ===== SIDEBAR (EXACT AEROMVC / NURSERY ERP STYLING) ===== */}
      <aside className={`adm-sidebar ${sidebarOpen ? 'open' : ''}`} id="admSidebar">
        {/* Brand Header */}
        <div className="adm-brand">
          <Link href="/admin" className="text-decoration-none">
            <div className="brand-logo">
              <div
                className="brand-logo-img-wrapper"
                style={{ overflow: 'hidden', borderRadius: '10px', background: '#0f172a' }}
              >
                <div
                  className="brand-logo-icon"
                  style={{
                    width: '32px',
                    height: '32px',
                    fontSize: '15px',
                    background: 'linear-gradient(135deg, #e65100, #ff6d00)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                  }}
                >
                  <i className="fas fa-cubes"></i>
                </div>
              </div>
              <div className="brand-text text-start">
                <div className="brand-name">
                  OmniFlow <span style={{ color: '#ffcc02' }}>ERP</span>
                </div>
                <div className="brand-sub">Enterprise Control Hub</div>
              </div>
            </div>
          </Link>
        </div>

        {/* User Profile (Top Aligned) */}
        <div className="sidebar-profile">
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'O'}
            </div>
            <div className="status-dot"></div>
          </div>
          <div className="profile-details">
            <div className="profile-name">{user?.name || 'OmniFlow Admin'}</div>
            <div className="profile-status">
              <i className="fas fa-circle" style={{ fontSize: '7px', color: '#2eb85c' }}></i>{' '}
              <span>সিস্টেম অনলাইন</span>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="adm-nav">
          <div className="nav-links">
            {/* 1. Dashboard */}
            <Link
              href="/admin"
              className={`nav-link-item ${pathname === '/admin' ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <div className="nav-icon icon-dashboard">
                <i className="fas fa-tachometer-alt"></i>
              </div>
              <span>সিস্টেম ড্যাশবোর্ড</span>
            </Link>

            {/* 2. E-Commerce & Sales (Collapsible) */}
            <div className={`nav-section ${expandedSections.ecommerce ? 'expanded' : ''}`}>
              <div className="nav-link-item" onClick={() => toggleSection('ecommerce')}>
                <div
                  className="nav-icon"
                  style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', color: '#ffffff' }}
                >
                  <i className="fas fa-shopping-bag"></i>
                </div>
                <span>ই-কমার্স ও সেলস</span>
                <div className="submenu-arrow">
                  <i className="fas fa-chevron-left"></i>
                </div>
              </div>
              <div className="nav-submenu">
                <Link
                  href="/admin/orders"
                  className={`nav-sub-item ${pathname === '/admin/orders' ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <i className="fas fa-shopping-cart text-warning"></i>
                  <span>অর্ডার তালিকা</span>
                </Link>
                <Link
                  href="/admin/catalog"
                  className={`nav-sub-item ${pathname === '/admin/catalog' ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <i className="fas fa-boxes text-info"></i>
                  <span>পণ্য ও ক্যাটালগ</span>
                </Link>
                <Link
                  href="/admin#pos-terminal"
                  className="nav-sub-item"
                  onClick={() => setSidebarOpen(false)}
                >
                  <i className="fas fa-cash-register text-success"></i>
                  <span>পিওএস (POS) টার্মিনাল</span>
                </Link>
              </div>
            </div>

            {/* 3. API & Routing Engine (Collapsible) */}
            <div className={`nav-section ${expandedSections.api ? 'expanded' : ''}`}>
              <div className="nav-link-item" onClick={() => toggleSection('api')}>
                <div
                  className="nav-icon"
                  style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: '#ffffff' }}
                >
                  <i className="fas fa-network-wired"></i>
                </div>
                <span>এপিআই ও রাউটিং</span>
                <div className="submenu-arrow">
                  <i className="fas fa-chevron-left"></i>
                </div>
              </div>
              <div className="nav-submenu">
                <Link
                  href="/admin#api-traffic"
                  className={`nav-sub-item ${pathname === '/admin' ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <i className="fas fa-chart-line text-primary"></i>
                  <span>রিকোয়েস্ট ট্রাফিক</span>
                </Link>
                <Link href="/admin#endpoints" className="nav-sub-item" onClick={() => setSidebarOpen(false)}>
                  <i className="fas fa-link text-info"></i>
                  <span>অ্যান্ডপয়েন্ট তালিকা</span>
                </Link>
                <a href="http://localhost:4000/api/docs/" target="_blank" rel="noreferrer" className="nav-sub-item">
                  <i className="fas fa-book-open text-success"></i>
                  <span>NestJS / Swagger ডক্স</span>
                </a>
              </div>
            </div>

            {/* 4. Database & OmniDB Pool (Collapsible) */}
            <div className={`nav-section ${expandedSections.db ? 'expanded' : ''}`}>
              <div className="nav-link-item" onClick={() => toggleSection('db')}>
                <div
                  className="nav-icon"
                  style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: '#ffffff' }}
                >
                  <i className="fas fa-database"></i>
                </div>
                <span>ডেটাবেজ ও OmniDB পুল</span>
                <div className="submenu-arrow">
                  <i className="fas fa-chevron-left"></i>
                </div>
              </div>
              <div className="nav-submenu">
                <Link href="/admin#db-pool" className="nav-sub-item" onClick={() => setSidebarOpen(false)}>
                  <i className="fas fa-server text-success"></i>
                  <span>MySQL / Postgres পুল</span>
                </Link>
                <Link href="/admin#db-tables" className="nav-sub-item" onClick={() => setSidebarOpen(false)}>
                  <i className="fas fa-table text-primary"></i>
                  <span>টেবিল ও স্কিমা তালিকা</span>
                </Link>
                <Link href="/admin#slow-queries" className="nav-sub-item" onClick={() => setSidebarOpen(false)}>
                  <i className="fas fa-stopwatch text-warning"></i>
                  <span>কুয়েরি পারফরম্যান্স</span>
                </Link>
              </div>
            </div>

            {/* 5. Users & RBAC (Collapsible) */}
            <div className={`nav-section ${expandedSections.users ? 'expanded' : ''}`}>
              <div className="nav-link-item" onClick={() => toggleSection('users')}>
                <div
                  className="nav-icon"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#ffffff' }}
                >
                  <i className="fas fa-users-cog"></i>
                </div>
                <span>ইউজার ও রোল এক্সেস</span>
                <div className="submenu-arrow">
                  <i className="fas fa-chevron-left"></i>
                </div>
              </div>
              <div className="nav-submenu">
                <Link
                  href="/admin/users"
                  className={`nav-sub-item ${pathname === '/admin/users' ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <i className="fas fa-user-shield text-info"></i>
                  <span>ইউজার ও রোল তালিকা</span>
                </Link>
                <Link href="/admin/users" className="nav-sub-item" onClick={() => setSidebarOpen(false)}>
                  <i className="fas fa-key text-warning"></i>
                  <span>API টোকেন পারমিশন</span>
                </Link>
              </div>
            </div>

            {/* 6. ERP Core Engines (Collapsible) */}
            <div className={`nav-section ${expandedSections.erp ? 'expanded' : ''}`}>
              <div className="nav-link-item" onClick={() => toggleSection('erp')}>
                <div
                  className="nav-icon"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#ffffff' }}
                >
                  <i className="fas fa-cogs"></i>
                </div>
                <span>ইআরপি কোর ইঞ্জিন</span>
                <div className="submenu-arrow">
                  <i className="fas fa-chevron-left"></i>
                </div>
              </div>
              <div className="nav-submenu">
                <Link href="/admin#pdf-engine" className="nav-sub-item" onClick={() => setSidebarOpen(false)}>
                  <i className="fas fa-file-pdf text-danger"></i>
                  <span>বাংলা ইউনিকোড PDF ইনভয়েস</span>
                </Link>
                <Link href="/admin#number-to-words" className="nav-sub-item" onClick={() => setSidebarOpen(false)}>
                  <i className="fas fa-language text-success"></i>
                  <span>কথায় লেখা (NumberToWords)</span>
                </Link>
                <Link href="/admin#db-backup" className="nav-sub-item" onClick={() => setSidebarOpen(false)}>
                  <i className="fas fa-hdd text-info"></i>
                  <span>Gzip ব্যাকআপ ও রিস্টোর</span>
                </Link>
                <Link href="/admin#audit-trail" className="nav-sub-item" onClick={() => setSidebarOpen(false)}>
                  <i className="fas fa-history text-warning"></i>
                  <span>অডিট ট্রেইল ও ডিডিফারেন্স</span>
                </Link>
              </div>
            </div>

            {/* 7. Security & Guards (Collapsible) */}
            <div className={`nav-section ${expandedSections.security ? 'expanded' : ''}`}>
              <div className="nav-link-item" onClick={() => toggleSection('security')}>
                <div
                  className="nav-icon"
                  style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#ffffff' }}
                >
                  <i className="fas fa-shield-alt"></i>
                </div>
                <span>সিকিউরিটি ও গার্ডস</span>
                <div className="submenu-arrow">
                  <i className="fas fa-chevron-left"></i>
                </div>
              </div>
              <div className="nav-submenu">
                <Link href="/admin#security-guards" className="nav-sub-item" onClick={() => setSidebarOpen(false)}>
                  <i className="fas fa-lock text-danger"></i>
                  <span>JWT & Passport গার্ড</span>
                </Link>
                <Link href="/admin#rate-limits" className="nav-sub-item" onClick={() => setSidebarOpen(false)}>
                  <i className="fas fa-tachometer-alt text-warning"></i>
                  <span>রেট লিমিটিং ও থ্রোটল</span>
                </Link>
              </div>
            </div>

            {/* 8. Logs & Debugger (Collapsible) */}
            <div className={`nav-section ${expandedSections.logs ? 'expanded' : ''}`}>
              <div className="nav-link-item" onClick={() => toggleSection('logs')}>
                <div
                  className="nav-icon"
                  style={{ background: 'linear-gradient(135deg, #a855f7, #9333ea)', color: '#ffffff' }}
                >
                  <i className="fas fa-bug"></i>
                </div>
                <span>সিস্টেম লগ ও ডিবাগার</span>
                <div className="submenu-arrow">
                  <i className="fas fa-chevron-left"></i>
                </div>
              </div>
              <div className="nav-submenu">
                <Link href="/admin#error-logs" className="nav-sub-item" onClick={() => setSidebarOpen(false)}>
                  <i className="fas fa-exclamation-triangle text-danger"></i>
                  <span>এরর ও স্ট্যাক ট্রেসার</span>
                </Link>
                <Link href="/admin#audit-logs" className="nav-sub-item" onClick={() => setSidebarOpen(false)}>
                  <i className="fas fa-history text-primary"></i>
                  <span>সিস্টেম অডিট লগ</span>
                </Link>
              </div>
            </div>

            {/* 9. Settings & Config (Collapsible) */}
            <div className={`nav-section ${expandedSections.settings ? 'expanded' : ''}`}>
              <div className="nav-link-item" onClick={() => toggleSection('settings')}>
                <div className="nav-icon icon-settings">
                  <i className="fas fa-cogs"></i>
                </div>
                <span>সিস্টেম কনফিগারেশন</span>
                <div className="submenu-arrow">
                  <i className="fas fa-chevron-left"></i>
                </div>
              </div>
              <div className="nav-submenu">
                <Link
                  href="/admin/settings"
                  className={`nav-sub-item ${pathname === '/admin/settings' ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <i className="fas fa-sliders-h text-warning"></i>
                  <span>জেনারেল কনফিগ</span>
                </Link>
                <Link href="/admin/settings#database" className="nav-sub-item" onClick={() => setSidebarOpen(false)}>
                  <i className="fas fa-server text-info"></i>
                  <span>ডেটাবেজ ও পোর্ট সেটিংস</span>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer-actions">
          <button
            type="button"
            className="footer-action-link"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            onClick={handleLogout}
            title="লগআউট"
          >
            <i className="fas fa-power-off"></i> <span>লগআউট</span>
          </button>
          <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', fontWeight: 600 }}>
            v2.1.0 (NestJS)
          </span>
        </div>
      </aside>

      {/* ===== TOPBAR (EXACT AEROMVC / NURSERY ERP) ===== */}
      <header className="adm-topbar">
        {/* Mobile Toggle Button */}
        <button
          className="topbar-toggle"
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle Sidebar"
        >
          <i className="fas fa-bars"></i>
        </button>

        {/* Breadcrumb */}
        <div className="breadcrumb-adm">
          <Link href="/admin" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
            ড্যাশবোর্ড
          </Link>
          <i className="fas fa-chevron-right" style={{ fontSize: '10px' }}></i>
          <strong>{pageTitle}</strong>
        </div>

        {/* Topbar Actions */}
        <div className="topbar-actions">
          {/* Database Live Status Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px',
              borderRadius: '20px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              fontSize: '12px',
              fontWeight: 700,
              color: '#10b981',
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                boxShadow: '0 0 8px #10b981',
              }}
            />
            <span>MySQL 8.0 • Connected</span>
          </div>

          {/* System Health Pulse Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px',
              borderRadius: '20px',
              background: 'rgba(14, 165, 233, 0.1)',
              border: '1px solid rgba(14, 165, 233, 0.3)',
              fontSize: '12px',
              fontWeight: 700,
              color: '#0ea5e9',
            }}
          >
            <i className="fas fa-heartbeat" style={{ color: '#0ea5e9' }}></i>
            <span>Health 100% OK</span>
          </div>

          {/* Notifications Bell */}
          <button className="topbar-btn" type="button" title="অর্ডার ও সিস্টেম নোটিফিকেশন">
            <i className="fas fa-bell"></i>
            <span className="topbar-dot"></span>
          </button>

          {/* Theme Switcher Toggle */}
          <button
            className="topbar-btn"
            id="themeToggle"
            type="button"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'লাইট মোডে সুইচ করুন' : 'ডার্ক মোডে সুইচ করুন'}
          >
            <i className={theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon'} id="themeIcon"></i>
          </button>

          {/* Language Switcher Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              className="topbar-btn"
              type="button"
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              title="ভাষা পরিবর্তন"
            >
              <i className="fas fa-globe"></i>
            </button>
            {langMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '100%',
                  marginTop: '8px',
                  background: 'var(--card-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  boxShadow: 'var(--card-shadow)',
                  padding: '6px 0',
                  minWidth: '130px',
                  zIndex: 1000,
                }}
              >
                <button
                  type="button"
                  style={{
                    width: '100%',
                    padding: '8px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: lang === 'bn' ? 'rgba(230,81,0,0.1)' : 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    color: lang === 'bn' ? 'var(--adm-primary)' : 'var(--text-main)',
                    fontWeight: lang === 'bn' ? 700 : 500,
                    cursor: 'pointer',
                    fontSize: '13px',
                  }}
                  onClick={() => {
                    setLang('bn');
                    setLangMenuOpen(false);
                  }}
                >
                  <span>🇧🇩</span> বাংলা
                </button>
                <button
                  type="button"
                  style={{
                    width: '100%',
                    padding: '8px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: lang === 'en' ? 'rgba(230,81,0,0.1)' : 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    color: lang === 'en' ? 'var(--adm-primary)' : 'var(--text-main)',
                    fontWeight: lang === 'en' ? 700 : 500,
                    cursor: 'pointer',
                    fontSize: '13px',
                  }}
                  onClick={() => {
                    setLang('en');
                    setLangMenuOpen(false);
                  }}
                >
                  <span>🇺🇸</span> English
                </button>
              </div>
            )}
          </div>

          <div className="topbar-divider"></div>

          {/* View Public Site Pill Button */}
          <Link href="/" className="topbar-site-link" target="_blank">
            <i className="fas fa-external-link-alt"></i>
            <span style={{ display: 'inline' }}>ভিউ সাইট</span>
          </Link>
        </div>
      </header>

      {/* ===== CONTENT AREA ===== */}
      <main className="adm-content">
        <div className="adm-page">{children}</div>
      </main>

      {/* Global Toast Container */}
      <div
        style={{
          position: 'fixed',
          top: '80px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              minWidth: '280px',
              padding: '12px 16px',
              borderRadius: '10px',
              background: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--card-shadow)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor:
                  toast.type === 'success'
                    ? '#10b981'
                    : toast.type === 'danger'
                    ? '#ef4444'
                    : '#0ea5e9',
              }}
            />
            <div>
              <div style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--text-main)' }}>
                {toast.title}
              </div>
              <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                {toast.message}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
