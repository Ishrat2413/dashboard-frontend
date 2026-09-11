'use client';

import React from 'react';
import { MonthlyFinancialReport } from '@/types/finance';
import { formatBDT, formatPercent } from '@/utils/financeFormatters';

interface ExecutiveSummaryCardsProps {
  report: MonthlyFinancialReport;
}

export function ExecutiveSummaryCards({ report }: ExecutiveSummaryCardsProps) {
  const { totalIncomeBDT, totalExpensesBDT, netBalanceBDT } = report.executiveSummary;
  const netRemainingFundBalanceBDT = report.finalSummary.netRemainingFundBalanceBDT;
  const { totalLiabilitiesBDT, totalReceivablesBDT } = report;

  const expenseRatio = totalIncomeBDT > 0 ? totalExpensesBDT / totalIncomeBDT : 0;
  const netMargin = totalIncomeBDT > 0 ? netBalanceBDT / totalIncomeBDT : 0;
  const projectedLiquidity = netRemainingFundBalanceBDT + totalReceivablesBDT - totalLiabilitiesBDT;

  return (
    <div style={{ marginBottom: '32px' }}>
      {/* Primary KPI Grid (4 High-Impact Metric Cards) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px',
          marginBottom: '20px',
        }}
      >
        {/* Total Income Card */}
        <div
          className="glass-panel"
          style={{
            padding: '24px 26px',
            position: 'relative',
            overflow: 'hidden',
            borderTop: '3px solid #10b981',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span
              style={{
                fontSize: '0.82rem',
                color: 'var(--text-dim)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                fontWeight: 700,
              }}
            >
              1. Total Income
            </span>
            <span
              style={{
                padding: '3px 8px',
                borderRadius: '6px',
                background: 'rgba(16, 185, 129, 0.12)',
                color: '#34d399',
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              6 Streams
            </span>
          </div>

          <div
            style={{
              fontSize: 'clamp(1.7rem, 2.2vw, 2.2rem)',
              fontWeight: 800,
              color: '#34d399',
              fontFamily: 'Outfit, sans-serif',
              letterSpacing: '-0.02em',
              marginBottom: '6px',
            }}
          >
            {formatBDT(totalIncomeBDT, { currencyCode: true })}
          </div>

          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Includes international client GBP retainers, USD escrow payouts, and opening reserve.
          </p>

          {/* Sparkline / Progress representation */}
          <div style={{ background: 'rgba(255,255,255,0.06)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(90deg, #10b981, #06b6d4)' }} />
          </div>
        </div>

        {/* Total Expenses Card */}
        <div
          className="glass-panel"
          style={{
            padding: '24px 26px',
            position: 'relative',
            overflow: 'hidden',
            borderTop: '3px solid #f43f5e',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span
              style={{
                fontSize: '0.82rem',
                color: 'var(--text-dim)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                fontWeight: 700,
              }}
            >
              2. Total Expenses
            </span>
            <span
              style={{
                padding: '3px 8px',
                borderRadius: '6px',
                background: 'rgba(244, 63, 94, 0.12)',
                color: '#fb7185',
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              {formatPercent(expenseRatio)} Inflow Burn
            </span>
          </div>

          <div
            style={{
              fontSize: 'clamp(1.7rem, 2.2vw, 2.2rem)',
              fontWeight: 800,
              color: '#fb7185',
              fontFamily: 'Outfit, sans-serif',
              letterSpacing: '-0.02em',
              marginBottom: '6px',
            }}
          >
            {formatBDT(totalExpensesBDT, { parenthesesForNegative: true, currencyCode: true })}
          </div>

          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Led by 2-unit Macbook hardware capital advance and partner profit distributions.
          </p>

          <div style={{ background: 'rgba(255,255,255,0.06)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${Math.min(expenseRatio * 100, 100)}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #f43f5e, #fb923c)',
              }}
            />
          </div>
        </div>

        {/* Net Operating Balance Card */}
        <div
          className="glass-panel"
          style={{
            padding: '24px 26px',
            position: 'relative',
            overflow: 'hidden',
            borderTop: '3px solid #38bdf8',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span
              style={{
                fontSize: '0.82rem',
                color: 'var(--text-dim)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                fontWeight: 700,
              }}
            >
              3. Net Balance (Operating)
            </span>
            <span
              style={{
                padding: '3px 8px',
                borderRadius: '6px',
                background: 'rgba(56, 189, 248, 0.12)',
                color: '#38bdf8',
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              +{formatPercent(netMargin)} Margin
            </span>
          </div>

          <div
            style={{
              fontSize: 'clamp(1.7rem, 2.2vw, 2.2rem)',
              fontWeight: 800,
              color: '#38bdf8',
              fontFamily: 'Outfit, sans-serif',
              letterSpacing: '-0.02em',
              marginBottom: '6px',
            }}
          >
            {formatBDT(netBalanceBDT, { currencyCode: true })}
          </div>

          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Direct operating surplus (Total Income minus recorded Total Outflow).
          </p>

          <div style={{ background: 'rgba(255,255,255,0.06)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${Math.min(netMargin * 100, 100)}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #38bdf8, #818cf8)',
              }}
            />
          </div>
        </div>

        {/* Net Remaining Fund Balance (Final Summary) */}
        <div
          className="glass-panel"
          style={{
            padding: '24px 26px',
            position: 'relative',
            overflow: 'hidden',
            borderTop: '3px solid #c084fc',
            background: 'linear-gradient(180deg, rgba(168, 85, 247, 0.08) 0%, rgba(15, 23, 42, 0.7) 100%)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span
              style={{
                fontSize: '0.82rem',
                color: '#c084fc',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                fontWeight: 700,
              }}
            >
              6. Net Remaining Fund
            </span>
            <span
              style={{
                padding: '3px 8px',
                borderRadius: '6px',
                background: 'rgba(168, 85, 247, 0.2)',
                color: '#e9d5ff',
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              Audited Close
            </span>
          </div>

          <div
            style={{
              fontSize: 'clamp(1.7rem, 2.2vw, 2.2rem)',
              fontWeight: 800,
              color: '#e9d5ff',
              fontFamily: 'Outfit, sans-serif',
              letterSpacing: '-0.02em',
              marginBottom: '6px',
            }}
          >
            {formatBDT(netRemainingFundBalanceBDT, { currencyCode: true })}
          </div>

          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Verified bank and liquid cash holding balance as of August 31, 2026 closing.
          </p>

          <div style={{ background: 'rgba(255,255,255,0.06)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(90deg, #c084fc, #ec4899)' }} />
          </div>
        </div>
      </div>

      {/* Secondary Strategic Position Bar: Receivables, Liabilities, & Net Liquidity Projection */}
      <div
        className="glass-panel"
        style={{
          padding: '18px 24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          alignItems: 'center',
          background: 'rgba(15, 23, 42, 0.45)',
        }}
      >
        {/* Outstanding Receivables */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#34d399',
              fontSize: '1.2rem',
              flexShrink: 0,
            }}
          >
            📥
          </div>
          <div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Claims &amp; Receivables Due
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#34d399' }}>
              +{formatBDT(totalReceivablesBDT, { currencyCode: true })}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Tamim Advance (35k) + Dipu WP (7.5k)
            </div>
          </div>
        </div>

        {/* Outstanding Liabilities */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fb7185',
              fontSize: '1.2rem',
              flexShrink: 0,
            }}
          >
            📤
          </div>
          <div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Outstanding Liabilities Due
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fb7185' }}>
              -{formatBDT(totalLiabilitiesBDT, { currencyCode: true })}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Macbook 2-Unit Remaining Balance
            </div>
          </div>
        </div>

        {/* Net Projected Position */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'rgba(59, 130, 246, 0.12)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#60a5fa',
              fontSize: '1.2rem',
              flexShrink: 0,
            }}
          >
            ⚖️
          </div>
          <div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Projected Post-Settlement Position
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#60a5fa' }}>
              {formatBDT(projectedLiquidity, { currencyCode: true })}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              (Remaining Fund + Receivables - Liabilities)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
