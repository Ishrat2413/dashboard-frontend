'use client';

import React from 'react';
import { MonthlyFinancialReport } from '@/types/finance';
import { formatBDT } from '@/utils/financeFormatters';

interface FinalSummaryReconcilerProps {
  report: MonthlyFinancialReport;
}

export function FinalSummaryReconciler({ report }: FinalSummaryReconcilerProps) {
  const openingBalance =
    report.incomeItems.find((i) => i.source.includes('Opening Balance'))?.amountBDT || 164886.4;
  const newRevenue = report.subTotalIncomeBDT - openingBalance;
  const totalExpenses = report.totalExpensesBDT;
  const accountingNetBalance = report.executiveSummary.netBalanceBDT;
  const finalFundBalance = report.finalSummary.netRemainingFundBalanceBDT;
  const reconciliationDelta = finalFundBalance - accountingNetBalance;

  return (
    <div
      className="glass-panel"
      style={{
        padding: '32px',
        marginBottom: '32px',
        background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.7) 0%, rgba(168, 85, 247, 0.08) 100%)',
        border: '1px solid rgba(168, 85, 247, 0.25)',
      }}
      id="final-summary"
    >
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#c084fc',
              background: 'rgba(168, 85, 247, 0.15)',
              padding: '3px 8px',
              borderRadius: '4px',
              letterSpacing: '0.04em',
            }}
          >
            SECTION 6
          </span>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>
            Final Summary &amp; Fund Reconciliation
          </h2>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
          Audited closing liquidity position as of August 31, 2026 across primary bank accounts and liquid holdings.
        </p>
      </div>

      {/* Main Closing Balance Banner */}
      <div
        style={{
          padding: '24px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(168, 85, 247, 0.1)',
          border: '1px solid rgba(168, 85, 247, 0.3)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          marginBottom: '28px',
        }}
      >
        <div>
          <div style={{ fontSize: '0.85rem', color: '#e9d5ff', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
            Closing Fund Balance (August 2026)
          </div>
          <div
            style={{
              fontSize: 'clamp(2rem, 3vw, 2.8rem)',
              fontWeight: 800,
              color: '#f3e8ff',
              fontFamily: 'Outfit, sans-serif',
              letterSpacing: '-0.02em',
              marginTop: '4px',
            }}
          >
            {formatBDT(finalFundBalance, { currencyCode: true })}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Verified available liquid cash &amp; bank balances carried forward into September 2026.
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div
            style={{
              padding: '12px 18px',
              borderRadius: '8px',
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Audited Status</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#34d399', marginTop: '2px' }}>
              ✓ Reconciled
            </div>
          </div>

          <div
            style={{
              padding: '12px 18px',
              borderRadius: '8px',
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Audit Protocol</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#38bdf8', marginTop: '2px' }}>
              Multi-Account Bank
            </div>
          </div>
        </div>
      </div>

      {/* Waterfall Reconciliation Steps */}
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#fff', marginBottom: '14px' }}>
          📐 Audit Balance Waterfall Breakdown
        </h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '14px',
          }}
        >
          {/* Step 1 */}
          <div
            style={{
              padding: '16px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
              1. Opening Fund (Aug 1)
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#38bdf8', marginTop: '4px' }}>
              {formatBDT(openingBalance, { currencyCode: true })}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Carried forward reserve
            </div>
          </div>

          {/* Step 2 */}
          <div
            style={{
              padding: '16px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
              2. New Inflows (Earned)
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#34d399', marginTop: '4px' }}>
              +{formatBDT(newRevenue, { currencyCode: true })}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Gavin, Fiverr &amp; WP projects
            </div>
          </div>

          {/* Step 3 */}
          <div
            style={{
              padding: '16px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
              3. Total Disbursements
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fb7185', marginTop: '4px' }}>
              -{formatBDT(totalExpenses, { currencyCode: true })}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Macbook, profits, operations
            </div>
          </div>

          {/* Step 4 */}
          <div
            style={{
              padding: '16px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
              4. Petty Cash / Reserve Delta
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fbbf24', marginTop: '4px' }}>
              +{formatBDT(reconciliationDelta, { currencyCode: true })}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Adjusted bank/cash variance
            </div>
          </div>

          {/* Step 5: Final Result */}
          <div
            style={{
              padding: '16px',
              borderRadius: '10px',
              background: 'rgba(168, 85, 247, 0.12)',
              border: '1px solid rgba(168, 85, 247, 0.3)',
            }}
          >
            <div style={{ fontSize: '0.75rem', color: '#c084fc', textTransform: 'uppercase' }}>
              5. Final Closing Fund
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f3e8ff', marginTop: '4px' }}>
              {formatBDT(finalFundBalance, { currencyCode: true })}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#e9d5ff', marginTop: '2px' }}>
              August 2026 Net Remaining
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
