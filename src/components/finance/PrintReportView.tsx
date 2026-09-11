'use client';

import React from 'react';
import { MonthlyFinancialReport } from '@/types/finance';
import { formatBDT } from '@/utils/financeFormatters';

interface PrintReportViewProps {
  report: MonthlyFinancialReport;
}

export function PrintReportView({ report }: PrintReportViewProps) {
  return (
    <div className="print-only-container">
      <style jsx global>{`
        @media screen {
          .print-only-container {
            display: none;
          }
        }
        @media print {
          body {
            background: #ffffff !important;
            color: #111827 !important;
          }
          header,
          footer,
          nav,
          .glass-panel-glow,
          .glass-panel,
          button,
          .interactive-ui {
            display: none !important;
          }
          .print-only-container {
            display: block !important;
            padding: 30px;
            font-family: 'Helvetica Neue', Arial, sans-serif;
            color: #111827;
            line-height: 1.5;
          }
          .print-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
            font-size: 10pt;
          }
          .print-table th,
          .print-table td {
            border: 1px solid #d1d5db;
            padding: 8px 10px;
            text-align: left;
          }
          .print-table th {
            background-color: #f3f4f6;
            font-weight: 700;
          }
          .print-header {
            border-bottom: 2px solid #111827;
            padding-bottom: 14px;
            margin-bottom: 20px;
          }
          .print-badge {
            display: inline-block;
            padding: 2px 8px;
            font-size: 8pt;
            border: 1px solid #374151;
            border-radius: 4px;
          }
          .page-break {
            page-break-before: always;
          }
        }
      `}</style>

      {/* Print Cover / Header */}
      <div className="print-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '20pt', margin: 0, fontWeight: 800 }}>{report.organization}</h1>
            <h2 style={{ fontSize: '14pt', margin: '4px 0 0', color: '#374151' }}>
              {report.reportTitle}
            </h2>
            <p style={{ fontSize: '9pt', color: '#6b7280', margin: '4px 0 0' }}>
              Reporting Period: {report.period} • Status: {report.status}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className="print-badge">AUDITED &amp; VERIFIED</span>
            <p style={{ fontSize: '8pt', color: '#6b7280', margin: '6px 0 0' }}>
              Printed: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* 1. Executive Summary */}
      <h3 style={{ fontSize: '12pt', borderBottom: '1px solid #9ca3af', paddingBottom: '4px', marginBottom: '8px' }}>
        1. Executive Summary
      </h3>
      <table className="print-table">
        <thead>
          <tr>
            <th>Metric</th>
            <th style={{ textAlign: 'right' }}>Amount (BDT)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Total Income</strong></td>
            <td style={{ textAlign: 'right', fontWeight: 700, color: '#047857' }}>
              {formatBDT(report.executiveSummary.totalIncomeBDT)}
            </td>
          </tr>
          <tr>
            <td><strong>Total Expenses</strong></td>
            <td style={{ textAlign: 'right', fontWeight: 700, color: '#b91c1c' }}>
              {formatBDT(report.executiveSummary.totalExpensesBDT, { parenthesesForNegative: true })}
            </td>
          </tr>
          <tr>
            <td><strong>Net Balance (Operating Surplus)</strong></td>
            <td style={{ textAlign: 'right', fontWeight: 700, color: '#1d4ed8' }}>
              {formatBDT(report.executiveSummary.netBalanceBDT)}
            </td>
          </tr>
          <tr style={{ background: '#f9fafb' }}>
            <td><strong>Net Remaining Fund Balance (August 2026 Close)</strong></td>
            <td style={{ textAlign: 'right', fontWeight: 800 }}>
              {formatBDT(report.finalSummary.netRemainingFundBalanceBDT)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* 2. Income Breakdown */}
      <h3 style={{ fontSize: '12pt', borderBottom: '1px solid #9ca3af', paddingBottom: '4px', marginBottom: '8px' }}>
        2. Income Detailed Breakdown
      </h3>
      <table className="print-table">
        <thead>
          <tr>
            <th>Source / Description</th>
            <th>Category</th>
            <th>Original Foreign Currency Details</th>
            <th style={{ textAlign: 'right' }}>Amount (BDT)</th>
          </tr>
        </thead>
        <tbody>
          {report.incomeItems.map((item) => (
            <tr key={item.id}>
              <td>
                <strong>{item.source}</strong>
                {item.notes && <div style={{ fontSize: '8pt', color: '#6b7280' }}>{item.notes}</div>}
              </td>
              <td>{item.category}</td>
              <td>
                {item.currencyMeta ? (
                  <span>
                    {item.currencyMeta.originalAmount} {item.currencyMeta.originalCurrency} ({item.currencyMeta.incentivesOrNotes})
                  </span>
                ) : (
                  'BDT'
                )}
              </td>
              <td style={{ textAlign: 'right', fontWeight: 600 }}>
                {formatBDT(item.amountBDT)}
              </td>
            </tr>
          ))}
          <tr style={{ background: '#f3f4f6', fontWeight: 700 }}>
            <td colSpan={3}>Sub-Total Income</td>
            <td style={{ textAlign: 'right' }}>{formatBDT(report.subTotalIncomeBDT)}</td>
          </tr>
        </tbody>
      </table>

      {/* 3. Expense Breakdown */}
      <h3 style={{ fontSize: '12pt', borderBottom: '1px solid #9ca3af', paddingBottom: '4px', marginBottom: '8px' }}>
        3. Expense Detailed Breakdown
      </h3>
      <table className="print-table">
        <thead>
          <tr>
            <th>Category / Detail</th>
            <th>Group</th>
            <th>Payment Method</th>
            <th style={{ textAlign: 'right' }}>Amount (BDT)</th>
          </tr>
        </thead>
        <tbody>
          {report.expenseItems.map((item) => (
            <tr key={item.id}>
              <td>
                <strong>{item.categoryTitle}</strong>
                {item.notes && <div style={{ fontSize: '8pt', color: '#6b7280' }}>{item.notes}</div>}
              </td>
              <td>{item.categoryGroup}</td>
              <td>{item.paymentMethod}</td>
              <td style={{ textAlign: 'right', fontWeight: 600 }}>
                {formatBDT(item.amountBDT)}
              </td>
            </tr>
          ))}
          <tr style={{ background: '#f3f4f6', fontWeight: 700 }}>
            <td colSpan={3}>Total Expenses</td>
            <td style={{ textAlign: 'right' }}>{formatBDT(report.totalExpensesBDT)}</td>
          </tr>
        </tbody>
      </table>

      {/* 4. Liabilities & Receivables */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '11pt', borderBottom: '1px solid #9ca3af', paddingBottom: '4px', marginBottom: '6px' }}>
            4. Outstanding Liabilities
          </h3>
          <table className="print-table">
            <thead>
              <tr>
                <th>Description</th>
                <th style={{ textAlign: 'right' }}>Amount (BDT)</th>
              </tr>
            </thead>
            <tbody>
              {report.outstandingLiabilities.map((l) => (
                <tr key={l.id}>
                  <td>
                    {l.description}
                    {l.notes && <div style={{ fontSize: '8pt', color: '#6b7280' }}>{l.notes}</div>}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatBDT(l.remainingDueBDT)}</td>
                </tr>
              ))}
              <tr style={{ background: '#f3f4f6', fontWeight: 700 }}>
                <td>Total Due</td>
                <td style={{ textAlign: 'right' }}>{formatBDT(report.totalLiabilitiesBDT)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div>
          <h3 style={{ fontSize: '11pt', borderBottom: '1px solid #9ca3af', paddingBottom: '4px', marginBottom: '6px' }}>
            Outstanding Receivables
          </h3>
          <table className="print-table">
            <thead>
              <tr>
                <th>Description</th>
                <th style={{ textAlign: 'right' }}>Amount (BDT)</th>
              </tr>
            </thead>
            <tbody>
              {report.outstandingReceivables.map((r) => (
                <tr key={r.id}>
                  <td>
                    {r.description}
                    <div style={{ fontSize: '8pt', color: '#6b7280' }}>Plan: {r.repaymentPlan}</div>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatBDT(r.totalReceivableBDT)}</td>
                </tr>
              ))}
              <tr style={{ background: '#f3f4f6', fontWeight: 700 }}>
                <td>Total Receivable</td>
                <td style={{ textAlign: 'right' }}>{formatBDT(report.totalReceivablesBDT)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Verification & 6. Final Summary */}
      <div style={{ borderTop: '2px solid #111827', paddingTop: '12px', fontSize: '9pt', color: '#4b5563' }}>
        <p>
          <strong>5. Digital Audit Verification:</strong> Direct receipts, banking statements, and invoices stored at:{' '}
          <span style={{ textDecoration: 'underline' }}>{report.driveVerificationUrl}</span>
        </p>
        <p style={{ marginTop: '4px' }}>
          <strong>6. Closing Declaration:</strong> {report.finalSummary.reconciliationNotes}
        </p>
      </div>
    </div>
  );
}
