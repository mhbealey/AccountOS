import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const now = new Date();

    // Metrics
    const [
      activeClients,
      allClients,
      deals,
      openTaskCount,
      activities,
      overdueInvoices,
      overdueTasks,
      lowHealthClients,
      clientHealthList,
    ] = await Promise.all([
      prisma.client.count({ where: { status: 'Active' } }),
      prisma.client.findMany({ select: { mrr: true, healthScore: true } }),
      prisma.deal.findMany({ select: { value: true, probability: true } }),
      prisma.task.count({ where: { status: { not: 'done' } } }),
      prisma.activity.findMany({
        take: 10,
        orderBy: { date: 'desc' },
        include: { client: { select: { name: true } } },
      }),
      prisma.invoice.findMany({
        where: {
          status: { in: ['Sent', 'Overdue'] },
          dueDate: { lt: now },
        },
        include: { client: { select: { name: true } } },
      }),
      prisma.task.findMany({
        where: {
          status: { not: 'done' },
          dueDate: { lt: now },
        },
        include: { client: { select: { name: true } } },
      }),
      prisma.client.findMany({
        where: { healthScore: { lt: 40 } },
        select: { id: true, name: true, healthScore: true },
      }),
      prisma.client.findMany({
        select: {
          id: true,
          name: true,
          healthScore: true,
          mrr: true,
          lastContactAt: true,
        },
        orderBy: { healthScore: 'asc' },
      }),
    ]);

    const mrr = allClients.reduce((sum, c) => sum + c.mrr, 0);
    const weightedPipeline = deals.reduce(
      (sum, d) => sum + (d.value * d.probability) / 100,
      0
    );
    const avgHealth =
      allClients.length > 0
        ? Math.round(
            allClients.reduce((sum, c) => sum + c.healthScore, 0) /
              allClients.length
          )
        : 0;

    const metrics = {
      activeClients,
      mrr,
      weightedPipeline,
      avgHealth,
      utilization: 0,
      openTasks: openTaskCount,
    };

    const alerts = {
      lowHealth: lowHealthClients,
      overdueInvoices: overdueInvoices.map((inv) => ({
        id: inv.id,
        number: inv.number,
        clientName: inv.client.name,
        amount: inv.amount,
        dueDate: inv.dueDate,
      })),
      overdueTasks: overdueTasks.map((t) => ({
        id: t.id,
        title: t.title,
        clientName: t.client?.name ?? null,
        dueDate: t.dueDate,
      })),
    };

    const recentActivities = activities.map((a) => ({
      id: a.id,
      type: a.type,
      title: a.title,
      description: a.description,
      date: a.date,
      clientName: a.client?.name ?? null,
    }));

    const clientHealth = clientHealthList.map((c) => ({
      id: c.id,
      name: c.name,
      healthScore: c.healthScore,
      mrr: c.mrr,
      lastContactAt: c.lastContactAt,
    }));

    return NextResponse.json({
      metrics,
      alerts,
      recentActivities,
      clientHealth,
    });
  } catch (error) {
    console.error('GET /api/v1/dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard' },
      { status: 500 }
    );
  }
}
