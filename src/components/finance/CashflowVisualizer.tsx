'use client';

import React, { useState } from 'react';
import { MonthlyFinancialReport } from '@/types/finance';
import { formatBDT, formatPercent, CATEGORY_COLORS } from '@/utils/financeFormatters';

interface CashflowVisualizerProps {
  report: MonthlyFinancialReport;
}

export function CashflowVisualizer({ report }: CashflowVisualizerProps) {
  const [activeTab, setActiveTab] = useState<'both' | 'income' | 'expense'>('both');
  const [hoveredIncome, setHoveredIncome] = useState<string | null>(null);
  const [hoveredExpense, setHoveredExpense] = useState<string | null>(null);

  const totalIncome = report.subTotalIncomeBDT;
  const totalExpense = report.totalExpensesBDT;

  // Aggregate expense groups
  const expenseGroupMap: Record<string, number> = {};
  report.expenseItems.forEach((exp) => {
    expenseGroupMap[exp.categoryGroup] = (expenseGroupMap[exp.categoryGroup] || 0) + exp.amountBDT;
  });

  const expenseGroups = Object.entries(expenseGroupMap)
    .map(([group, amount]) => ({
      group,
      amount,
      percentage: totalExpense > 0 ? amount / totalExpense : 0,
      color: CATEGORY_COLORS[group] || '#94a3b8',
    }))
    .sort((a, b) => b.amount - a.amount);

  // Income items sorted by magnitude
  const incomeItems = [...report.incomeItems]
    .map((item) => ({
      ...item,
      percentage: totalIncome > 0 ? item.amountBDT / totalIncome : 0,
      color: CATEGORY_COLORS[item.category] || '#10b981',
    }))
    .sort((a, b) => b.amountBDT - a.amountBDT);

  return (
    <div
      className="glass-panel"
      style={{
        padding: '28px',
        marginBottom: '32px',
      }}
    >
      {/* Header & Filter Pills */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📊</span> Capital Allocation &amp; Cashflow Visualizer
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Interactive proportional distribution of August revenue streams versus expenditure buckets.
          </p>
        </div>

        {/* Tab switchers */}
        <div
          style={{
            display: 'inline-flex',
            padding: '4px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <button
            onClick={() => setActiveTab('both')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.82rem',
              fontWeight: 600,
              background: activeTab === 'both' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'both' ? '#fff' : 'var(--text-muted)',
              transition: 'all var(--transition-fast)',
            }}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('income')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.82rem',
              fontWeight: 600,
              background: activeTab === 'income' ? '#06b6d4' : 'transparent',
              color: activeTab === 'income' ? '#fff' : 'var(--text-muted)',
              transition: 'all var(--transition-fast)',
            }}
          >
            Income Sources
          </button>
          <button
            onClick={() => setActiveTab('expense')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.82rem',
              fontWeight: 600,
              background: activeTab === 'expense' ? '#ec4899' : 'transparent',
              color: activeTab === 'expense' ? '#fff' : 'var(--text-muted)',
              transition: 'all var(--transition-fast)',
            }}
          >
            Expense Groups
          </button>
        </div>
      </div>

      {/* Primary Inflow vs Outflow Macro Comparison Bar */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '8px' }}>
          <span style={{ color: '#34d399', fontWeight: 600 }}>
            Inflow: {formatBDT(totalIncome, { currencyCode: true })} (100%)
          </span>
          <span style={{ color: '#fb7185', fontWeight: 600 }}>
            Outflow: {formatBDT(totalExpense, { currencyCode: true })} ({formatPercent(totalExpense / totalIncome)})
          </span>
        </div>

        {/* Macro Stacked Bar */}
        <div
          style={{
            height: '24px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-subtle)',
            overflow: 'hidden',
            display: 'flex',
            position: 'relative',
          }}
        >
          {/* Outflow Portion */}
          <div
            style={{
              width: `${(totalExpense / totalIncome) * 100}%`,
              background: 'linear-gradient(90deg, #f43f5e 0%, #ec4899 100%)',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              transition: 'all 0.3s ease',
            }}
            title={`Outflow: ${formatBDT(totalExpense)}`}
          >
            Utilized {formatPercent(totalExpense / totalIncome)}
          </div>

          {/* Retained Surplus Portion */}
          <div
            style={{
              width: `${((totalIncome - totalExpense) / totalIncome) * 100}%`,
              background: 'linear-gradient(90deg, #10b981 0%, #06b6d4 100%)',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#07090e',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              transition: 'all 0.3s ease',
            }}
            title={`Retained Operating Surplus: ${formatBDT(totalIncome - totalExpense)}`}
          >
            Surplus {formatPercent((totalIncome - totalExpense) / totalIncome)}
          </div>
        </div>
      </div>

      {/* Detailed Columns Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            activeTab === 'both' ? 'repeat(auto-fit, minmax(360px, 1fr))' : '1fr',
          gap: '24px',
        }}
      >
        {/* Income Breakdown */}
        {(activeTab === 'both' || activeTab === 'income') && (
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.25)',
              padding: '20px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(16, 185, 129, 0.15)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1rem', color: '#34d399', fontWeight: 700 }}>
                Income Streams ({incomeItems.length} Sources)
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                Total: {formatBDT(totalIncome, { currencyCode: true })}
              </span>
            </div>

            {/* Income Multi-segment Progress bar */}
            <div
              style={{
                height: '12px',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.05)',
                display: 'flex',
                overflow: 'hidden',
                marginBottom: '16px',
              }}
            >
              {incomeItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    width: `${item.percentage * 100}%`,
                    background: item.color,
                    height: '100%',
                    opacity: hoveredIncome && hoveredIncome !== item.id ? 0.35 : 1,
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={() => setHoveredIncome(item.id)}
                  onMouseLeave={() => setHoveredIncome(null)}
                  title={`${item.source}: ${formatBDT(item.amountBDT)} (${formatPercent(item.percentage)})`}
                />
              ))}
            </div>

            {/* Itemized List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {incomeItems.map((item) => (
                <div
                  key={item.id}
                  onMouseEnter={() => setHoveredIncome(item.id)}
                  onMouseLeave={() => setHoveredIncome(null)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background:
                      hoveredIncome === item.id ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    transition: 'background var(--transition-fast)',
                    cursor: 'default',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <span
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: item.color,
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          color: '#fff',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {item.source}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        {item.category}
                        {item.currencyMeta?.originalCurrency && (
                          <span> • {item.currencyMeta.originalAmount} {item.currencyMeta.originalCurrency}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#34d399' }}>
                      {formatBDT(item.amountBDT, { currencyCode: true })}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {formatPercent(item.percentage)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expense Breakdown */}
        {(activeTab === 'both' || activeTab === 'expense') && (
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.25)',
              padding: '20px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(244, 63, 94, 0.15)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1rem', color: '#fb7185', fontWeight: 700 }}>
                Expense Allocation ({expenseGroups.length} Categories)
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                Total: {formatBDT(totalExpense, { currencyCode: true })}
              </span>
            </div>

            {/* Expense Multi-segment Progress bar */}
            <div
              style={{
                height: '12px',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.05)',
                display: 'flex',
                overflow: 'hidden',
                marginBottom: '16px',
              }}
            >
              {expenseGroups.map((group) => (
                <div
                  key={group.group}
                  style={{
                    width: `${group.percentage * 100}%`,
                    background: group.color,
                    height: '100%',
                    opacity: hoveredExpense && hoveredExpense !== group.group ? 0.35 : 1,
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={() => setHoveredExpense(group.group)}
                  onMouseLeave={() => setHoveredExpense(null)}
                  title={`${group.group}: ${formatBDT(group.amount)} (${formatPercent(group.percentage)})`}
                />
              ))}
            </div>

            {/* Itemized List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {expenseGroups.map((group) => (
                <div
                  key={group.group}
                  onMouseEnter={() => setHoveredExpense(group.group)}
                  onMouseLeave={() => setHoveredExpense(null)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background:
                      hoveredExpense === group.group ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    transition: 'background var(--transition-fast)',
                    cursor: 'default',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <span
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: group.color,
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          color: '#fff',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {group.group}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        {group.group === 'Capital Assets' && 'Macbook Pro 2 units (Advance)'}
                        {group.group === 'Profit Share' && 'Saad, Tamim, Joy, Ishrat (25k each)'}
                        {group.group === 'Debt Settlement' && 'Saad Rayhan settlement'}
                        {group.group === 'Team Advances' && 'Tamim advance (Monthly deduct)'}
                        {group.group === 'Marketing & Growth' && 'Fiverr promoted gigs & growth'}
                        {group.group === 'Software & SaaS' && 'Claude, Gemini & Workspace'}
                        {group.group === 'Office & Food' && 'Consolidated office meal 1, 2, 3'}
                        {group.group === 'Operations & Banking' && 'Meeting, Bazar & NPSB fees'}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fb7185' }}>
                      {formatBDT(group.amount, { currencyCode: true })}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {formatPercent(group.percentage)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
