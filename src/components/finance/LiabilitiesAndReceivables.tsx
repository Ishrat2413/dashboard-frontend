'use client';

import React from 'react';
import { LiabilityRecord, ReceivableRecord } from '@/types/finance';
import { formatBDT } from '@/utils/financeFormatters';

interface LiabilitiesAndReceivablesProps {
  liabilities: LiabilityRecord[];
  receivables: ReceivableRecord[];
  totalLiabilitiesBDT: number;
  totalReceivablesBDT: number;
}

export function LiabilitiesAndReceivables({
  liabilities,
  receivables,
  totalLiabilitiesBDT,
  totalReceivablesBDT,
}: LiabilitiesAndReceivablesProps) {
  const netClaimsDeficit = totalReceivablesBDT - totalLiabilitiesBDT;

  return (
    <div
      className="glass-panel"
      style={{
        padding: '28px',
        marginBottom: '32px',
      }}
      id="liabilities-receivables"
    >
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#f59e0b',
              background: 'rgba(245, 158, 11, 0.1)',
              padding: '3px 8px',
              borderRadius: '4px',
              letterSpacing: '0.04em',
            }}
          >
            SECTION 4
          </span>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>
            Outstanding Liabilities &amp; Receivables
          </h2>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          Future cash commitment schedule versus recognized outstanding claims and client milestone recoveries.
        </p>
      </div>

      {/* Two Column Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '24px',
        }}
      >
        {/* Outstanding Liabilities Panel */}
        <div
          style={{
            background: 'rgba(244, 63, 94, 0.04)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(244, 63, 94, 0.2)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
              paddingBottom: '12px',
              borderBottom: '1px solid rgba(244, 63, 94, 0.15)',
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#fb7185',
                }}
              >
                Outstanding Liabilities / Due Payments
              </span>
              <h3 style={{ fontSize: '1.05rem', color: '#fff', marginTop: '2px' }}>
                Future Outflow Commitments
              </h3>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fb7185' }}>
                {formatBDT(totalLiabilitiesBDT, { currencyCode: true })}
              </span>
            </div>
          </div>

          {/* List of Liabilities */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
            {liabilities.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: '14px 16px',
                  borderRadius: '10px',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                  <div>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 600, color: '#fff' }}>
                      {item.description}
                    </h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                      Vendor / Creditor: <strong style={{ color: 'var(--text-muted)' }}>{item.vendorOrCreditor}</strong>
                    </p>
                  </div>
                  <span
                    style={{
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      background: 'rgba(244, 63, 94, 0.15)',
                      color: '#fb7185',
                      border: '1px solid rgba(244, 63, 94, 0.3)',
                    }}
                  >
                    {item.status}
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '12px',
                    paddingTop: '10px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                    Paid: {formatBDT(item.paidBDT)} / Total: {formatBDT(item.totalInitialBDT)}
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fb7185' }}>
                    Due: {formatBDT(item.remainingDueBDT, { currencyCode: true })}
                  </div>
                </div>

                {item.notes && (
                  <div
                    style={{
                      fontSize: '0.76rem',
                      color: 'var(--text-muted)',
                      marginTop: '8px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      padding: '6px 10px',
                      borderRadius: '6px',
                    }}
                  >
                    Note: {item.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Outstanding Receivables Panel */}
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.04)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
              paddingBottom: '12px',
              borderBottom: '1px solid rgba(16, 185, 129, 0.15)',
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#34d399',
                }}
              >
                Outstanding Receivables
              </span>
              <h3 style={{ fontSize: '1.05rem', color: '#fff', marginTop: '2px' }}>
                Incoming Claims &amp; Advances
              </h3>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#34d399' }}>
                {formatBDT(totalReceivablesBDT, { currencyCode: true })}
              </span>
            </div>
          </div>

          {/* List of Receivables */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
            {receivables.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: '14px 16px',
                  borderRadius: '10px',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                  <div>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 600, color: '#fff' }}>
                      {item.description}
                    </h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                      Debtor / Source: <strong style={{ color: 'var(--text-muted)' }}>{item.debtorOrSource}</strong>
                    </p>
                  </div>
                  <span
                    style={{
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: '#34d399',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                    }}
                  >
                    {item.status}
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '12px',
                    paddingTop: '10px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                    Repayment: <span style={{ color: 'var(--text-main)' }}>{item.repaymentPlan}</span>
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#34d399' }}>
                    {formatBDT(item.totalReceivableBDT, { currencyCode: true })}
                  </div>
                </div>

                {item.notes && (
                  <div
                    style={{
                      fontSize: '0.76rem',
                      color: 'var(--text-muted)',
                      marginTop: '8px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      padding: '6px 10px',
                      borderRadius: '6px',
                    }}
                  >
                    Note: {item.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Net Obligation Summary Ribbon */}
      <div
        style={{
          marginTop: '20px',
          padding: '14px 20px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.1rem' }}>📌</span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Net Future Obligations Balance (Receivables minus Liabilities):
          </span>
        </div>
        <div
          style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: netClaimsDeficit < 0 ? '#fb7185' : '#34d399',
          }}
        >
          {formatBDT(netClaimsDeficit, { parenthesesForNegative: true, currencyCode: true })}
        </div>
      </div>
    </div>
  );
}
