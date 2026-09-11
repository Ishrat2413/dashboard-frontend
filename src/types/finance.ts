/**
 * Zentura Finance — Type Definitions
 * Developer-friendly and strictly typed models for financial tracking,
 * ledger breakdowns, foreign currency conversions, and reconciliation.
 */

export type TransactionType = 'INCOME' | 'EXPENSE';

export type PaymentMethod =
  | 'BANK_TRANSFER'
  | 'CASH'
  | 'CARD'
  | 'PAYONEER'
  | 'CRYPTO'
  | 'PLATFORM_ESCROW';

export interface CurrencyMetadata {
  originalCurrency?: 'GBP' | 'USD' | 'EUR' | 'BDT';
  originalAmount?: number;
  exchangeRateEstimated?: number;
  incentivesOrNotes?: string;
}

export interface IncomeRecord {
  id: string;
  source: string;
  category:
    | 'Retained Fund'
    | 'Client Retainer'
    | 'Freelance Escrow'
    | 'Bonus & Tips'
    | 'Project Milestone'
    | 'Other Income';
  amountBDT: number;
  currencyMeta?: CurrencyMetadata;
  notes?: string;
  date: string;
  verified: boolean;
}

export interface ExpenseRecord {
  id: string;
  categoryTitle: string;
  categoryGroup:
    | 'Profit Share'
    | 'Capital Assets'
    | 'Debt Settlement'
    | 'Team Advances'
    | 'Marketing & Growth'
    | 'Software & SaaS'
    | 'Office & Food'
    | 'Operations & Banking';
  amountBDT: number;
  paymentMethod: string;
  paymentMethodType?: PaymentMethod;
  notes?: string;
  remainingLiabilityBDT?: number;
  status: 'Completed' | 'Partially Paid' | 'Advance Receivable' | 'Recurring';
  date: string;
  verified: boolean;
}

export interface LiabilityRecord {
  id: string;
  description: string;
  vendorOrCreditor: string;
  totalInitialBDT: number;
  paidBDT: number;
  remainingDueBDT: number;
  status: 'Due' | 'Partially Paid' | 'Settled';
  notes?: string;
  dueDate?: string;
}

export interface ReceivableRecord {
  id: string;
  description: string;
  debtorOrSource: string;
  totalReceivableBDT: number;
  repaymentPlan: string;
  status: 'Pending' | 'In Progress' | 'Collected';
  notes?: string;
}

export interface MonthlyFinancialReport {
  organization: string;
  reportTitle: string;
  period: string;
  month: string;
  year: number;
  status: 'Audited' | 'Draft' | 'Closed';
  driveVerificationUrl: string;

  // 1. Executive Summary
  executiveSummary: {
    totalIncomeBDT: number;
    totalExpensesBDT: number;
    netBalanceBDT: number;
  };

  // 2. Income Detailed Breakdown
  incomeItems: IncomeRecord[];
  subTotalIncomeBDT: number;

  // 3. Expense Detailed Breakdown
  expenseItems: ExpenseRecord[];
  totalExpensesBDT: number;

  // 4. Outstanding Obligations
  outstandingLiabilities: LiabilityRecord[];
  totalLiabilitiesBDT: number;
  outstandingReceivables: ReceivableRecord[];
  totalReceivablesBDT: number;

  // 6. Final Summary
  finalSummary: {
    netRemainingFundBalanceBDT: number;
    reconciliationNotes?: string;
  };
}
