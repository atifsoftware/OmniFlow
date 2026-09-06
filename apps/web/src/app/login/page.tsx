'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@omniflow.dev');
  const [password, setPassword] = useState('Admin@123456');
  const [loading, setLoading] = useState(false);
  const [flashError, setFlashError] = useState<string | null>(null);
  const [flashSuccess, setFlashSuccess] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFlashError(null);
    setFlashSuccess(null);
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setFlashSuccess('সফলভাবে লগইন হয়েছে! ড্যাশবোর্ডে প্রবেশ করা হচ্ছে...');
        setTimeout(() => {
          router.push('/admin');
        }, 800);
      } else {
        // If demo credentials match or backend offline fallback
        if (
          (email === 'admin' || email === 'admin@omniflow.dev') &&
          (password === 'admin123' || password === 'Admin@123456')
        ) {
          setFlashSuccess('ডেমো মোডে সফলভাবে লগইন হয়েছে! ড্যাশবোর্ডে প্রবেশ করা হচ্ছে...');
          setTimeout(() => {
            router.push('/admin');
          }, 800);
        } else {
          setFlashError(data?.message || 'ভুল ইউজারনেম বা পাসওয়ার্ড দেওয়া হয়েছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।');
        }
      }
    } catch {
      // Offline / network fallback for demo
      if (
        (email === 'admin' || email === 'admin@omniflow.dev') &&
        (password === 'admin123' || password === 'Admin@123456')
      ) {
        setFlashSuccess('ডেমো মোডে সফলভাবে লগইন হয়েছে! ড্যাশবোর্ডে প্রবেশ করা হচ্ছে...');
        setTimeout(() => {
          router.push('/admin');
        }, 800);
      } else {
        setFlashError('সার্ভারের সাথে সংযোগ স্থাপন করা সম্ভব হয়নি। ডেমো ক্রেডেনশিয়াল ব্যবহার করে দেখতে পারেন।');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(14, 165, 233, 0.08) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(16, 185, 129, 0.08) 0%, transparent 40%)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
        }}
      >
        <div
          className="card"
          style={{
            background: 'var(--bg-card, rgba(30, 41, 59, 0.65))',
            border: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
            padding: '2.5rem',
            borderRadius: '20px',
            boxShadow: 'var(--shadow-premium, 0 20px 25px -5px rgba(0, 0, 0, 0.3))',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #0ea5e9, #10b981)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.5rem',
                marginBottom: '1rem',
                boxShadow: '0 8px 20px rgba(14, 165, 233, 0.35)',
              }}
            >
              <i className="fas fa-lock"></i>
            </div>
            <h3
              style={{
                fontWeight: 700,
                color: 'var(--text-main, #ffffff)',
                fontFamily: "'Hind Siliguri', sans-serif",
                fontSize: '1.65rem',
                marginBottom: '0.4rem',
              }}
            >
              অ্যাডমিন লগইন
            </h3>
            <p
              style={{
                color: 'var(--text-secondary, #94a3b8)',
                fontSize: '0.9rem',
                fontFamily: "'Hind Siliguri', sans-serif",
                margin: 0,
              }}
            >
              আপনার ক্রেডেনশিয়াল ব্যবহার করে সিস্টেমে প্রবেশ করুন
            </p>
          </div>

          {/* Flash Error Notification */}
          {flashError && (
            <div
              style={{
                borderRadius: '12px',
                fontSize: '0.9rem',
                fontFamily: "'Hind Siliguri', sans-serif",
                borderLeft: '4px solid #f43f5e',
                background: 'rgba(244, 63, 94, 0.12)',
                color: '#f43f5e',
                padding: '0.85rem 1rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <i className="fas fa-exclamation-circle" style={{ flexShrink: 0 }}></i>
              <span>{flashError}</span>
            </div>
          )}

          {/* Flash Success Notification */}
          {flashSuccess && (
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
              <i className="fas fa-check-circle" style={{ flexShrink: 0 }}></i>
              <span>{flashSuccess}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label
                style={{
                  color: 'var(--text-main, #cbd5e1)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  fontFamily: "'Hind Siliguri', sans-serif",
                }}
              >
                ইউজারনেম / ইমেইল
              </label>
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@omniflow.dev"
                style={{
                  background: 'var(--input-bg, rgba(15, 23, 42, 0.6))',
                  border: '1px solid var(--input-border, rgba(255, 255, 255, 0.1))',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  color: 'var(--text-main, white)',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#0ea5e9';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(14, 165, 233, 0.2)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--input-border, rgba(255, 255, 255, 0.1))';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label
                style={{
                  color: 'var(--text-main, #cbd5e1)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  fontFamily: "'Hind Siliguri', sans-serif",
                }}
              >
                পাসওয়ার্ড
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  background: 'var(--input-bg, rgba(15, 23, 42, 0.6))',
                  border: '1px solid var(--input-border, rgba(255, 255, 255, 0.1))',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  color: 'var(--text-main, white)',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#0ea5e9';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(14, 165, 233, 0.2)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--input-border, rgba(255, 255, 255, 0.1))';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                border: 'none',
                padding: '0.85rem',
                borderRadius: '10px',
                fontWeight: 700,
                color: 'white',
                fontFamily: "'Hind Siliguri', sans-serif",
                fontSize: '1rem',
                marginTop: '0.5rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition: 'transform 0.15s, box-shadow 0.2s, opacity 0.2s',
                boxShadow: '0 4px 14px rgba(14, 165, 233, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 18px rgba(14, 165, 233, 0.45)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(14, 165, 233, 0.35)';
              }}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>লগইন হচ্ছে...</span>
                </>
              ) : (
                <span>লগইন করুন</span>
              )}
            </button>
          </form>

          {/* Demo Credentials Helper */}
          <div
            style={{
              textAlign: 'center',
              marginTop: '1.75rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
              fontSize: '0.85rem',
              color: 'var(--text-muted, #94a3b8)',
              fontFamily: "'Hind Siliguri', sans-serif",
              lineHeight: 1.6,
            }}
          >
            ডিফল্ট ডেমো ক্রেডেনশিয়াল: <br />
            <span style={{ color: '#38bdf8', fontWeight: 600 }}>admin@omniflow.dev</span> /{' '}
            <span style={{ color: '#38bdf8', fontWeight: 600 }}>Admin@123456</span>
          </div>

          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <Link
              href="/"
              style={{
                color: 'var(--text-muted, #94a3b8)',
                fontSize: '0.85rem',
                textDecoration: 'none',
                fontFamily: "'Hind Siliguri', sans-serif",
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#0ea5e9')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted, #94a3b8)')}
            >
              <i className="fas fa-arrow-left"></i>
              <span>ওয়েবসাইটে ফিরে যান</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
