'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/lib/api-client';
import { HealthStatus } from '@/lib/types';

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(true);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = (await apiRequest('/health')) as unknown as HealthStatus;
        setHealth(res);
      } catch (err) {
        console.warn('Health check failed', err);
      } finally {
        setLoadingHealth(false);
      }
    };
    fetchHealth();
  }, []);

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '60px 24px 80px', width: '100%' }}>
      {/* Hero Section */}
      <section
        style={{
          textAlign: 'center',
          maxWidth: '900px',
          margin: '0 auto 80px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Pill Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            marginBottom: '28px',
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.15)',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 10px #10b981',
            }}
          />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#34d399' }}>
            Hardened NestJS 11 + Fastify 5 & Next.js 16 Stack
          </span>
        </div>

        {/* Main Heading */}
        <h1
          style={{
            fontSize: 'clamp(2.5rem, 5vw, 4.2rem)',
            lineHeight: 1.15,
            marginBottom: '24px',
            letterSpacing: '-0.03em',
          }}
        >
          High-Velocity Financial Identity &amp;{' '}
          <span className="gradient-text-emerald">Hardened Auth</span> Infrastructure
        </h1>

        <p
          style={{
            fontSize: '1.2rem',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
            marginBottom: '36px',
            maxWidth: '720px',
          }}
        >
          Engineered for zero-trust security and microsecond throughput. Backed by Redis 7.4 multi-database
          isolation, Bloom filter query guards, BullMQ transactional email queues, and circuit breaker resilience.
        </p>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="btn-primary"
              style={{ fontSize: '1.05rem', padding: '14px 32px' }}
            >
              Go to Dashboard →
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="btn-primary"
                style={{ fontSize: '1.05rem', padding: '14px 32px' }}
              >
                Sign In to Platform →
              </Link>
              <Link
                href="/register"
                className="btn-secondary"
                style={{ fontSize: '1.05rem', padding: '14px 28px' }}
              >
                Create Account
              </Link>
            </>
          )}

          <a
            href="http://localhost:8080/api-doc"
            target="_blank"
            rel="noreferrer"
            className="btn-secondary"
            style={{ fontSize: '1.05rem', padding: '14px 24px' }}
          >
            Swagger API Docs ↗
          </a>
        </div>
      </section>

      {/* Live System Diagnostics Card */}
      <section style={{ marginBottom: '80px' }}>
        <div
          className="glass-panel-glow"
          style={{
            padding: '32px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '24px',
            alignItems: 'center',
          }}
        >
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Backend Health Status
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
              <span
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: health?.status === 'ok' ? '#10b981' : '#f43f5e',
                  boxShadow: health?.status === 'ok' ? '0 0 12px #10b981' : 'none',
                }}
              />
              <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff' }}>
                {loadingHealth ? 'Probing...' : health?.status === 'ok' ? 'Online & Healthy' : 'Offline / Standby'}
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Probe: <code style={{ color: '#34d399' }}>GET http://localhost:8080/health</code>
            </p>
          </div>

          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Process Uptime
            </span>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', marginTop: '6px' }}>
              {health ? `${Math.round(health.uptime)} seconds` : '--'}
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Node.js Fastify event loop active
            </p>
          </div>

          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Memory Utilization
            </span>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', marginTop: '6px' }}>
              {health?.memory ? `${Math.round(health.memory.heapUsed / 1024 / 1024)} MB / ${Math.round(health.memory.heapTotal / 1024 / 1024)} MB` : '--'}
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              V8 heap allocations in bounds
            </p>
          </div>

          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Auth Session Engine
            </span>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#38bdf8', marginTop: '6px' }}>
              Redis DB 1
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Opaque tokens + instant revocation
            </p>
          </div>
        </div>
      </section>

      {/* Architectural Pillars Grid */}
      <section style={{ marginBottom: '80px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '2.2rem', marginBottom: '12px' }}>
            Built for Extreme Reliability
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
            Key architecture layers implemented in the NestJS backend
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
          }}
        >
          {/* Card 1 */}
          <div className="glass-panel" style={{ padding: '32px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.3rem',
                marginBottom: '20px',
              }}
            >
              🛡️
            </div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '12px' }}>
              3-Tier Cache + Bloom Filter
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              L1 in-process LRU cache combined with a Redis-backed Bloom filter to short-circuit queries for
              non-existent user records before they ever reach PostgreSQL.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-panel" style={{ padding: '32px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'rgba(56, 189, 248, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.3rem',
                marginBottom: '20px',
              }}
            >
              ⚡
            </div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '12px' }}>
              Isolated Multi-DB Redis 7.4
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Dedicated Redis databases for Auth (DB 1), Sliding Rate Limiters (DB 3), General Queue (DB 4),
              Auth/OTP Email Queue (DB 5), and GCS Caches (DB 12).
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-panel" style={{ padding: '32px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'rgba(168, 85, 247, 0.15)',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.3rem',
                marginBottom: '20px',
              }}
            >
              📨
            </div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '12px' }}>
              BullMQ Transactional Email
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Asynchronous email dispatch with isolated OTP queue priority and Opossum circuit breaker fallback,
              ensuring critical verification codes never queue behind bulk sends.
            </p>
          </div>
        </div>
      </section>

      {/* Dev Accounts Quick Test Box */}
      <section>
        <div
          className="glass-panel"
          style={{
            padding: '36px',
            textAlign: 'center',
            background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.7) 0%, rgba(10, 15, 26, 0.9) 100%)',
            border: '1px solid var(--border-medium)',
          }}
        >
          <span className="badge badge-success" style={{ marginBottom: '16px' }}>
            Dev Sandbox Ready
          </span>
          <h3 style={{ fontSize: '1.6rem', marginBottom: '12px' }}>
            Ready-to-Use Seed Accounts
          </h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 24px', fontSize: '0.95rem' }}>
            The database seed provides three pre-verified test accounts for each role with password <code style={{ color: '#34d399' }}>12345678</code>.
          </p>

          <div
            style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Link
              href="/login?role=admin"
              style={{
                padding: '12px 20px',
                borderRadius: '10px',
                background: 'rgba(244, 63, 94, 0.15)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                color: '#fb7185',
                fontWeight: 600,
                fontSize: '0.9rem',
              }}
            >
              Admin: admin@example.com
            </Link>
            <Link
              href="/login?role=shopowner"
              style={{
                padding: '12px 20px',
                borderRadius: '10px',
                background: 'rgba(168, 85, 247, 0.15)',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                color: '#c084fc',
                fontWeight: 600,
                fontSize: '0.9rem',
              }}
            >
              Shop Owner: shopowner@example.com
            </Link>
            <Link
              href="/login?role=customer"
              style={{
                padding: '12px 20px',
                borderRadius: '10px',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#34d399',
                fontWeight: 600,
                fontSize: '0.9rem',
              }}
            >
              Customer: customer@example.com
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
