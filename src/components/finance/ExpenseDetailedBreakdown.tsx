'use client';

import React, { useState, useMemo } from 'react';
import { ExpenseRecord } from '@/types/finance';
import { formatBDT, formatPercent, CATEGORY_COLORS } from '@/utils/financeFormatters';

interface ExpenseDetailedBreakdownProps {
  items: ExpenseRecord[];
  totalExpensesBDT: number;
}

export function ExpenseDetailedBreakdown({ items, totalExpensesBDT }: ExpenseDetailedBreakdownProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'amount-desc' | 'amount-asc' | 'date-desc' | 'name'>('amount-desc');

  // Unique groups
  const groups = useMemo(() => {
    const set = new Set(items.map((i) => i.categoryGroup));
    return ['ALL', ...Array.from(set)];
  }, [items]);

  // Filter & sort
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        const matchesSearch =
          item.categoryTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
          item.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesGroup = selectedGroup === 'ALL' || item.categoryGroup === selectedGroup;
        return matchesSearch && matchesGroup;
      })
      .sort((a, b) => {
        if (sortBy === 'amount-desc') return b.amountBDT - a.amountBDT;
        if (sortBy === 'amount-asc') return a.amountBDT - b.amountBDT;
        if (sortBy === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
        return a.categoryTitle.localeCompare(b.categoryTitle);
      });
  }, [items, searchTerm, selectedGroup, sortBy]);

  const filteredSum = filteredItems.reduce((acc, curr) => acc + curr.amountBDT, 0);

  return (
    <div
      className="glass-panel"
      style={{
        padding: '28px',
        marginBottom: '32px',
      }}
      id="expense-breakdown"
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#fb7185',
                background: 'rgba(244, 63, 94, 0.1)',
                padding: '3px 8px',
                borderRadius: '4px',
                letterSpacing: '0.04em',
              }}
            >
              SECTION 3
            </span>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>
              Expense Detailed Breakdown
            </h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Complete audit of partner distributions, capital hardware assets, debt repayments, and operating costs.
          </p>
        </div>

        {/* Total Expenses Ticker */}
        <div
          style={{
            textAlign: 'right',
            padding: '10px 18px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(244, 63, 94, 0.08)',
            border: '1px solid rgba(244, 63, 94, 0.25)',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Total Expenses
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fb7185' }}>
            {formatBDT(totalExpensesBDT, { parenthesesForNegative: true, currencyCode: true })}
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}
      >
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: '340px' }}>
          <input
            type="text"
            placeholder="Search category, detail, note..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field"
            style={{ padding: '8px 14px 8px 34px', fontSize: '0.88rem' }}
          />
          <span
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-dim)',
              fontSize: '0.85rem',
            }}
          >
            🔍
          </span>
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {groups.map((group) => (
            <button
              key={group}
              onClick={() => setSelectedGroup(group)}
              style={{
                padding: '5px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem',
                fontWeight: 600,
                background:
                  selectedGroup === group ? '#f43f5e' : 'rgba(255, 255, 255, 0.05)',
                color: selectedGroup === group ? '#fff' : 'var(--text-muted)',
                border: '1px solid',
                borderColor:
                  selectedGroup === group ? 'transparent' : 'var(--border-subtle)',
                transition: 'all var(--transition-fast)',
              }}
            >
              {group}
            </button>
          ))}
        </div>

        {/* Sort Select */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="input-field"
          style={{ width: 'auto', padding: '6px 12px', fontSize: '0.82rem' }}
        >
          <option value="amount-desc">Amount: High to Low</option>
          <option value="amount-asc">Amount: Low to High</option>
          <option value="date-desc">Date (Latest)</option>
          <option value="name">Alphabetical</option>
        </select>
      </div>

      {/* Table Container */}
      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            fontSize: '0.9rem',
          }}
        >
          <thead>
            <tr
              style={{
                borderBottom: '1px solid var(--border-medium)',
                color: 'var(--text-dim)',
                fontSize: '0.78rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              <th style={{ padding: '12px 14px' }}>Category / Detail</th>
              <th style={{ padding: '12px 14px' }}>Group</th>
              <th style={{ padding: '12px 14px' }}>Payment Method</th>
              <th style={{ padding: '12px 14px', textAlign: 'right' }}>Share %</th>
              <th style={{ padding: '12px 14px', textAlign: 'right' }}>Amount (BDT)</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item, idx) => {
              const share = totalExpensesBDT > 0 ? item.amountBDT / totalExpensesBDT : 0;
              const catColor = CATEGORY_COLORS[item.categoryGroup] || '#f43f5e';

              return (
                <tr
                  key={item.id}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    background: idx % 2 === 0 ? 'rgba(255, 255, 255, 0.015)' : 'transparent',
                    transition: 'background var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      idx % 2 === 0 ? 'rgba(255, 255, 255, 0.015)' : 'transparent';
                  }}
                >
                  {/* Title & Notes */}
                  <td style={{ padding: '14px' }}>
                    <div style={{ fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{item.categoryTitle}</span>
                      {item.verified && (
                        <span
                          title="Verified against digital banking receipt"
                          style={{ color: '#34d399', fontSize: '0.8rem', cursor: 'help' }}
                        >
                          ✓
                        </span>
                      )}
                    </div>

                    {/* Context Notes */}
                    {item.notes && (
                      <div style={{ marginTop: '4px', display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                        {item.remainingLiabilityBDT ? (
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              background: 'rgba(244, 63, 94, 0.15)',
                              color: '#fb7185',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              border: '1px solid rgba(244, 63, 94, 0.3)',
                            }}
                          >
                            ⚠️ Amount left: {formatBDT(item.remainingLiabilityBDT, { currencyCode: true })}
                          </span>
                        ) : null}

                        {item.status === 'Advance Receivable' && (
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              background: 'rgba(245, 158, 11, 0.15)',
                              color: '#fbbf24',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              border: '1px solid rgba(245, 158, 11, 0.3)',
                            }}
                          >
                            🔄 Outstanding Receivable (Repayment Plan: Monthly)
                          </span>
                        )}

                        <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                          {item.notes}
                        </span>
                      </div>
                    )}
                  </td>

                  {/* Category Group */}
                  <td style={{ padding: '14px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: `${catColor}1a`,
                        color: catColor,
                        border: `1px solid ${catColor}33`,
                      }}
                    >
                      {item.categoryGroup}
                    </span>
                  </td>

                  {/* Payment Method */}
                  <td style={{ padding: '14px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.8rem',
                        color: 'var(--text-main)',
                      }}
                    >
                      {item.paymentMethod.includes('Bank') ? '🏦' : item.paymentMethod.includes('Card') ? '💳' : '💵'}
                      {item.paymentMethod}
                    </span>
                  </td>

                  {/* Proportional Share */}
                  <td style={{ padding: '14px', textAlign: 'right' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {formatPercent(share)}
                    </span>
                  </td>

                  {/* Amount (BDT) */}
                  <td style={{ padding: '14px', textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, color: '#fb7185', fontSize: '0.98rem' }}>
                      {formatBDT(item.amountBDT, { currencyCode: true })}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr
              style={{
                borderTop: '2px solid var(--border-medium)',
                background: 'rgba(244, 63, 94, 0.04)',
                fontWeight: 700,
              }}
            >
              <td colSpan={3} style={{ padding: '16px 14px' }}>
                <span style={{ color: '#fff' }}>
                  {filteredItems.length < items.length
                    ? `Filtered Total (${filteredItems.length} items)`
                    : 'Total Expenses'}
                </span>
              </td>
              <td style={{ padding: '16px 14px', textAlign: 'right', color: 'var(--text-muted)' }}>
                {filteredItems.length === items.length ? '100.0%' : formatPercent(filteredSum / totalExpensesBDT)}
              </td>
              <td style={{ padding: '16px 14px', textAlign: 'right', color: '#fb7185', fontSize: '1.15rem' }}>
                {formatBDT(filteredSum, { parenthesesForNegative: true, currencyCode: true })}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
