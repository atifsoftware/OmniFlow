'use client';

import { useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'CUSTOMER';
  isActive: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');

  const [users, setUsers] = useState<User[]>([
    {
      id: 'USR-001',
      name: 'Atif Software',
      email: 'admin@omniflow.dev',
      role: 'SUPER_ADMIN',
      isActive: true,
      createdAt: '২০২৬-০১-১৫',
    },
    {
      id: 'USR-002',
      name: 'Sadia Rahman',
      email: 'sadia.rahman@example.com',
      role: 'ADMIN',
      isActive: true,
      createdAt: '২০২৬-০২-১০',
    },
    {
      id: 'USR-003',
      name: 'Tanvir Ahmed',
      email: 'tanvir.manager@example.com',
      role: 'MANAGER',
      isActive: true,
      createdAt: '২০২৬-০২-২৮',
    },
    {
      id: 'USR-004',
      name: 'Imran Hossain',
      email: 'imran.customer@gmail.com',
      role: 'CUSTOMER',
      isActive: true,
      createdAt: '২০২৬-০৩-০৪',
    },
    {
      id: 'USR-005',
      name: 'Nasir Uddin',
      email: 'nasir.test@outlook.com',
      role: 'CUSTOMER',
      isActive: false,
      createdAt: '২০২৬-০৩-০৫',
    },
  ]);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'ALL' || u.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: User['role']) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return (
          <span
            style={{
              background: 'rgba(168, 85, 247, 0.15)',
              color: '#c084fc',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              padding: '0.25rem 0.65rem',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            Super Admin
          </span>
        );
      case 'ADMIN':
        return (
          <span
            style={{
              background: 'rgba(14, 165, 233, 0.15)',
              color: '#38bdf8',
              border: '1px solid rgba(14, 165, 233, 0.3)',
              padding: '0.25rem 0.65rem',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            Admin
          </span>
        );
      case 'MANAGER':
        return (
          <span
            style={{
              background: 'rgba(59, 130, 246, 0.15)',
              color: '#60a5fa',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              padding: '0.25rem 0.65rem',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            Manager
          </span>
        );
      default:
        return (
          <span
            style={{
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#34d399',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              padding: '0.25rem 0.65rem',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            Customer
          </span>
        );
    }
  };

  const toggleStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, isActive: !u.isActive } : u))
    );
  };

  return (
    <div>
      {/* Header & Title */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        <div>
          <h2
            style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              fontFamily: "'Hind Siliguri', sans-serif",
              color: 'var(--text-main, #f8fafc)',
              margin: '0 0 4px 0',
            }}
          >
            ইউজার ব্যবস্থাপনা
          </h2>
          <p
            style={{
              color: 'var(--text-muted, #94a3b8)',
              fontSize: '0.9rem',
              fontFamily: "'Hind Siliguri', sans-serif",
              margin: 0,
            }}
          >
            সিস্টেমে নিবন্ধিত সমস্ত ইউজার, অ্যাডমিন এবং গ্রাহকদের রোল ও পারমিশন কন্ট্রোল
          </p>
        </div>

        <button
          className="btn-gradient-primary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: "'Hind Siliguri', sans-serif",
            fontSize: '0.95rem',
          }}
          onClick={() => alert('নতুন ইউজার তৈরির ডায়ালগ শীঘ্রই সক্রিয় হবে।')}
        >
          <i className="fas fa-user-plus"></i>
          <span>নতুন ইউজার তৈরি</span>
        </button>
      </div>

      {/* 4 Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '1.75rem',
        }}
      >
        <div
          className="stat-card-premium total card"
          style={{
            padding: '1.25rem',
            borderRadius: '16px',
            background: 'var(--bg-card, rgba(30, 41, 59, 0.7))',
            border: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
          }}
        >
          <div style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.85rem', fontFamily: "'Hind Siliguri', sans-serif", fontWeight: 600 }}>
            মোট ইউজার
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main, #f8fafc)', margin: '6px 0' }}>
            {users.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#38bdf8' }}>সর্বমোট রেজিস্টার্ড অ্যাকাউন্ট</div>
        </div>

        <div
          className="stat-card-premium active card"
          style={{
            padding: '1.25rem',
            borderRadius: '16px',
            background: 'var(--bg-card, rgba(30, 41, 59, 0.7))',
            border: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
          }}
        >
          <div style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.85rem', fontFamily: "'Hind Siliguri', sans-serif", fontWeight: 600 }}>
            সক্রিয় অ্যাকাউন্ট
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981', margin: '6px 0' }}>
            {users.filter((u) => u.isActive).length}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#10b981' }}>লগইন ও অর্ডারে সক্ষম</div>
        </div>

        <div
          className="stat-card-premium suspended card"
          style={{
            padding: '1.25rem',
            borderRadius: '16px',
            background: 'var(--bg-card, rgba(30, 41, 59, 0.7))',
            border: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
          }}
        >
          <div style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.85rem', fontFamily: "'Hind Siliguri', sans-serif", fontWeight: 600 }}>
            নিষ্ক্রিয় / সাসপেন্ডেড
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f43f5e', margin: '6px 0' }}>
            {users.filter((u) => !u.isActive).length}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#f43f5e' }}>অস্থায়ীভাবে স্থগিত</div>
        </div>

        <div
          className="stat-card-premium admins card"
          style={{
            padding: '1.25rem',
            borderRadius: '16px',
            background: 'var(--bg-card, rgba(30, 41, 59, 0.7))',
            border: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
          }}
        >
          <div style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.85rem', fontFamily: "'Hind Siliguri', sans-serif", fontWeight: 600 }}>
            এডমিন ও ম্যানেজার
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#c084fc', margin: '6px 0' }}>
            {users.filter((u) => u.role !== 'CUSTOMER').length}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#c084fc' }}>প্রশাসনিক অধিকারপ্রাপ্ত</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="card"
        style={{
          padding: '1.25rem',
          borderRadius: '16px',
          background: 'var(--bg-card, rgba(30, 41, 59, 0.7))',
          border: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
          marginBottom: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', gap: '10px', flex: 1, minWidth: '260px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <i
              className="fas fa-search"
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted, #94a3b8)',
              }}
            ></i>
            <input
              type="text"
              placeholder="নাম বা ইমেইল দিয়ে খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 1rem 0.65rem 2.5rem',
                borderRadius: '10px',
                background: 'var(--input-bg, rgba(15, 23, 42, 0.6))',
                border: '1px solid var(--input-border, rgba(255, 255, 255, 0.1))',
                color: 'var(--text-main, #f8fafc)',
                fontSize: '0.9rem',
                fontFamily: "'Hind Siliguri', sans-serif",
                outline: 'none',
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {['ALL', 'SUPER_ADMIN', 'ADMIN', 'MANAGER', 'CUSTOMER'].map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              style={{
                padding: '0.4rem 0.8rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 600,
                border: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
                background: selectedRole === role ? '#0ea5e9' : 'var(--bg-secondary, rgba(30, 41, 59, 0.45))',
                color: selectedRole === role ? 'white' : 'var(--text-muted, #94a3b8)',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {role === 'ALL' ? 'সমস্ত রোল' : role}
            </button>
          ))}
        </div>
      </div>

      {/* User Table */}
      <div
        className="table-container-premium"
        style={{
          border: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
          borderRadius: '18px',
          overflow: 'hidden',
          background: 'var(--bg-card, rgba(30, 41, 59, 0.7))',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr
                style={{
                  background: 'var(--bg-secondary, rgba(15, 23, 42, 0.5))',
                  borderBottom: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
                  color: 'var(--text-muted, #94a3b8)',
                  fontSize: '0.82rem',
                  fontFamily: "'Hind Siliguri', sans-serif",
                }}
              >
                <th style={{ padding: '14px 18px' }}>ইউজার ও তথ্য</th>
                <th style={{ padding: '14px 18px' }}>রোল (Role)</th>
                <th style={{ padding: '14px 18px' }}>স্ট্যাটাস</th>
                <th style={{ padding: '14px 18px' }}>নিবন্ধন তারিখ</th>
                <th style={{ padding: '14px 18px', textAlign: 'right' }}>অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted, #94a3b8)', fontFamily: "'Hind Siliguri', sans-serif" }}>
                    কোনো ইউজার পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    style={{
                      borderBottom: '1px solid var(--border-color, rgba(255, 255, 255, 0.05))',
                      transition: 'background-color 0.2s',
                    }}
                  >
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '1rem',
                          }}
                        >
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ color: 'var(--text-main, #f8fafc)', fontWeight: 600, fontSize: '0.92rem' }}>
                            {user.name}
                          </div>
                          <div style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.8rem' }}>
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '14px 18px' }}>{getRoleBadge(user.role)}</td>

                    <td style={{ padding: '14px 18px' }}>
                      <span
                        onClick={() => toggleStatus(user.id)}
                        style={{
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '0.25rem 0.65rem',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background: user.isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                          color: user.isActive ? '#10b981' : '#f43f5e',
                          border: `1px solid ${user.isActive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
                        }}
                        title="ক্লিক করে স্ট্যাটাস পরিবর্তন করুন"
                      >
                        <i className={`fas ${user.isActive ? 'fa-check-circle' : 'fa-ban'}`}></i>
                        {user.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>

                    <td style={{ padding: '14px 18px', color: 'var(--text-muted, #94a3b8)', fontSize: '0.85rem' }}>
                      {user.createdAt}
                    </td>

                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <button
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#0ea5e9',
                          cursor: 'pointer',
                          padding: '6px 10px',
                          fontSize: '0.9rem',
                        }}
                        title="এডিট করুন"
                        onClick={() => alert(`ইউজার #${user.name} এডিট প্যানেল সক্রিয় হচ্ছে`)}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
