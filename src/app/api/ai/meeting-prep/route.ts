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

    const client = await prisma.client.findUnique({
      where: { id: body.clientId },
      include: {
        contacts: true,
        deals: {
          where: { stage: { notIn: ['ClosedWon', 'ClosedLost'] } },
        },
        goals: {
          where: { status: { not: 'Achieved' } },
        },
        activities: {
          orderBy: { date: 'desc' },
          take: 15,
        },
        contracts: {
          where: { status: 'Active' },
        },
      },
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const context = JSON.stringify({
      name: client.name,
      status: client.status,
      healthScore: client.healthScore,
      engagementScore: client.engagementScore,
      mrr: client.mrr,
      contractValue: client.contractValue,
      lastContactAt: client.lastContactAt,
      contacts: client.contacts.map((c: typeof client.contacts[number]) => ({
        name: c.name,
        title: c.title,
        role: c.role,
        sentiment: c.sentiment,
        isPrimary: c.isPrimary,
        isExecutive: c.isExecutive,
        birthday: c.birthday,
        interests: c.interests,
      })),
      recentActivities: client.activities.map((a: typeof client.activities[number]) => ({
        type: a.type,
        title: a.title,
        date: a.date.toISOString().split('T')[0],
        outcome: a.outcome,
        sentiment: a.sentiment,
      })),
      openDeals: client.deals.map((d: typeof client.deals[number]) => ({
        title: d.title,
        value: d.value,
        stage: d.stage,
        nextStep: d.nextStep,
      })),
      goals: client.goals.map((g: typeof client.goals[number]) => ({
        title: g.title,
        status: g.status,
        currentValue: g.currentValue,
        targetValue: g.targetValue,
      })),
      contracts: client.contracts.map((c: typeof client.contracts[number]) => ({
        title: c.title,
        type: c.type,
        endDate: c.endDate?.toISOString().split('T')[0],
        monthlyValue: c.monthlyValue,
      })),
    }, null, 2);

    const brief = await generateAIResponse(
      PROMPTS.meetingPrep.system,
      PROMPTS.meetingPrep.user(context),
      2000
    );

    return NextResponse.json({ brief });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('ANTHROPIC_API_KEY')) {
      return NextResponse.json(
        { error: 'AI service not configured. Please set the ANTHROPIC_API_KEY environment variable.' },
        { status: 400 }
      );
    }
    console.error('POST /api/ai/meeting-prep error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
