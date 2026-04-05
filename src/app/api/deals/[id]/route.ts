import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { getStageProbability } from '@/lib/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const deal = await prisma.deal.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, name: true, status: true } },
        stageHistory: { orderBy: { changedAt: 'asc' } },
      },
    });

    if (!deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    return NextResponse.json(deal);
  } catch (error) {
    console.error('GET /api/deals/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.deal.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    const stageChanged = body.stage && body.stage !== existing.stage;
    const newProbability = stageChanged
      ? (body.probability ?? getStageProbability(body.stage))
      : body.probability;

    const updateData: Record<string, unknown> = {
      title: body.title,
      value: body.value,
      stage: body.stage,
      probability: newProbability,
      closeDate: body.closeDate ? new Date(body.closeDate) : undefined,
      notes: body.notes,
      lostReason: body.lostReason,
      winFactors: body.winFactors,
      nextStep: body.nextStep,
      proposalId: body.proposalId,
    };

    if (body.stage === 'ClosedWon' && existing.stage !== 'ClosedWon') {
      updateData.actualCloseDate = new Date();
    }

    if (stageChanged) {
      updateData.stageHistory = {
        create: {
          fromStage: existing.stage,
          toStage: body.stage,
          notes: body.stageChangeNotes || undefined,
        },
      };
    }

    const deal = await prisma.deal.update({
      where: { id },
      data: updateData,
      include: {
        client: { select: { id: true, name: true } },
        stageHistory: { orderBy: { changedAt: 'asc' } },
      },
    });

    return NextResponse.json(deal);
  } catch (error) {
    console.error('PUT /api/deals/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.deal.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    await prisma.deal.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/deals/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
