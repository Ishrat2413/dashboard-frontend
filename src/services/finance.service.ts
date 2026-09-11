/**
 * @fileoverview Finance API service layer.
 *
 * Wraps all calls to the NestJS /api/v1/reports/* endpoints.
 * Returns typed `MonthlyFinancialReport` shapes that are compatible
 * with the existing frontend components — no component rewrites needed.
 *
 * The `toFrontendReport` mapper converts the API's snake_case, enum-string
 * response into the camelCase / union-type shape that the frontend types use.
 */

import { apiRequest } from '@/lib/api-client';
import type {
  MonthlyFinancialReport,
  IncomeRecord,
  ExpenseRecord,
  LiabilityRecord,
  ReceivableRecord,
} from '@/types/finance';

// ─── Backend response shapes (snake_case from Prisma) ────────────────────────

interface ApiIncomeRecord {
  id: string;
  source: string;
  category: string;
  amount_bdt: number;
  currency_meta?: {
    originalCurrency?: string;
    originalAmount?: number;
    exchangeRateEstimated?: number;
    incentivesOrNotes?: string;
  } | null;
  notes?: string;
  date: string;
  verified: boolean;
}

interface ApiExpenseRecord {
  id: string;
  category_title: string;
  category_group: string;
  amount_bdt: number;
  payment_method: string;
  payment_method_type?: string;
  remaining_liability_bdt?: number;
  notes?: string;
  status: string;
  date: string;
  verified: boolean;
}

interface ApiLiabilityRecord {
  id: string;
  description: string;
  vendor_or_creditor: string;
  total_initial_bdt: number;
  paid_bdt: number;
  remaining_due_bdt: number;
  status: string;
  notes?: string;
  due_date?: string;
}

interface ApiReceivableRecord {
  id: string;
  description: string;
  debtor_or_source: string;
  total_receivable_bdt: number;
  repayment_plan: string;
  status: string;
  notes?: string;
}

interface ApiFullReport {
  id: string;
  organization: string;
  report_title: string;
  period: string;
  month: string;
  year: number;
  status: string;
  drive_verification_url?: string;
  total_income_bdt: number;
  total_expenses_bdt: number;
  net_balance_bdt: number;
  sub_total_income_bdt: number;
  total_liabilities_bdt: number;
  total_receivables_bdt: number;
  net_remaining_fund_balance_bdt: number;
  reconciliation_notes?: string;
  income_records: ApiIncomeRecord[];
  expense_records: ApiExpenseRecord[];
  liability_records: ApiLiabilityRecord[];
  receivable_records: ApiReceivableRecord[];
  created_at: string;
  updated_at?: string;
}

// ─── Enum mappers (API enum → frontend union types) ───────────────────────────

const INCOME_CATEGORY_MAP: Record<string, IncomeRecord['category']> = {
  RETAINED_FUND: 'Retained Fund',
  CLIENT_RETAINER: 'Client Retainer',
  FREELANCE_ESCROW: 'Freelance Escrow',
  BONUS_AND_TIPS: 'Bonus & Tips',
  PROJECT_MILESTONE: 'Project Milestone',
  OTHER_INCOME: 'Other Income',
};

const EXPENSE_STATUS_MAP: Record<string, ExpenseRecord['status']> = {
  COMPLETED: 'Completed',
  PARTIALLY_PAID: 'Partially Paid',
  ADVANCE_RECEIVABLE: 'Advance Receivable',
  RECURRING: 'Recurring',
};

const LIABILITY_STATUS_MAP: Record<string, LiabilityRecord['status']> = {
  DUE: 'Due',
  PARTIALLY_PAID: 'Partially Paid',
  SETTLED: 'Settled',
};

const RECEIVABLE_STATUS_MAP: Record<string, ReceivableRecord['status']> = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  COLLECTED: 'Collected',
};

// ─── Mapper: API response → MonthlyFinancialReport ───────────────────────────

