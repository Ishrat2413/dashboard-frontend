'use client';

import React, { useState } from 'react';
import { useToast } from '@/context/ToastContext';

interface VerificationDriveSectionProps {
  driveUrl: string;
}

export function VerificationDriveSection({ driveUrl }: VerificationDriveSectionProps) {
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(driveUrl);
    setCopied(true);
    toast.success('Drive verification folder link copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      className="glass-panel-glow"
      style={{
        padding: '30px',
        marginBottom: '32px',
        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(15, 23, 42, 0.7) 100%)',
        borderLeft: '4px solid #06b6d4',
      }}
      id="verification"
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
        }}
      >
        {/* Left: Audit Info */}
        <div style={{ maxWidth: '650px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#38bdf8',
                background: 'rgba(6, 182, 212, 0.15)',
                padding: '3px 8px',
                borderRadius: '4px',
                letterSpacing: '0.04em',
              }}
            >
              SECTION 5
            </span>
            <span className="badge badge-success">✓ Cryptographically Audited</span>
          </div>

          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>
            Digital Proof &amp; Verification Repository
          </h2>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '14px' }}>
            Access all digital receipts, bank credit advices, platform payout statements, Macbook purchase invoices,
            and operational disbursement vouchers via the encrypted Google Drive folder.
          </p>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              fontSize: '0.8rem',
              color: 'var(--text-dim)',
            }}
          >
            <span>📄 Bank Advices (GBP/USD)</span>
            <span>•</span>
            <span>💻 Hardware Invoices (Macbook 2-units)</span>
            <span>•</span>
            <span>🏛️ Partner Profit Bank Receipts</span>
            <span>•</span>
            <span>⚡ AI &amp; Cloud Subscriptions</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '240px' }}>
          <a
            href={driveUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-primary"
            style={{
              padding: '12px 22px',
              background: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)',
              boxShadow: '0 4px 18px rgba(6, 182, 212, 0.35)',
              fontSize: '0.95rem',
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
            Open Drive Folder ↗
          </a>

          <button
            onClick={handleCopyLink}
            className="btn-secondary"
            style={{ padding: '10px 18px', fontSize: '0.88rem' }}
          >
            {copied ? '✓ Link Copied!' : '📋 Copy Drive Link'}
          </button>
        </div>
      </div>
    </div>
  );
}
