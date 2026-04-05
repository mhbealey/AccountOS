import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { generateAIResponse } from '@/lib/ai';
import { PROMPTS } from '@/lib/prompts';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    if (!body.clientId) {
      return NextResponse.json({ error: 'clientId is required' }, { status: 400 });
    }

    if (!body.quarter) {
      return NextResponse.json({ error: 'quarter is required (e.g., "Q1 2026")' }, { status: 400 });
    }

    const client = await prisma.client.findUnique({
      where: { id: body.clientId },
      include: {
        contacts: true,
        deals: true,
        goals: true,
        activities: {
          orderBy: { date: 'desc' },
          take: 30,
        },
        invoices: {
          include: { lineItems: true },
        },
        timeEntries: true,
        contracts: true,
      },
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const totalHours = client.timeEntries.reduce(
      (sum: number, te: typeof client.timeEntries[number]) => sum + te.hours,
      0
    );
    const totalRevenue = client.timeEntries
      .filter((te: typeof client.timeEntries[number]) => te.billable)
      .reduce(
        (sum: number, te: typeof client.timeEntries[number]) => sum + te.hours * te.rate,
        0
      );

    const context = JSON.stringify({
      name: client.name,
      status: client.status,
      healthScore: client.healthScore,
      mrr: client.mrr,
      contractValue: client.contractValue,
      contacts: client.contacts.map((c: typeof client.contacts[number]) => ({
        name: c.name,
        title: c.title,
        role: c.role,
      })),
      activities: client.activities.map((a: typeof client.activities[number]) => ({
        type: a.type,
        title: a.title,
        date: a.date.toISOString().split('T')[0],
        outcome: a.outcome,
      })),
      deals: client.deals.map((d: typeof client.deals[number]) => ({
        title: d.title,
        value: d.value,
        stage: d.stage,
      })),
      goals: client.goals.map((g: typeof client.goals[number]) => ({
        title: g.title,
        status: g.status,
        currentValue: g.currentValue,
        targetValue: g.targetValue,
        quarter: g.quarter,
      })),
      invoices: client.invoices.map((i: typeof client.invoices[number]) => ({
        number: i.number,
        amount: i.amount,
        status: i.status,
      })),
      timeEntries: {
        totalHours: Math.round(totalHours * 100) / 100,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
      },
      contracts: client.contracts.map((c: typeof client.contracts[number]) => ({
        title: c.title,
        type: c.type,
        status: c.status,
        value: c.value,
        endDate: c.endDate?.toISOString().split('T')[0],
      })),
    }, null, 2);

    const document = await generateAIResponse(
      PROMPTS.qbrGenerate.system,
      PROMPTS.qbrGenerate.user(context, body.quarter),
      4000
    );

    return NextResponse.json({ document });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('ANTHROPIC_API_KEY')) {
      return NextResponse.json(
        { error: 'AI service not configured. Please set the ANTHROPIC_API_KEY environment variable.' },
        { status: 400 }
      );
    }
    console.error('POST /api/ai/qbr error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
