'use client';

import React from 'react';
import { MonthlyFinancialReport } from '@/types/finance';
import { exportReportToCSV } from '@/utils/financeFormatters';

interface FinanceHeaderProps {
  report: MonthlyFinancialReport;
  onOpenAddModal: () => void;
  onPrintReport: () => void;
  isModified?: boolean;
  onResetReport?: () => void;
  userName?: string;
  userRole?: string;
}

export function FinanceHeader({
  report,
  onOpenAddModal,
  onPrintReport,
  isModified,
  onResetReport,
  userName,
  userRole,
}: FinanceHeaderProps) {
  return (
    <div
      className="glass-panel-glow"
      style={{
        padding: '32px 36px',
        marginBottom: '28px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background ambient accent */}
      <div
        style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '240px',
          height: '240px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Left: Organization & Title */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 800,
                fontSize: '0.85rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#34d399',
                background: 'rgba(16, 185, 129, 0.12)',
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}
            >
              {report.organization}
            </span>

            <span
              className="badge badge-success"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.78rem',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#10b981',
                  boxShadow: '0 0 8px #10b981',
                }}
              />
              {report.status} Ledger
            </span>

            {isModified && (
              <span
                className="badge badge-warning"
                style={{ fontSize: '0.75rem', cursor: 'pointer' }}
                onClick={onResetReport}
                title="Click to restore original August 2026 dataset"
              >
                Simulation Active (Click to Reset)
              </span>
            )}
          </div>

          <h1
            style={{
              fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
              fontWeight: 800,
              lineHeight: 1.2,
              marginBottom: '6px',
            }}
          >
            Financial Performance Report{' '}
            <span className="gradient-text-emerald">— {report.month} {report.year}</span>
          </h1>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Comprehensive executive reconciliation of inflows, partner distributions, hardware capital advances,
            and outstanding claims.
            {userName && (
              <span style={{ marginLeft: '8px', color: 'var(--text-dim)' }}>
                • Session: <strong style={{ color: '#fff' }}>{userName}</strong> ({userRole})
              </span>
            )}
          </p>
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <a
            href={report.driveVerificationUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-secondary"
            style={{
              fontSize: '0.88rem',
              padding: '10px 16px',
              background: 'rgba(6, 182, 212, 0.1)',
              borderColor: 'rgba(6, 182, 212, 0.3)',
              color: '#38bdf8',
            }}
            title="Open Google Drive verification folder with all receipts & proofs"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>
            Drive Receipts ↗
          </a>

          <button
            onClick={() => exportReportToCSV(report)}
            className="btn-secondary"
            style={{ fontSize: '0.88rem', padding: '10px 16px' }}
            title="Export full August ledger to CSV spreadsheet"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Export CSV
          </button>

          <button
            onClick={onPrintReport}
            className="btn-secondary"
            style={{ fontSize: '0.88rem', padding: '10px 16px' }}
            title="Print formal executive report or save as PDF"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 6 2 18 2 18 9"></polyline>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
              <rect x="6" y="14" width="12" height="8"></rect>
            </svg>
            Print / PDF
          </button>

          <button
            onClick={onOpenAddModal}
            className="btn-primary"
            style={{ fontSize: '0.88rem', padding: '10px 18px' }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Record
          </button>
        </div>
      </div>
    </div>
  );
}
