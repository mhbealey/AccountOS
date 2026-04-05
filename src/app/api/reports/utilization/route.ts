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
    const weeks = parseInt(searchParams.get('weeks') || '12', 10);

    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - startDate.getDay() + 1 - (weeks - 1) * 7);
    startDate.setHours(0, 0, 0, 0);

    const timeEntries = await prisma.timeEntry.findMany({
      where: {
        date: { gte: startDate },
      },
      select: { date: true, hours: true, billable: true, category: true },
    });

    type TERow = (typeof timeEntries)[number];

    const user = await prisma.user.findFirst({
      select: { goalMonthlyHrs: true },
    });
    const targetWeeklyHours = (user?.goalMonthlyHrs || 160) / 4;

    const weeklyData: Array<{
      weekStart: string;
      billableHours: number;
      nonBillableHours: number;
      totalHours: number;
      utilization: number;
    }> = [];

    const hoursByCategory: Record<string, number> = {};

    for (let i = 0; i < weeks; i++) {
      const weekStart = new Date(startDate);
      weekStart.setDate(weekStart.getDate() + i * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const weekEntries: TERow[] = timeEntries.filter((te: TERow) => {
        const d = new Date(te.date);
        return d >= weekStart && d <= weekEnd;
      });

      const billableHours = weekEntries
        .filter((te: TERow) => te.billable)
        .reduce((sum: number, te: TERow) => sum + te.hours, 0);

      const nonBillableHours = weekEntries
        .filter((te: TERow) => !te.billable)
        .reduce((sum: number, te: TERow) => sum + te.hours, 0);

      const totalHours = billableHours + nonBillableHours;
      const utilization =
        targetWeeklyHours > 0
          ? Math.round((billableHours / targetWeeklyHours) * 100)
          : 0;

      weeklyData.push({
        weekStart: weekStart.toISOString().split('T')[0],
        billableHours: Math.round(billableHours * 100) / 100,
        nonBillableHours: Math.round(nonBillableHours * 100) / 100,
        totalHours: Math.round(totalHours * 100) / 100,
        utilization,
      });
    }

    for (const te of timeEntries) {
      const cat = te.category || 'Uncategorized';
      hoursByCategory[cat] = (hoursByCategory[cat] || 0) + te.hours;
    }

    for (const key of Object.keys(hoursByCategory)) {
      hoursByCategory[key] = Math.round(hoursByCategory[key] * 100) / 100;
    }

    const totalBillable = weeklyData.reduce((sum: number, w) => sum + w.billableHours, 0);
    const avgUtilization =
      targetWeeklyHours * weeks > 0 ? Math.round((totalBillable / (targetWeeklyHours * weeks)) * 100) : 0;

    return NextResponse.json({
      weeks: weeklyData,
      avgUtilization,
      hoursByCategory,
    });
  } catch (error) {
    console.error('GET /api/reports/utilization error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