function toFrontendReport(api: ApiFullReport): MonthlyFinancialReport {
  return {
    organization: api.organization,
    reportTitle: api.report_title,
    period: api.period,
    month: api.month,
    year: api.year,
    status: api.status as MonthlyFinancialReport['status'],
    driveVerificationUrl: api.drive_verification_url ?? '',

    executiveSummary: {
      totalIncomeBDT: api.total_income_bdt,
      totalExpensesBDT: api.total_expenses_bdt,
      netBalanceBDT: api.net_balance_bdt,
    },

    incomeItems: api.income_records.map((inc): IncomeRecord => ({
      id: inc.id,
      source: inc.source,
      category: (INCOME_CATEGORY_MAP[inc.category] ?? 'Other Income'),
      amountBDT: inc.amount_bdt,
      currencyMeta: inc.currency_meta
        ? {
            originalCurrency: inc.currency_meta.originalCurrency as IncomeRecord['currencyMeta'] extends undefined ? never : NonNullable<IncomeRecord['currencyMeta']>['originalCurrency'],
            originalAmount: inc.currency_meta.originalAmount,
            exchangeRateEstimated: inc.currency_meta.exchangeRateEstimated,
            incentivesOrNotes: inc.currency_meta.incentivesOrNotes,
          }
        : undefined,
      notes: inc.notes,
      date: typeof inc.date === 'string' ? inc.date.split('T')[0] : inc.date,
      verified: inc.verified,
    })),
    subTotalIncomeBDT: api.sub_total_income_bdt,

    expenseItems: api.expense_records.map((exp): ExpenseRecord => ({
      id: exp.id,
      categoryTitle: exp.category_title,
      categoryGroup: exp.category_group as ExpenseRecord['categoryGroup'],
      amountBDT: exp.amount_bdt,
      paymentMethod: exp.payment_method,
      paymentMethodType: exp.payment_method_type as ExpenseRecord['paymentMethodType'],
      remainingLiabilityBDT: exp.remaining_liability_bdt,
      notes: exp.notes,
      status: EXPENSE_STATUS_MAP[exp.status] ?? 'Completed',
      date: typeof exp.date === 'string' ? exp.date.split('T')[0] : exp.date,
      verified: exp.verified,
    })),
    totalExpensesBDT: api.total_expenses_bdt,

    outstandingLiabilities: api.liability_records.map((lib): LiabilityRecord => ({
      id: lib.id,
      description: lib.description,
      vendorOrCreditor: lib.vendor_or_creditor,
      totalInitialBDT: lib.total_initial_bdt,
      paidBDT: lib.paid_bdt,
      remainingDueBDT: lib.remaining_due_bdt,
      status: LIABILITY_STATUS_MAP[lib.status] ?? 'Due',
      notes: lib.notes,
      dueDate: lib.due_date,
    })),
    totalLiabilitiesBDT: api.total_liabilities_bdt,

    outstandingReceivables: api.receivable_records.map((rec): ReceivableRecord => ({
      id: rec.id,
      description: rec.description,
      debtorOrSource: rec.debtor_or_source,
      totalReceivableBDT: rec.total_receivable_bdt,
      repaymentPlan: rec.repayment_plan,
      status: RECEIVABLE_STATUS_MAP[rec.status] ?? 'Pending',
      notes: rec.notes,
    })),
    totalReceivablesBDT: api.total_receivables_bdt,

    finalSummary: {
      netRemainingFundBalanceBDT: api.net_remaining_fund_balance_bdt,
      reconciliationNotes: api.reconciliation_notes,
    },
  };
}

// ─── Service methods ──────────────────────────────────────────────────────────

/**
 * Fetch the full monthly report by year and month.
 * Month is case-insensitive (the backend normalises it).
 *
 * @returns The report mapped to the frontend MonthlyFinancialReport shape.
 * @throws ApiError if the request fails or the report is not found.
 */
export async function getReportByMonth(
  year: number,
  month: string,
): Promise<MonthlyFinancialReport> {
  const res = await apiRequest<ApiFullReport>(
    `/reports/month/${year}/${month}`,
  );
  return toFrontendReport(res.data);
}

/**
 * Fetch the full monthly report by its UUID.
 *
 * @throws ApiError if the request fails or the report is not found.
 */
export async function getReportById(id: string): Promise<MonthlyFinancialReport> {
  const res = await apiRequest<ApiFullReport>(`/reports/${id}`);
  return toFrontendReport(res.data);
}

/**
 * Fetch a summary list of all monthly reports (no line items).
 * Useful for a report index / picker UI.
 */
export async function getReports(): Promise<
  Array<Omit<ApiFullReport, 'income_records' | 'expense_records' | 'liability_records' | 'receivable_records'>>
> {
  const res = await apiRequest<Array<Omit<ApiFullReport, 'income_records' | 'expense_records' | 'liability_records' | 'receivable_records'>>>('/reports');
  return res.data;
}
