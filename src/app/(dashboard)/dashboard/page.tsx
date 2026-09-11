'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { apiRequest } from '@/lib/api-client';
import { HealthStatus } from '@/lib/types';

export default function DashboardPage() {
  const { user, logout, logoutAll } = useAuth();
  const toast = useToast();
  const [health, setHealth] = useState<HealthStatus | null>(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const data = (await apiRequest('/health')) as unknown as HealthStatus;
        setHealth(data);
      } catch (err) {
        console.warn('Health fetch error:', err);
      }
    };
    fetchHealth();
  }, []);

  const handleLogoutAll = async () => {
    if (confirm('Are you sure you want to log out from all active devices?')) {
      try {
        await logoutAll();
        toast.info('Revoked all active sessions across all devices.');
      } catch {
        toast.error('Failed to revoke sessions.');
      }
    }
  };

  return (
    <ProtectedRoute>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px 80px', width: '100%' }}>
        {/* Top Header Card */}
        <div
          className="glass-panel-glow"
          style={{
            padding: '36px',
            marginBottom: '32px',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.8rem',
                fontWeight: 700,
                color: '#07090e',
                overflow: 'hidden',
                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
              }}
            >
              {user?.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatar}
                  alt={user.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                user?.name?.charAt(0).toUpperCase() || 'U'
              )}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 style={{ fontSize: '1.8rem' }}>Welcome, {user?.name}</h1>
                <span
                  className={
                    user?.role === 'ADMIN'
                      ? 'badge badge-admin'
                      : user?.role === 'SHOP_OWNER'
                      ? 'badge badge-shopowner'
                      : 'badge badge-customer'
                  }
                >
                  {user?.role}
                </span>
                {user?.acc_verified && (
                  <span className="badge badge-success" title="Account email verified">
                    ✓ Verified
                  </span>
                )}
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
                {user?.email} • ID: <span style={{ fontFamily: 'monospace', color: 'var(--text-dim)' }}>{user?.id ? user.id.substring(0, 8) + '...' : 'Live'}</span>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link href="/profile" className="btn-secondary" style={{ padding: '10px 18px', fontSize: '0.9rem' }}>
              ⚙️ Account Settings
            </Link>
            <button
              onClick={handleLogoutAll}
              style={{
                padding: '10px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(244, 63, 94, 0.12)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                color: '#fb7185',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Revoke All Devices
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '20px',
            marginBottom: '32px',
          }}
        >
          {/* Card 1 */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Security Protocol
            </span>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: '8px', color: '#34d399' }}>
              Redis-Backed Token
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Opaque Bearer key with server-side revocation
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Rate Limiting
            </span>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: '8px', color: '#38bdf8' }}>
              Lua Sliding Window
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              IP + Device + Identity dual-layer throttle
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Backend Liveness
            </span>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: '8px', color: health?.status === 'ok' ? '#10b981' : '#f43f5e' }}>
              {health?.status === 'ok' ? 'Healthy (Uptime ' + Math.round(health.uptime) + 's)' : 'Checking...'}
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Node.js Fastify process pinged
            </p>
          </div>

          {/* Card 4 */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Cache Status
            </span>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: '8px', color: '#c084fc' }}>
              L1 + Bloom + L2
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Zero DB load on invalid user queries
            </p>
          </div>
        </div>

        {/* Role-Specific Dashboard Content */}
        {user?.role === 'ADMIN' && (
          <div
            className="glass-panel"
            style={{
              padding: '32px',
              marginBottom: '32px',
              borderLeft: '4px solid #fb7185',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem' }}>Admin Control Center</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Manage transactional BullMQ email pipelines and inspect system telemetry.
                </p>
              </div>
              <Link href="/admin/email-test" className="btn-primary" style={{ padding: '8px 18px', fontSize: '0.9rem' }}>
                Open Email Test Console →
              </Link>
            </div>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '16px' }}>
              <a
                href="http://localhost:8080/api-doc"
                target="_blank"
                rel="noreferrer"
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.05)',
                  fontSize: '0.85rem',
                  color: 'var(--text-main)',
                }}
              >
                Swagger UI ↗
              </a>
              <a
                href="http://localhost:8080/metrics"
                target="_blank"
                rel="noreferrer"
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.05)',
                  fontSize: '0.85rem',
                  color: 'var(--text-main)',
                }}
              >
                Prometheus Metrics ↗
              </a>
            </div>
          </div>
        )}

        {/* Quick Links & Shortcuts */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>👤 Profile Management</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
              Update your display name, upload a high-resolution avatar to GCP Cloud Storage, or manage your account info.
            </p>
            <Link href="/profile" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem' }}>
              Manage Profile →
            </Link>
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>🔐 Credentials &amp; Security</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
              Change your password or initiate an email address switch verified by a 6-digit OTP.
            </p>
            <Link href="/profile#security" style={{ color: 'var(--accent-cyan)', fontWeight: 600, fontSize: '0.9rem' }}>
              Security Settings →
            </Link>
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>🚪 Session Termination</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
              End your current browsing session or revoke authentication tokens across all active mobile and web clients.
            </p>
            <button
              onClick={() => logout()}
              style={{ color: '#fb7185', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}
            >
              Sign Out of Session →
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
