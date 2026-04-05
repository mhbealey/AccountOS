import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const months = parseInt(searchParams.get('months') || '12', 10);

    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);

    // Fetch time entries in range
    const timeEntries = await prisma.timeEntry.findMany({
      where: {
        date: { gte: startDate },
        billable: true,
      },
      select: { date: true, hours: true, rate: true },
    });

    // Fetch invoices in range
    const invoices = await prisma.invoice.findMany({
      where: {
        issuedDate: { gte: startDate },
      },
      select: { issuedDate: true, amount: true, status: true, paidDate: true },
    });

    // Fetch user's revenue target
    const user = await prisma.user.findFirst({
      select: { goalAnnualRev: true },
    });
    const monthlyTarget = (user?.goalAnnualRev || 0) / 12;

    // Build monthly data
    const monthlyData: Array<{
      month: string;
      revenue: number;
      target: number;
      invoiced: number;
      collected: number;
    }> = [];

    for (let i = 0; i < months; i++) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - months + 1 + i, 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59);
      const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;

      // Revenue from billable time entries
      const monthRevenue = timeEntries
        .filter((te) => {
          const d = new Date(te.date);
          return d >= monthDate && d <= monthEnd;
        })
        .reduce((sum, te) => sum + te.hours * te.rate, 0);

      // Invoiced amount
      const monthInvoiced = invoices
        .filter((inv) => {
          const d = new Date(inv.issuedDate);
          return d >= monthDate && d <= monthEnd;
        })
        .reduce((sum, inv) => sum + inv.amount, 0);

      // Collected (paid invoices)
      const monthCollected = invoices
        .filter((inv) => {
          if (inv.status !== 'Paid' || !inv.paidDate) return false;
          const d = new Date(inv.paidDate);
          return d >= monthDate && d <= monthEnd;
        })
        .reduce((sum, inv) => sum + inv.amount, 0);

      monthlyData.push({
        month: monthKey,
        revenue: Math.round(monthRevenue * 100) / 100,
        target: Math.round(monthlyTarget * 100) / 100,
        invoiced: Math.round(monthInvoiced * 100) / 100,
        collected: Math.round(monthCollected * 100) / 100,
      });
    }

    return NextResponse.json(monthlyData);
  } catch (error) {
    console.error('GET /api/reports/revenue error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
