'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/lib/api-client';
import { HealthStatus, ServiceResponse } from '@/lib/types';

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [isBackendOnline, setIsBackendOnline] = useState<boolean | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = (await apiRequest('/health')) as unknown as HealthStatus;
        if (res && res.status === 'ok') {
          setHealth(res);
          setIsBackendOnline(true);
        } else {
          setIsBackendOnline(false);
        }
      } catch {
        setIsBackendOnline(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'var(--bg-nav)',
        backdropFilter: 'var(--blur-glass)',
        WebkitBackdropFilter: 'var(--blur-glass)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Brand Logo */}
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
              fontWeight: 800,
              fontSize: '1.2rem',
              color: '#07090e',
            }}
          >
            Z
          </div>
          <div>
            <span
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '1.25rem',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: '#fff',
              }}
            >
              Zentura <span className="gradient-text-emerald">Finance</span>
            </span>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
          }}
        >
          <Link
            href="/"
            style={{
              color: pathname === '/' ? '#fff' : 'var(--text-muted)',
              fontSize: '0.9rem',
              fontWeight: 500,
              transition: 'color var(--transition-fast)',
            }}
          >
            Home
          </Link>

          {isAuthenticated && (
            <>
              <Link
                href="/dashboard"
                style={{
                  color: pathname.startsWith('/dashboard') ? '#fff' : 'var(--text-muted)',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  transition: 'color var(--transition-fast)',
                }}
              >
                Dashboard
              </Link>
              <Link
                href="/profile"
                style={{
                  color: pathname.startsWith('/profile') ? '#fff' : 'var(--text-muted)',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  transition: 'color var(--transition-fast)',
                }}
              >
                Profile
              </Link>
              {user?.role === 'ADMIN' && (
                <Link
                  href="/admin/email-test"
                  style={{
                    color: pathname.startsWith('/admin') ? '#fff' : 'var(--text-muted)',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: '#fb7185',
                    }}
                  />
                  Admin
                </Link>
              )}
            </>
          )}
        </nav>

        {/* Right Section: Backend status + Auth buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Health Pill */}
          <div
            title={
              isBackendOnline
                ? `Backend Online (Uptime: ${health ? Math.round(health.uptime) : 0}s)`
                : 'Backend Offline / Unreachable'
            }
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background:
                  isBackendOnline === null
                    ? '#94a3b8'
                    : isBackendOnline
                    ? '#10b981'
                    : '#f43f5e',
                boxShadow: isBackendOnline
                  ? '0 0 8px rgba(16, 185, 129, 0.8)'
                  : isBackendOnline === false
                  ? '0 0 8px rgba(244, 63, 94, 0.8)'
                  : 'none',
              }}
            />
            <span>API: {isBackendOnline ? 'Online' : 'Offline'}</span>
          </div>

          {isAuthenticated && user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Link
                href="/profile"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '6px 12px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                  transition: 'border-color var(--transition-fast)',
                }}
              >
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: '#fff',
                    overflow: 'hidden',
                  }}
                >
                  {user.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.avatar}
                      alt={user.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    user.name?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: 'var(--text-main)',
                      lineHeight: 1.2,
                    }}
                  >
                    {user.name}
                  </span>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      color: 'var(--text-dim)',
                    }}
                  >
                    {user.role}
                  </span>
                </div>
              </Link>
              <button
                onClick={() => logout()}
                style={{
                  padding: '8px 14px',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255,255,255,0.03)',
                  transition: 'all var(--transition-fast)',
                }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link
                href="/login"
                style={{
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  color: 'var(--text-main)',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  background: 'rgba(255,255,255,0.04)',
                }}
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="btn-primary"
                style={{
                  padding: '8px 18px',
                  fontSize: '0.9rem',
                }}
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
