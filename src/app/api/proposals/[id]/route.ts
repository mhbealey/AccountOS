import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

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

    const proposal = await prisma.proposal.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, name: true, status: true } },
        deliverables: { orderBy: { sortOrder: 'asc' } },
      },
    });

    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    // Check for auto-expire
    if (
      proposal.status === 'Sent' &&
      proposal.validUntil &&
      new Date(proposal.validUntil) < new Date()
    ) {
      const updated = await prisma.proposal.update({
        where: { id },
        data: { status: 'Expired' },
        include: {
          client: { select: { id: true, name: true, status: true } },
          deliverables: { orderBy: { sortOrder: 'asc' } },
        },
      });
      return NextResponse.json(updated);
    }

    return NextResponse.json(proposal);
  } catch (error) {
    console.error('GET /api/proposals/[id] error:', error);
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

    const existing = await prisma.proposal.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    // Auto-expire check
    let status = body.status;
    if (
      !status &&
      existing.status === 'Sent' &&
      body.validUntil &&
      new Date(body.validUntil) < new Date()
    ) {
      status = 'Expired';
    }

    // Handle deliverables: delete existing and recreate
    if (body.deliverables && Array.isArray(body.deliverables)) {
      await prisma.proposalDeliverable.deleteMany({ where: { proposalId: id } });
    }

    const proposal = await prisma.proposal.update({
      where: { id },
      data: {
        title: body.title,
        status,
        type: body.type,
        executiveSummary: body.executiveSummary,
        problemStatement: body.problemStatement,
        scopeOfWork: body.scopeOfWork,
        timeline: body.timeline,
        investment: body.investment,
        paymentTerms: body.paymentTerms,
        validUntil: body.validUntil ? new Date(body.validUntil) : undefined,
        sentAt: body.sentAt ? new Date(body.sentAt) : undefined,
        acceptedAt: body.acceptedAt ? new Date(body.acceptedAt) : undefined,
        declinedReason: body.declinedReason,
        notes: body.notes,
        ...(body.deliverables && Array.isArray(body.deliverables)
          ? {
              deliverables: {
                create: body.deliverables.map(
                  (
                    d: { title: string; description?: string; sortOrder?: number },
                    index: number
                  ) => ({
                    title: d.title,
                    description: d.description,
                    sortOrder: d.sortOrder ?? index,
                  })
                ),
              },
            }
          : {}),
      },
      include: {
        client: { select: { id: true, name: true } },
        deliverables: { orderBy: { sortOrder: 'asc' } },
      },
    });

    return NextResponse.json(proposal);
  } catch (error) {
    console.error('PUT /api/proposals/[id] error:', error);
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

    const existing = await prisma.proposal.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    await prisma.proposal.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/proposals/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
