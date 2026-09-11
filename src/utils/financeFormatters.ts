import { MonthlyFinancialReport } from '@/types/finance';

/**
 * Bangladeshi & International Currency Formatter
 * Formats numbers into the South Asian numbering system (Lakhs & Crores):
 * 619987.50 -> "6,19,987.50"
 */
export function formatBDT(
  amount: number,
  options: {
    symbol?: boolean;
    currencyCode?: boolean;
    parenthesesForNegative?: boolean;
  } = { symbol: false, currencyCode: true, parenthesesForNegative: false }
): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  // Split into whole and decimal
  const fixed = absAmount.toFixed(2);
  const [whole, decimals] = fixed.split('.');

  // South Asian formatting: last 3 digits, then groups of 2
  let formattedWhole = '';
  if (whole.length <= 3) {
    formattedWhole = whole;
  } else {
    const lastThree = whole.substring(whole.length - 3);
    const otherNumbers = whole.substring(0, whole.length - 3);
    const withCommas = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    formattedWhole = `${withCommas},${lastThree}`;
  }

  const numberString = `${formattedWhole}.${decimals}`;

  let result = numberString;
  if (options.symbol) {
    result = `৳ ${result}`;
  }
  if (options.currencyCode) {
    result = `${result} BDT`;
  }

  if (isNegative) {
    if (options.parenthesesForNegative) {
      return `(${result})`;
    }
    return `-${result}`;
  }

  return result;
}

/**
 * Format standard percentage
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Category color definitions for visual consistency
 */
export const CATEGORY_COLORS: Record<string, string> = {
  // Income
  'Client Retainer': '#10b981', // Emerald
  'Retained Fund': '#06b6d4', // Cyan
  'Freelance Escrow': '#3b82f6', // Blue
  'Bonus & Tips': '#8b5cf6', // Violet
  'Project Milestone': '#f59e0b', // Amber
  'Other Income': '#94a3b8',

  // Expenses
  'Capital Assets': '#ec4899', // Pink / Rose
  'Profit Share': '#3b82f6', // Blue
  'Debt Settlement': '#f97316', // Orange
  'Team Advances': '#eab308', // Yellow
  'Marketing & Growth': '#a855f7', // Purple
  'Software & SaaS': '#06b6d4', // Cyan
  'Office & Food': '#14b8a6', // Teal
  'Operations & Banking': '#64748b', // Slate
};

/**
 * Export full financial performance report as CSV
 */
export function exportReportToCSV(report: MonthlyFinancialReport): void {
  const rows: string[] = [];

  // Header
  rows.push(`"ZENTURA FINANCE - ${report.reportTitle.toUpperCase()}"`);
  rows.push(`"Reporting Period: ${report.period}"`);
  rows.push(`"Status: ${report.status}"`);
  rows.push(`"Generated At: ${new Date().toISOString()}"`);
  rows.push('');

  // 1. Executive Summary
  rows.push('"1. EXECUTIVE SUMMARY"');
  rows.push('"Metric","Amount (BDT)"');
  rows.push(`"Total Income","${report.executiveSummary.totalIncomeBDT.toFixed(2)}"`);
  rows.push(`"Total Expenses","(${report.executiveSummary.totalExpensesBDT.toFixed(2)})"`);
  rows.push(`"Net Operating Balance","${report.executiveSummary.netBalanceBDT.toFixed(2)}"`);
  rows.push(`"Net Remaining Fund Balance","${report.finalSummary.netRemainingFundBalanceBDT.toFixed(2)}"`);
  rows.push('');

  // 2. Income
  rows.push('"2. INCOME DETAILED BREAKDOWN"');
  rows.push('"Source / Description","Category","Amount (BDT)","Original Currency Details","Notes"');
  report.incomeItems.forEach((item) => {
    const orig = item.currencyMeta
      ? `${item.currencyMeta.originalAmount || ''} ${item.currencyMeta.originalCurrency || ''} (${item.currencyMeta.incentivesOrNotes || ''})`
      : 'BDT';
    rows.push(
      `"${item.source.replace(/"/g, '""')}","${item.category}","${item.amountBDT.toFixed(2)}","${orig.replace(/"/g, '""')}","${(item.notes || '').replace(/"/g, '""')}"`
    );
  });
  rows.push(`"Sub-Total Income","","${report.subTotalIncomeBDT.toFixed(2)}","",""`);
  rows.push('');

  // 3. Expenses
  rows.push('"3. EXPENSE DETAILED BREAKDOWN"');
  rows.push('"Category / Title","Group","Amount (BDT)","Payment Method","Notes / Status"');
  report.expenseItems.forEach((item) => {
    rows.push(
      `"${item.categoryTitle.replace(/"/g, '""')}","${item.categoryGroup}","${item.amountBDT.toFixed(2)}","${item.paymentMethod}","${(item.notes || '').replace(/"/g, '""')}"`
    );
  });
  rows.push(`"Total Expenses","","${report.totalExpensesBDT.toFixed(2)}","",""`);
  rows.push('');

  // 4. Liabilities
  rows.push('"4. OUTSTANDING LIABILITIES / DUE PAYMENTS"');
  rows.push('"Description","Counterparty","Initial Amount (BDT)","Paid (BDT)","Remaining Due (BDT)","Status","Notes"');
  report.outstandingLiabilities.forEach((item) => {
    rows.push(
      `"${item.description.replace(/"/g, '""')}","${item.vendorOrCreditor}","${item.totalInitialBDT.toFixed(2)}","${item.paidBDT.toFixed(2)}","${item.remainingDueBDT.toFixed(2)}","${item.status}","${(item.notes || '').replace(/"/g, '""')}"`
    );
  });
  rows.push(`"Total Outstanding Liabilities","","","","${report.totalLiabilitiesBDT.toFixed(2)}","",""`);
  rows.push('');

  // 5. Receivables
  rows.push('"5. OUTSTANDING RECEIVABLES"');
  rows.push('"Description","Debtor / Source","Receivable Amount (BDT)","Repayment Plan","Notes"');
  report.outstandingReceivables.forEach((item) => {
    rows.push(
      `"${item.description.replace(/"/g, '""')}","${item.debtorOrSource}","${item.totalReceivableBDT.toFixed(2)}","${item.repaymentPlan.replace(/"/g, '""')}","${(item.notes || '').replace(/"/g, '""')}"`
    );
  });
  rows.push(`"Total Outstanding Receivables","","${report.totalReceivablesBDT.toFixed(2)}","",""`);
  rows.push('');

  // 6. Verification
  rows.push('"6. AUDIT & VERIFICATION"');
  rows.push(`"Drive Ledger","${report.driveVerificationUrl}"`);
  rows.push(`"Final Reconciled Closing Balance","${report.finalSummary.netRemainingFundBalanceBDT.toFixed(2)} BDT"`);

  const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(rows.join('\n'));
  const link = document.createElement('a');
  link.setAttribute('href', csvContent);
  link.setAttribute('download', `Zentura_Finance_Report_${report.month}_${report.year}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
