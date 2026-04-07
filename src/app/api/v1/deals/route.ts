import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { differenceInDays } from 'date-fns';

export async function GET() {
  try {
    const deals = await prisma.deal.findMany({
      include: {
        client: { select: { id: true, name: true } },
        stageHistory: { orderBy: { changedAt: 'desc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    });

    const mapped = deals.map((d) => {
      const lastChange = d.stageHistory[0]?.changedAt ?? d.createdAt;
      const daysInStage = differenceInDays(new Date(), lastChange);
      return {
        id: d.id,
        title: d.title,
        clientName: d.client.name,
        clientId: d.client.id,
        value: d.value,
        stage: d.stage,
        probability: d.probability,
        closeDate: d.closeDate,
        nextStep: d.nextStep,
        daysInStage,
        notes: d.notes,
        createdAt: d.createdAt,
      };
    });

    return NextResponse.json(mapped);
  } catch (error) {
    console.error('GET /api/v1/deals error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deals' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, clientId, value, stage, closeDate, notes } = body;

    if (!title || !clientId || value == null || !stage) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const probabilityMap: Record<string, number> = {
      Lead: 10,
      Discovery: 25,
      Proposal: 50,
      Negotiation: 75,
      'Closed Won': 100,
      'Closed Lost': 0,
    };

    const deal = await prisma.deal.create({
      data: {
        title,
        clientId,
        value: Number(value),
        stage,
        probability: probabilityMap[stage] ?? 10,
        closeDate: closeDate ? new Date(closeDate) : null,
        notes: notes || null,
      },
      include: { client: { select: { id: true, name: true } } },
    });

    // Create initial StageChange record
    await prisma.stageChange.create({
      data: {
        dealId: deal.id,
        fromStage: '',
        toStage: stage,
      },
    });

    return NextResponse.json(
      {
        id: deal.id,
        title: deal.title,
        clientName: deal.client.name,
        clientId: deal.client.id,
        value: deal.value,
        stage: deal.stage,
        probability: deal.probability,
        closeDate: deal.closeDate,
        nextStep: deal.nextStep,
        daysInStage: 0,
        notes: deal.notes,
        createdAt: deal.createdAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/v1/deals error:', error);
    return NextResponse.json(
      { error: 'Failed to create deal' },
      { status: 500 }
    );
  }
}
