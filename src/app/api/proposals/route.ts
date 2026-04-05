import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { validateProposal } from '@/lib/validators';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const status = searchParams.get('status');
    const clientId = searchParams.get('clientId');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (clientId) where.clientId = clientId;

    const proposals = await prisma.proposal.findMany({
      where,
      include: {
        client: { select: { id: true, name: true } },
        deliverables: { orderBy: { sortOrder: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(proposals);
  } catch (error) {
    console.error('GET /api/proposals error:', error);
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
    const validation = validateProposal(body);
    if (!validation.valid) {
      return NextResponse.json({ errors: validation.errors }, { status: 400 });
    }

    const client = await prisma.client.findUnique({ where: { id: body.clientId } });
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const deliverables = body.deliverables || [];

    const proposal = await prisma.proposal.create({
      data: {
        clientId: body.clientId,
        title: body.title,
        status: body.status || 'Draft',
        type: body.type || 'Proposal',
        executiveSummary: body.executiveSummary,
        problemStatement: body.problemStatement,
        scopeOfWork: body.scopeOfWork,
        timeline: body.timeline,
        investment: body.investment,
        paymentTerms: body.paymentTerms,
        validUntil: body.validUntil ? new Date(body.validUntil) : undefined,
        notes: body.notes,
        deliverables: {
          create: deliverables.map(
            (d: { title: string; description?: string; sortOrder?: number }, index: number) => ({
              title: d.title,
              description: d.description,
              sortOrder: d.sortOrder ?? index,
            })
          ),
        },
      },
      include: {
        client: { select: { id: true, name: true } },
        deliverables: { orderBy: { sortOrder: 'asc' } },
      },
    });

    return NextResponse.json(proposal, { status: 201 });
  } catch (error) {
    console.error('POST /api/proposals error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
