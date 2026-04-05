import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { validateDeal } from '@/lib/validators';
import { getStageProbability } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const stage = searchParams.get('stage');

    const where: Record<string, unknown> = {};
    if (stage) {
      where.stage = stage;
    }

    const deals = await prisma.deal.findMany({
      where,
      include: {
        client: { select: { id: true, name: true, status: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(deals);
  } catch (error) {
    console.error('GET /api/deals error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = validateDeal(body);
    if (!validation.valid) {
      return NextResponse.json({ errors: validation.errors }, { status: 400 });
    }

    const client = await prisma.client.findUnique({ where: { id: body.clientId } });
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const stage = body.stage || 'Lead';
    const probability = body.probability ?? getStageProbability(stage);

    const deal = await prisma.deal.create({
      data: {
        clientId: body.clientId,
        title: body.title,
        value: body.value,
        stage,
        probability,
        closeDate: body.closeDate ? new Date(body.closeDate) : undefined,
        notes: body.notes,
        nextStep: body.nextStep,
        proposalId: body.proposalId,
        stageHistory: {
          create: {
            fromStage: '',
            toStage: stage,
            notes: 'Deal created',
          },
        },
      },
      include: {
        client: { select: { id: true, name: true } },
        stageHistory: true,
      },
    });

    return NextResponse.json(deal, { status: 201 });
  } catch (error) {
    console.error('POST /api/deals error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
