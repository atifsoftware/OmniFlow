import Link from 'next/link';

export default function HomePage() {
  const stack = [
    { title: 'NestJS Backend', desc: 'Enterprise Core API Engine, OmniDB ORM, Queue, Gemini AI, MySQL Transactions', port: ':4000', badge: 'backend' },
    { title: 'Next.js Web & Admin', desc: 'App Router, React Server Components, SEO Optimized, Premium Responsive UI', port: ':3000', badge: 'frontend' },
    { title: 'React Native (Expo)', desc: 'Cross-platform iOS & Android mobile application with shared TypeScript contracts', port: ':8081', badge: 'mobile' },
    { title: '@omniflow/shared', desc: 'Single source of truth for DTOs, API endpoints, enums, and interfaces', port: 'Shared', badge: 'package' },
  ];

  const features = [
    { icon: '🗄️', title: 'OmniDB & Active Record', text: 'Fluent query builder, model relationships, auto rollback test-runner.' },
    { icon: '🤖', title: 'Gemini AI Assistant', text: 'Native HTTPS client for intelligent auto-complete, queries, and business summaries.' },
    { icon: '🔑', title: 'Personal Access Tokens', text: 'Sanctum-style API tokens with hashed keys and granular permissions.' },
    { icon: '⚡', title: 'Enterprise Queue System', text: 'MySQL-backed persistent queue with automatic retry, delay, and worker daemon.' },
    { icon: '🛡️', title: 'Intelligent Exception Filter', text: 'Levenshtein typo suggestion, SQL error breakdown, and developer diagnostics.' },
    { icon: '📱', title: 'Cross-Platform Ready', text: 'Web, Mobile, and API all orchestrated under a unified TypeScript monorepo.' },
  ];

  return (
    <div className="container" style={{ padding: '60px 24px 0' }}>
      {/* Hero Section */}
      <section style={{ textAlign: 'center', marginBottom: '70px' }}>
        <span className="badge badge-blue" style={{ marginBottom: '16px' }}>
          🚀 Next-Gen Enterprise Monorepo
        </span>
        <h1 style={{
          fontSize: '3.2rem',
          fontWeight: 800,
          lineHeight: 1.15,
          marginBottom: '20px',
          background: 'linear-gradient(135deg, #ffffff 30%, #94a3b8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          OmniFlow Enterprise Platform
        </h1>
        <p style={{
          fontSize: '1.25rem',
          color: 'var(--text-secondary)',
          maxWidth: '750px',
          margin: '0 auto 36px',
        }}>
          A complete, unified framework powering your <strong>NestJS</strong> backend, <strong>Next.js</strong> storefront & admin portal, and <strong>React Native (Expo)</strong> mobile application.
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/admin" className="btn-primary">
            Launch Admin ERP Dashboard →
          </Link>
          <a href="http://localhost:4000/api/docs" target="_blank" rel="noreferrer" className="btn-secondary">
            View Swagger API Docs
          </a>
        </div>
      </section>

      {/* Unified Stack Grid */}
      <section style={{ marginBottom: '80px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '24px', textAlign: 'center' }}>
          Integrated Monorepo Stack
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px',
        }}>
          {stack.map((item, idx) => (
            <div key={idx} className="glass-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span className="badge badge-purple">{item.badge}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', fontFamily: 'monospace' }}>{item.port}</span>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '8px' }}>{item.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Framework Features */}
      <section>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '24px', textAlign: 'center' }}>
          Framework Capabilities
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
        }}>
          {features.map((f, idx) => (
            <div key={idx} className="glass-card" style={{ padding: '28px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '14px' }}>{f.icon}</div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '8px' }}>{f.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{f.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
