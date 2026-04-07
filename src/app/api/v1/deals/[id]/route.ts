import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const deal = await prisma.deal.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, name: true } },
        stageHistory: { orderBy: { changedAt: 'desc' } },
        activities: { orderBy: { date: 'desc' } },
      },
    });

    if (!deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    return NextResponse.json(deal);
  } catch (error) {
    console.error('GET /api/v1/deals/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deal' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const probabilityMap: Record<string, number> = {
      Lead: 10,
      Discovery: 25,
      Proposal: 50,
      Negotiation: 75,
      'Closed Won': 100,
      'Closed Lost': 0,
    };

    const data: Record<string, unknown> = {};
    if (body.stage !== undefined) {
      data.stage = body.stage;
      data.probability = probabilityMap[body.stage] ?? 10;
    }
    if (body.title !== undefined) data.title = body.title;
    if (body.value !== undefined) data.value = Number(body.value);
    if (body.notes !== undefined) data.notes = body.notes;
    if (body.nextStep !== undefined) data.nextStep = body.nextStep;
    if (body.closeDate !== undefined)
      data.closeDate = body.closeDate ? new Date(body.closeDate) : null;
    if (body.lostReason !== undefined) data.lostReason = body.lostReason;
    if (body.winFactors !== undefined) data.winFactors = body.winFactors;

    const existing = await prisma.deal.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    // Record stage change if stage is different
    if (body.stage && body.stage !== existing.stage) {
      await prisma.stageChange.create({
        data: {
          dealId: id,
          fromStage: existing.stage,
          toStage: body.stage,
        },
      });
    }

    const deal = await prisma.deal.update({
      where: { id },
      data,
      include: { client: { select: { id: true, name: true } } },
    });

    return NextResponse.json(deal);
  } catch (error) {
    console.error('PATCH /api/v1/deals/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update deal' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.deal.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    await prisma.deal.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/v1/deals/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete deal' },
      { status: 500 }
    );
  }
}
