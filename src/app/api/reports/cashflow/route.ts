import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
    weekStart.setHours(0, 0, 0, 0);

    const forecastEnd = new Date(weekStart);
    forecastEnd.setDate(forecastEnd.getDate() + 13 * 7);

    const [contracts, deals, invoices, expenses] = await Promise.all([
      prisma.contract.findMany({
        where: {
          status: 'Active',
          monthlyValue: { not: null },
        },
        select: { monthlyValue: true },
      }),
      prisma.deal.findMany({
        where: {
          stage: { notIn: ['ClosedWon', 'ClosedLost'] },
        },
        select: { value: true, probability: true, closeDate: true },
      }),
      prisma.invoice.findMany({
        where: {
          status: { in: ['Sent', 'Viewed', 'Overdue'] },
        },
        select: { amount: true, dueDate: true, status: true, issuedDate: true },
      }),
      prisma.expense.findMany({
        select: { amount: true, frequency: true, startDate: true, endDate: true },
      }),
    ]);

    type ContractRow = (typeof contracts)[number];
    type DealRow = (typeof deals)[number];
    type InvoiceRow = (typeof invoices)[number];
    type ExpenseRow = (typeof expenses)[number];

    const weeklyRecurring = contracts.reduce(
      (sum: number, c: ContractRow) => sum + (c.monthlyValue || 0) / 4.33,
      0
    );

    const weeks: Array<{
      weekStart: string;
      recurring: number;
      pipeline: number;
      invoices: number;
      expenses: number;
      net: number;
      balance: number;
    }> = [];

    let runningBalance = 0;

    for (let i = 0; i < 13; i++) {
      const wStart = new Date(weekStart);
      wStart.setDate(wStart.getDate() + i * 7);
      const wEnd = new Date(wStart);
      wEnd.setDate(wEnd.getDate() + 6);
      wEnd.setHours(23, 59, 59, 999);

      const weekPipeline = deals
        .filter((d: DealRow) => {
          if (!d.closeDate) return false;
          const cd = new Date(d.closeDate);
          return cd >= wStart && cd <= wEnd;
        })
        .reduce((sum: number, d: DealRow) => sum + d.value * (d.probability / 100), 0);

      const weekInvoices = invoices
        .filter((inv: InvoiceRow) => {
          const due = new Date(inv.dueDate);
          return due >= wStart && due <= wEnd;
        })
        .reduce((sum: number, inv: InvoiceRow) => sum + inv.amount, 0);

      let weekExpenses = 0;
      for (const exp of expenses as ExpenseRow[]) {
        if (exp.startDate && new Date(exp.startDate) > wEnd) continue;
        if (exp.endDate && new Date(exp.endDate) < wStart) continue;

        switch (exp.frequency) {
          case 'weekly':
            weekExpenses += exp.amount;
            break;
          case 'biweekly':
            weekExpenses += exp.amount / 2;
            break;
          case 'monthly':
            weekExpenses += exp.amount / 4.33;
            break;
          case 'quarterly':
            weekExpenses += exp.amount / 13;
            break;
          case 'yearly':
          case 'annual':
            weekExpenses += exp.amount / 52;
            break;
          default:
            weekExpenses += exp.amount / 4.33;
            break;
        }
      }

      const net = weeklyRecurring + weekPipeline + weekInvoices - weekExpenses;
      runningBalance += net;

      weeks.push({
        weekStart: wStart.toISOString().split('T')[0],
        recurring: Math.round(weeklyRecurring * 100) / 100,
        pipeline: Math.round(weekPipeline * 100) / 100,
        invoices: Math.round(weekInvoices * 100) / 100,
        expenses: Math.round(weekExpenses * 100) / 100,
        net: Math.round(net * 100) / 100,
        balance: Math.round(runningBalance * 100) / 100,
      });
    }

    // Invoice aging
    const overdueInvoices = await prisma.invoice.findMany({
      where: {
        status: { in: ['Sent', 'Viewed', 'Overdue'] },
        dueDate: { lt: now },
      },
      select: { amount: true, dueDate: true },
    });

    const currentInvoices = await prisma.invoice.findMany({
      where: {
        status: { in: ['Sent', 'Viewed'] },
        dueDate: { gte: now },
      },
      select: { amount: true },
    });

    type OverdueRow = (typeof overdueInvoices)[number];
    type CurrentRow = (typeof currentInvoices)[number];

    let overdue30 = 0;
    let overdue60 = 0;
    let overdue90 = 0;
    let overdue90plus = 0;

    for (const inv of overdueInvoices) {
      const daysOverdue = Math.floor(
        (now.getTime() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysOverdue <= 30) {
        overdue30 += inv.amount;
      } else if (daysOverdue <= 60) {
        overdue60 += inv.amount;
      } else if (daysOverdue <= 90) {
        overdue90 += inv.amount;
      } else {
        overdue90plus += inv.amount;
      }
    }

    const aging = {
      current: Math.round(currentInvoices.reduce((sum: number, inv: CurrentRow) => sum + inv.amount, 0) * 100) / 100,
      overdue30: Math.round(overdue30 * 100) / 100,
      overdue60: Math.round(overdue60 * 100) / 100,
      overdue90: Math.round(overdue90 * 100) / 100,
      overdue90plus: Math.round(overdue90plus * 100) / 100,
    };

    // Average days to payment
    const paidInvoices = await prisma.invoice.findMany({
      where: { status: 'Paid', paidDate: { not: null } },
      select: { issuedDate: true, paidDate: true },
    });

    type PaidRow = (typeof paidInvoices)[number];

    const paymentDays = paidInvoices.map((inv: PaidRow) => {
      const issued = new Date(inv.issuedDate);
      const paid = new Date(inv.paidDate!);
      return Math.floor((paid.getTime() - issued.getTime()) / (1000 * 60 * 60 * 24));
    });

    const avgDaysToPayment =
      paymentDays.length > 0
        ? Math.round(paymentDays.reduce((a: number, b: number) => a + b, 0) / paymentDays.length)
        : 0;

    return NextResponse.json({
      weeks,
      aging,
      avgDaysToPayment,
    });
  } catch (error) {
    console.error('GET /api/reports/cashflow error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
