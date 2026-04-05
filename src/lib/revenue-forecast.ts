import { addDays, addWeeks, startOfWeek, endOfWeek, isWithinInterval, parseISO } from 'date-fns';
import type { CashFlowForecastParams, WeeklyForecast } from '@/types';

/** Number of weeks in the forecast window. */
const FORECAST_WEEKS = 13;

/** Map recurring frequency to number of occurrences per week. */
const FREQUENCY_WEEKLY_MULTIPLIER: Record<string, number> = {
  daily: 7,
  weekly: 1,
  biweekly: 0.5,
  monthly: 7 / 30.44, // average days in month
  quarterly: 7 / 91.31,
};

/**
 * Calculate a 13-week (one quarter) cash flow forecast.
 *
 * Combines three revenue sources and one expense source:
 *
 * 1. **Recurring Revenue** - MRR from all active clients, spread weekly
 *    (MRR * 12 / 52 per week per client).
 *
 * 2. **Pipeline Revenue** - Weighted value of open deals (value * probability / 100),
 *    allocated to the week containing the deal's expected close date.
 *    Only deals in Lead, Discovery, Proposal, or Negotiation stages are included.
 *
 * 3. **Invoice Payments** - Expected payments from sent/overdue invoices,
 *    allocated to the week containing the invoice due date.
 *
 * 4. **Expenses** - Recurring expenses mapped to their weekly cost based on
 *    frequency, filtered by their active date range.
 *
 * @param params.clients - Active clients with MRR figures
 * @param params.invoices - Outstanding invoices with due dates
 * @param params.deals - Open pipeline deals with close dates and probabilities
 * @param params.expenses - Recurring expenses with frequencies
 * @param params.startDate - The start date for the forecast window
 * @returns An array of 13 WeeklyForecast objects with running balance
 *
 * @example
 * ```ts
 * const forecast = calculateCashFlowForecast({
 *   clients: [{ id: '1', status: 'Active', mrr: 5000 }],
 *   invoices: [],
 *   deals: [],
 *   expenses: [],
 *   startDate: new Date('2026-04-06'),
 * });
 * // forecast[0].recurringRevenue => ~1153.85  (5000 * 12 / 52)
 * ```
 */
export function calculateCashFlowForecast(
  params: CashFlowForecastParams
): WeeklyForecast[] {
  const { clients, invoices, deals, expenses, startDate } = params;

  // Calculate total weekly MRR from active clients
  const totalWeeklyMrr = clients
    .filter((c) => c.status === 'Active')
    .reduce((sum, c) => sum + (c.mrr * 12) / 52, 0);

  // Open pipeline stages (not closed)
  const openStages = new Set(['Lead', 'Discovery', 'Proposal', 'Negotiation']);

  // Payable invoice statuses
  const payableStatuses = new Set(['Sent', 'Viewed', 'Overdue']);

  const weeks: WeeklyForecast[] = [];
  let runningBalance = 0;

  for (let i = 0; i < FORECAST_WEEKS; i++) {
    const weekStart = startOfWeek(addWeeks(startDate, i), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    const interval = { start: weekStart, end: weekEnd };

    // 1. Recurring revenue (same every week)
    const recurringRevenue = roundCents(totalWeeklyMrr);

    // 2. Pipeline revenue: deals closing this week, weighted by probability
    const pipelineRevenue = roundCents(
      deals
        .filter((d) => {
          if (!openStages.has(d.stage) || !d.closeDate) return false;
          const closeDate = toDate(d.closeDate);
          return isWithinInterval(closeDate, interval);
        })
        .reduce((sum, d) => sum + (d.value * d.probability) / 100, 0)
    );

    // 3. Invoice payments expected this week
    const invoicePayments = roundCents(
      invoices
        .filter((inv) => {
          if (!payableStatuses.has(inv.status)) return false;
          const dueDate = toDate(inv.dueDate);
          return isWithinInterval(dueDate, interval);
        })
        .reduce((sum, inv) => sum + inv.amount, 0)
    );

    // 4. Expenses for this week
    const weeklyExpenses = roundCents(
      expenses
        .filter((exp) => {
          if (exp.startDate && toDate(exp.startDate) > weekEnd) return false;
          if (exp.endDate && toDate(exp.endDate) < weekStart) return false;
          return true;
        })
        .reduce((sum, exp) => {
          const multiplier = FREQUENCY_WEEKLY_MULTIPLIER[exp.frequency] ?? FREQUENCY_WEEKLY_MULTIPLIER.monthly;
          return sum + exp.amount * multiplier;
        }, 0)
    );

    const netCashFlow = roundCents(
      recurringRevenue + pipelineRevenue + invoicePayments - weeklyExpenses
    );
    runningBalance = roundCents(runningBalance + netCashFlow);

    weeks.push({
      weekStart,
      weekEnd,
      recurringRevenue,
      pipelineRevenue,
      invoicePayments,
      expenses: weeklyExpenses,
      netCashFlow,
      runningBalance,
    });
  }

  return weeks;
}

/** Round to 2 decimal places to avoid floating point drift. */
function roundCents(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Coerce a Date or ISO string to a Date object. */
function toDate(value: Date | string): Date {
  if (typeof value === 'string') return parseISO(value);
  return value;
}
