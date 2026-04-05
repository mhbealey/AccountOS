import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { generateAIResponse } from '@/lib/ai';
import { PROMPTS } from '@/lib/prompts';

export async function POST() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysFromNow = new Date(now);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    const thirtyDaysFromNow = new Date(now);
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const [
      activeClients,
      recentActivities,
      expiringContracts,
      overdueTasks,
      upcomingTasks,
      overdueInvoices,
      activeDeals,
    ] = await Promise.all([
      prisma.client.findMany({
        where: { status: { notIn: ['Churned'] } },
        select: { id: true, name: true, healthScore: true, status: true },
        orderBy: { healthScore: 'asc' },
      }),
      prisma.activity.findMany({
        where: { date: { gte: sevenDaysAgo } },
        include: {
          client: { select: { name: true } },
        },
        orderBy: { date: 'desc' },
        take: 20,
      }),
      prisma.contract.findMany({
        where: {
          status: 'Active',
          endDate: { gte: now, lte: thirtyDaysFromNow },
        },
        include: { client: { select: { name: true } } },
      }),
      prisma.task.findMany({
        where: {
          status: { not: 'done' },
          dueDate: { lt: now },
        },
        include: { client: { select: { name: true } } },
        orderBy: { dueDate: 'asc' },
      }),
      prisma.task.findMany({
        where: {
          status: { not: 'done' },
          dueDate: { gte: now, lte: sevenDaysFromNow },
        },
        include: { client: { select: { name: true } } },
        orderBy: { dueDate: 'asc' },
      }),
      prisma.invoice.findMany({
        where: {
          status: { in: ['Sent', 'Viewed', 'Overdue'] },
          dueDate: { lt: now },
        },
        include: { client: { select: { name: true } } },
      }),
      prisma.deal.findMany({
        where: { stage: { notIn: ['ClosedWon', 'ClosedLost'] } },
        include: { client: { select: { name: true } } },
      }),
    ]);

    const context = JSON.stringify({
      activeClients: activeClients.map((c: (typeof activeClients)[number]) => ({
        name: c.name,
        healthScore: c.healthScore,
        status: c.status,
      })),
      recentActivities: recentActivities.map((a: (typeof recentActivities)[number]) => ({
        clientName: a.client?.name || 'Unknown',
        type: a.type,
        title: a.title,
        date: a.date.toISOString().split('T')[0],
      })),
      expiringContracts: expiringContracts.map((c: (typeof expiringContracts)[number]) => ({
        clientName: c.client.name,
        title: c.title,
        endDate: c.endDate?.toISOString().split('T')[0] || '',
      })),
      overdueTasks: overdueTasks.map((t: (typeof overdueTasks)[number]) => ({
        title: t.title,
        clientName: t.client?.name || null,
        dueDate: t.dueDate?.toISOString().split('T')[0] || '',
      })),
      overdueInvoices: overdueInvoices.map((i: (typeof overdueInvoices)[number]) => ({
        number: i.number,
        clientName: i.client.name,
        amount: i.amount,
        dueDate: i.dueDate.toISOString().split('T')[0],
      })),
      upcomingTasks: upcomingTasks.map((t: (typeof upcomingTasks)[number]) => ({
        title: t.title,
        clientName: t.client?.name || null,
        dueDate: t.dueDate?.toISOString().split('T')[0] || '',
      })),
      dealsUpdate: activeDeals.map((d: (typeof activeDeals)[number]) => ({
        title: d.title,
        clientName: d.client.name,
        stage: d.stage,
        value: d.value,
      })),
    }, null, 2);

    const digest = await generateAIResponse(
      PROMPTS.weeklyDigest.system,
      PROMPTS.weeklyDigest.user(context),
      3000
    );

    return NextResponse.json({ digest });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('ANTHROPIC_API_KEY')) {
      return NextResponse.json(
        { error: 'AI service not configured. Please set the ANTHROPIC_API_KEY environment variable.' },
        { status: 400 }
      );
    }
    console.error('POST /api/ai/weekly-digest error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
