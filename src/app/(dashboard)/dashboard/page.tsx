'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { AUGUST_2026_FINANCIAL_REPORT } from '@/data/augustFinanceData';
import { MonthlyFinancialReport, IncomeRecord, ExpenseRecord } from '@/types/finance';
import { getReportByMonth } from '@/services/finance.service';

// Financial Components
import { FinanceHeader } from '@/components/finance/FinanceHeader';
import { ExecutiveSummaryCards } from '@/components/finance/ExecutiveSummaryCards';
import { CashflowVisualizer } from '@/components/finance/CashflowVisualizer';
import { IncomeDetailedBreakdown } from '@/components/finance/IncomeDetailedBreakdown';
import { ExpenseDetailedBreakdown } from '@/components/finance/ExpenseDetailedBreakdown';
import { LiabilitiesAndReceivables } from '@/components/finance/LiabilitiesAndReceivables';
import { VerificationDriveSection } from '@/components/finance/VerificationDriveSection';
import { FinalSummaryReconciler } from '@/components/finance/FinalSummaryReconciler';
import { AddTransactionModal } from '@/components/finance/AddTransactionModal';
import { PrintReportView } from '@/components/finance/PrintReportView';

export default function DashboardPage() {
  const { user, isAuthenticated, logout } = useAuth();
  const toast = useToast();

  // State initialized with static data first (instant render), then upgraded
  // to live API data once the fetch completes.
  const [report, setReport] = useState<MonthlyFinancialReport>(AUGUST_2026_FINANCIAL_REPORT);
  const [isModified, setIsModified] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showAdminTools, setShowAdminTools] = useState(false);
  const [isLoadingLiveData, setIsLoadingLiveData] = useState(true);
  const [dataSource, setDataSource] = useState<'live' | 'offline'>('offline');

  // Fetch-and-refresh helper — used on mount and by handleResetReport.
  const fetchLiveReport = useCallback(() => {
    setIsLoadingLiveData(true);
    getReportByMonth(2026, 'August')
      .then((liveReport) => {
        setReport(liveReport);
        setDataSource('live');
      })
      .catch(() => {
        setDataSource('offline');
      })
      .finally(() => {
        setIsLoadingLiveData(false);
      });
  }, []);

  useEffect(() => {
    fetchLiveReport();
  }, [fetchLiveReport]);

  // Recalculate financial report totals dynamically when items change
  const recalculateReport = (incomeList: IncomeRecord[], expenseList: ExpenseRecord[]) => {
    const subTotalIncome = incomeList.reduce((acc, curr) => acc + curr.amountBDT, 0);
    const totalExpenses = expenseList.reduce((acc, curr) => acc + curr.amountBDT, 0);
    const netBalance = subTotalIncome - totalExpenses;

    // Maintain closing reserve difference or re-derive
    const closingFund = report.finalSummary.netRemainingFundBalanceBDT + (netBalance - report.executiveSummary.netBalanceBDT);

    setReport((prev) => ({
      ...prev,
      incomeItems: incomeList,
      subTotalIncomeBDT: subTotalIncome,
      expenseItems: expenseList,
      totalExpensesBDT: totalExpenses,
      executiveSummary: {
        totalIncomeBDT: subTotalIncome,
        totalExpensesBDT: totalExpenses,
        netBalanceBDT: netBalance,
      },
      finalSummary: {
        ...prev.finalSummary,
        netRemainingFundBalanceBDT: closingFund,
      },
    }));
    setIsModified(true);
  };

  const handleAddIncome = (newItem: IncomeRecord) => {
    const updated = [newItem, ...report.incomeItems];
    recalculateReport(updated, report.expenseItems);
    toast.success(`Inflow added: ${newItem.source}`);
  };

  const handleAddExpense = (newItem: ExpenseRecord) => {
    const updated = [newItem, ...report.expenseItems];
    recalculateReport(report.incomeItems, updated);
    toast.success(`Expense added: ${newItem.categoryTitle}`);
  };

  const handleResetReport = () => {
    // If live data is available, restore from live API; otherwise static fallback
    if (dataSource === 'live') {
      void fetchLiveReport();
      toast.info('Refreshing from live API...');
    } else {
      setReport(AUGUST_2026_FINANCIAL_REPORT);
      setIsModified(false);
      toast.info('Restored original audited August 2026 ledger.');
    }
    setIsModified(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px 80px', width: '100%' }}>
      {/* Print View Component (Invisible on screen, styled for paper/PDF) */}
      <PrintReportView report={report} />

      {/* Screen Interactive Container */}
      <div className="interactive-ui">
        {/* Data source indicator — live API or static fallback */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 600,
              letterSpacing: '0.05em',
              padding: '3px 10px',
              borderRadius: '999px',
              background: isLoadingLiveData
                ? 'rgba(99, 102, 241, 0.12)'
                : dataSource === 'live'
                  ? 'rgba(16, 185, 129, 0.12)'
                  : 'rgba(251, 191, 36, 0.12)',
              color: isLoadingLiveData
                ? '#818cf8'
                : dataSource === 'live'
                  ? '#10b981'
                  : '#f59e0b',
              border: `1px solid ${isLoadingLiveData ? 'rgba(99,102,241,0.2)' : dataSource === 'live' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}`,
            }}
          >
            {isLoadingLiveData ? '⟳ Fetching live data…' : dataSource === 'live' ? '● Live API' : '◎ Offline mode'}
          </span>
        </div>

        {/* Guest Auditor Notice Banner (if unauthenticated) */}
        {!isAuthenticated && (
          <div
            style={{
              padding: '12px 20px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(6, 182, 212, 0.08)',
              border: '1px solid rgba(6, 182, 212, 0.25)',
              marginBottom: '20px',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.2rem' }}>🌐</span>
              <span style={{ fontSize: '0.88rem', color: 'var(--text-main)' }}>
                <strong>Auditor Access Mode:</strong> You are reviewing the live verified August 2026 Financial
                Performance Report for <strong>Zentura Finance</strong>.
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Link
                href="/login"
                className="btn-secondary"
                style={{ padding: '6px 14px', fontSize: '0.82rem' }}
              >
                Sign In to Platform →
              </Link>
            </div>
          </div>
        )}

        {/* Authenticated User Session Strip (if authenticated) */}
        {isAuthenticated && (
          <div
            style={{
              padding: '10px 18px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              marginBottom: '20px',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1rem' }}>👤</span>
              <span style={{ fontSize: '0.86rem', color: 'var(--text-main)' }}>
                Active Session: <strong>{user?.name}</strong> ({user?.email}) • Role:{' '}
                <span className={user?.role === 'ADMIN' ? 'badge badge-admin' : 'badge badge-customer'}>
                  {user?.role}
                </span>
              </span>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              {user?.role === 'ADMIN' && (
                <button
                  onClick={() => setShowAdminTools(!showAdminTools)}
                  style={{
                    fontSize: '0.8rem',
                    color: '#fb7185',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: 'rgba(244, 63, 94, 0.1)',
                  }}
                >
                  {showAdminTools ? 'Hide Admin Bar' : 'Admin Bar'}
                </button>
              )}
              <Link
                href="/profile"
                style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}
              >
                Profile Settings
              </Link>
              <button
                onClick={() => logout()}
                style={{ fontSize: '0.82rem', color: '#fb7185' }}
              >
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Section Jump Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '8px',
            marginBottom: '20px',
          }}
        >
          <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
            Jump to:
          </span>
          <a
            href="#executive-summary"
            style={{
              fontSize: '0.8rem',
              padding: '4px 10px',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)',
              whiteSpace: 'nowrap',
            }}
          >
            1. Executive Summary
          </a>
          <a
            href="#cashflow-visualizer"
            style={{
              fontSize: '0.8rem',
              padding: '4px 10px',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)',
              whiteSpace: 'nowrap',
            }}
          >
            Proportional Charts
          </a>
          <a
            href="#income-breakdown"
            style={{
              fontSize: '0.8rem',
              padding: '4px 10px',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)',
              whiteSpace: 'nowrap',
            }}
          >
            2. Income Breakdown
          </a>
          <a
            href="#expense-breakdown"
            style={{
              fontSize: '0.8rem',
              padding: '4px 10px',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)',
              whiteSpace: 'nowrap',
            }}
          >
            3. Expense Breakdown
          </a>
          <a
            href="#liabilities-receivables"
            style={{
              fontSize: '0.8rem',
              padding: '4px 10px',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)',
              whiteSpace: 'nowrap',
            }}
          >
            4. Liabilities &amp; Receivables
          </a>
          <a
            href="#verification"
            style={{
              fontSize: '0.8rem',
              padding: '4px 10px',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)',
              whiteSpace: 'nowrap',
            }}
          >
            5. Verification Drive
          </a>
          <a
            href="#final-summary"
            style={{
              fontSize: '0.8rem',
              padding: '4px 10px',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)',
              whiteSpace: 'nowrap',
            }}
          >
            6. Final Reconciliation
          </a>
        </div>

        {/* Top Header Card */}
        <FinanceHeader
          report={report}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          onPrintReport={handlePrint}
          isModified={isModified}
          onResetReport={handleResetReport}
          userName={user?.name}
          userRole={user?.role}
        />

        {/* 1. Executive Summary Cards */}
        <div id="executive-summary">
          <ExecutiveSummaryCards report={report} />
        </div>

        {/* Proportional Cashflow Visualizer */}
        <div id="cashflow-visualizer">
          <CashflowVisualizer report={report} />
        </div>

        {/* 2. Income Detailed Breakdown */}
        <IncomeDetailedBreakdown
          items={report.incomeItems}
          subTotalBDT={report.subTotalIncomeBDT}
        />

        {/* 3. Expense Detailed Breakdown */}
        <ExpenseDetailedBreakdown
          items={report.expenseItems}
          totalExpensesBDT={report.totalExpensesBDT}
        />

        {/* 4. Outstanding Liabilities & Receivables */}
        <LiabilitiesAndReceivables
          liabilities={report.outstandingLiabilities}
          receivables={report.outstandingReceivables}
          totalLiabilitiesBDT={report.totalLiabilitiesBDT}
          totalReceivablesBDT={report.totalReceivablesBDT}
        />

        {/* 5. Verification Drive Repository */}
        <VerificationDriveSection driveUrl={report.driveVerificationUrl} />

        {/* 6. Final Summary & Waterfall Reconciliation */}
        <FinalSummaryReconciler report={report} />

        {/* Admin Tools Drawer (if Admin & Toggled) */}
        {user?.role === 'ADMIN' && showAdminTools && (
          <div
            className="glass-panel"
            style={{
              padding: '24px',
              marginBottom: '32px',
              borderLeft: '4px solid #fb7185',
            }}
          >
            <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Admin Infrastructure Console</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '14px' }}>
              Inspect transactional Fastify / BullMQ queues, Swagger API contracts, and Prometheus metrics.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link href="/admin/email-test" className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                Open Email Test Console →
              </Link>
              <a
                href="http://localhost:8080/api-doc"
                target="_blank"
                rel="noreferrer"
                className="btn-secondary"
                style={{ padding: '8px 14px', fontSize: '0.85rem' }}
              >
                Swagger API UI ↗
              </a>
              <a
                href="http://localhost:8080/metrics"
                target="_blank"
                rel="noreferrer"
                className="btn-secondary"
                style={{ padding: '8px 14px', fontSize: '0.85rem' }}
              >
                Prometheus Metrics ↗
              </a>
            </div>
          </div>
        )}

        {/* Add Entry Modal */}
        <AddTransactionModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAddIncome={handleAddIncome}
          onAddExpense={handleAddExpense}
        />
      </div>
    </div>
  );
}
