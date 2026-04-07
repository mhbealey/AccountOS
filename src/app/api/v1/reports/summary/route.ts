import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Revenue: monthly from MetricSnapshot
    const revenueSnapshots = await prisma.metricSnapshot.findMany({
      where: { metric: 'revenue' },
      orderBy: { recordedAt: 'desc' },
      take: 12,
    });

    // Revenue by client from TimeEntry + Invoice
    const clients = await prisma.client.findMany({
      select: {
        id: true,
        name: true,
        timeEntries: {
          select: { hours: true, rate: true },
        },
        invoices: {
          where: { status: 'Paid' },
          select: { amount: true },
        },
      },
    });

    const revenueByClient = clients.map((c) => {
      const timeRevenue = c.timeEntries.reduce(
        (sum, te) => sum + te.hours * te.rate,
        0
      );
      const invoiceRevenue = c.invoices.reduce(
        (sum, inv) => sum + inv.amount,
        0
      );
      return {
        clientId: c.id,
        clientName: c.name,
        timeRevenue,
        invoiceRevenue,
        total: invoiceRevenue || timeRevenue,
      };
    });

    // Pipeline: stages aggregation
    const deals = await prisma.deal.findMany({
      select: { stage: true, value: true, probability: true },
    });

    const pipelineMap: Record<
      string,
      { count: number; value: number; weighted: number }
    > = {};
    for (const deal of deals) {
      if (!pipelineMap[deal.stage]) {
        pipelineMap[deal.stage] = { count: 0, value: 0, weighted: 0 };
      }
      pipelineMap[deal.stage].count++;
      pipelineMap[deal.stage].value += deal.value;
      pipelineMap[deal.stage].weighted +=
        (deal.value * deal.probability) / 100;
    }
    const pipeline = Object.entries(pipelineMap).map(([stage, data]) => ({
      stage,
      ...data,
    }));

    // Health: distribution counts + trend from HealthScoreSnapshot
    const allClients = await prisma.client.findMany({
      select: { healthScore: true },
    });

    const healthDistribution = {
      critical: allClients.filter((c) => c.healthScore < 30).length,
      atRisk: allClients.filter(
        (c) => c.healthScore >= 30 && c.healthScore < 50
      ).length,
      stable: allClients.filter(
        (c) => c.healthScore >= 50 && c.healthScore < 70
      ).length,
      healthy: allClients.filter(
        (c) => c.healthScore >= 70 && c.healthScore < 90
      ).length,
      thriving: allClients.filter((c) => c.healthScore >= 90).length,
    };

    const healthTrend = await prisma.healthScoreSnapshot.findMany({
      orderBy: { recordedAt: 'desc' },
      take: 30,
      select: { score: true, recordedAt: true, clientId: true },
    });

    // Utilization from TimeEntry
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const timeEntries = await prisma.timeEntry.findMany({
      where: {
        date: { gte: startOfMonth },
      },
      select: { hours: true },
    });

    const totalHours = timeEntries.reduce((sum, te) => sum + te.hours, 0);
    const user = await prisma.user.findFirst({
      select: { goalMonthlyHrs: true },
    });
    const targetHours = user?.goalMonthlyHrs ?? 160;
    const utilization =
      targetHours > 0
        ? Math.round((totalHours / targetHours) * 100)
        : 0;

    return NextResponse.json({
      revenue: {
        monthly: revenueSnapshots.map((s) => ({
          value: s.value,
          recordedAt: s.recordedAt,
        })),
        byClient: revenueByClient,
      },
      pipeline,
      health: {
        distribution: healthDistribution,
        trend: healthTrend,
      },
      utilization: {
        currentMonth: totalHours,
        target: targetHours,
        percentage: utilization,
      },
    });
  } catch (error) {
    console.error('GET /api/v1/reports/summary error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}
