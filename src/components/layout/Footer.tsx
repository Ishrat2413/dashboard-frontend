'use client';

import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--border-subtle)',
        background: 'rgba(7, 9, 14, 0.95)',
        padding: '40px 24px 30px',
        marginTop: 'auto',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.9rem',
              color: '#07090e',
            }}
          >
            Z
          </div>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            © {new Date().getFullYear()} Zentura Finance. Powered by NestJS 11 + Fastify & Next.js.
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <a
            href="http://localhost:8080/api-doc"
            target="_blank"
            rel="noreferrer"
            style={{
              fontSize: '0.85rem',
              color: 'var(--text-dim)',
              transition: 'color var(--transition-fast)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            Swagger API Docs ↗
          </a>
          <a
            href="http://localhost:8080/health"
            target="_blank"
            rel="noreferrer"
            style={{
              fontSize: '0.85rem',
              color: 'var(--text-dim)',
              transition: 'color var(--transition-fast)',
            }}
          >
            Liveness Probe ↗
          </a>
          <a
            href="http://localhost:8080/metrics"
            target="_blank"
            rel="noreferrer"
            style={{
              fontSize: '0.85rem',
              color: 'var(--text-dim)',
              transition: 'color var(--transition-fast)',
            }}
          >
            Prometheus Metrics ↗
          </a>
        </div>
      </div>
    </footer>
  );
}
