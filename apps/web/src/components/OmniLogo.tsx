'use client';

import React from 'react';
import Image from 'next/image';

interface OmniLogoProps {
  size?: number;
  showText?: boolean;
  useImage?: boolean;
  subtitle?: string;
  className?: string;
}

export function OmniLogo({
  size = 38,
  showText = true,
  useImage = false,
  subtitle,
  className = '',
}: OmniLogoProps) {
  return (
    <div
      className={`omniflow-brand-logo ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: size > 32 ? '12px' : '8px',
        textDecoration: 'none',
        userSelect: 'none',
      }}
    >
      {useImage ? (
        <div
          style={{
            width: size,
            height: size,
            borderRadius: `${Math.round(size * 0.28)}px`,
            overflow: 'hidden',
            boxShadow: '0 4px 16px rgba(230, 81, 0, 0.35)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#090d16',
            flexShrink: 0,
          }}
        >
          <Image
            src="/logo.png"
            alt="OmniFlow Logo"
            width={size}
            height={size}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      ) : (
        /* Crisp Vector Infinity Flow Emblem */
        <div
          style={{
            width: size,
            height: size,
            borderRadius: `${Math.round(size * 0.26)}px`,
            background: 'linear-gradient(145deg, rgba(17, 24, 39, 0.95), rgba(10, 14, 23, 0.98))',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 4px 16px rgba(230, 81, 0, 0.25), 0 2px 6px rgba(6, 182, 212, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            padding: `${Math.round(size * 0.14)}px`,
            boxSizing: 'border-box',
          }}
        >
          <svg
            viewBox="0 0 100 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: '100%', height: '100%', overflow: 'visible' }}
          >
            <defs>
              <linearGradient id="omniFlowGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
              <linearGradient id="omniFlowGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ff851b" />
                <stop offset="60%" stopColor="#e65100" />
                <stop offset="100%" stopColor="#d946ef" />
              </linearGradient>
              <filter id="omniGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Glowing Backdrop Loop */}
            <path
              d="M32 12C18.7 12 8 21.0 8 32C8 43.0 18.7 52 32 52C42.8 52 48.5 42.5 54 36L68 20C73.5 13.5 79.2 12 86 12C93.7 12 100 18.3 100 26"
              stroke="url(#omniFlowGrad1)"
              strokeWidth="11"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#omniGlow)"
              opacity="0.5"
            />

            {/* Left Loop (Cyan to Indigo flow) */}
            <path
              d="M32 14C20 14 10 22 10 32C10 42 20 50 32 50C43 50 49 42 55 35L67 21C73 14 79 14 88 14C94.6 14 100 19.4 100 26"
              stroke="url(#omniFlowGrad1)"
              strokeWidth="9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Right Loop (Amber Orange to Magenta flow) */}
            <path
              d="M68 50C80 50 90 42 90 32C90 22 80 14 68 14C57 14 51 22 45 29L33 43C27 50 21 50 12 50"
              stroke="url(#omniFlowGrad2)"
              strokeWidth="9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Center Dynamic Fusion Energy Spark */}
            <circle cx="50" cy="32" r="4" fill="#ffffff" />
            <circle cx="50" cy="32" r="7" fill="url(#omniFlowGrad2)" opacity="0.6" />
          </svg>
        </div>
      )}

      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                fontWeight: 800,
                fontSize: size > 32 ? '1.35rem' : '1.15rem',
                letterSpacing: '-0.02em',
                color: 'var(--text-primary, #ffffff)',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Omni<span style={{
                background: 'linear-gradient(135deg, #ff851b 0%, var(--adm-primary, #e65100) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>Flow</span>
            </span>
            <span
              style={{
                fontSize: '0.62rem',
                fontWeight: 800,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                padding: '2px 7px',
                borderRadius: '6px',
                background: 'rgba(230, 81, 0, 0.15)',
                color: '#ff851b',
                border: '1px solid rgba(230, 81, 0, 0.3)',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              ERP
            </span>
          </div>

          {subtitle && (
            <span
              style={{
                fontSize: '0.72rem',
                color: 'var(--text-muted, #94a3b8)',
                fontWeight: 500,
                marginTop: '3px',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
