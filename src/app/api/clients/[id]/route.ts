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

    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        contacts: true,
        deals: { include: { stageHistory: true } },
        tasks: { orderBy: { dueDate: 'asc' } },
        timeEntries: { orderBy: { date: 'desc' } },
        invoices: { include: { lineItems: true } },
        contracts: true,
        activities: { orderBy: { date: 'desc' } },
        proposals: { include: { deliverables: true } },
        goals: true,
      },
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error('GET /api/clients/[id] error:', error);
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

    const existing = await prisma.client.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const client = await prisma.client.update({
      where: { id },
      data: {
        name: body.name,
        status: body.status,
        industry: body.industry,
        website: body.website,
        companySize: body.companySize,
        source: body.source,
        referredById: body.referredById,
        notes: body.notes,
        mrr: body.mrr,
        contractValue: body.contractValue,
        healthScore: body.healthScore,
        engagementScore: body.engagementScore,
        satisfactionScore: body.satisfactionScore,
        paymentScore: body.paymentScore,
        adoptionScore: body.adoptionScore,
        csmPulse: body.csmPulse,
        onboardedAt: body.onboardedAt ? new Date(body.onboardedAt) : undefined,
        firstValueAt: body.firstValueAt ? new Date(body.firstValueAt) : undefined,
        lastContactAt: body.lastContactAt ? new Date(body.lastContactAt) : undefined,
        nextQbrDate: body.nextQbrDate ? new Date(body.nextQbrDate) : undefined,
        churnedAt: body.churnedAt ? new Date(body.churnedAt) : undefined,
        churnReason: body.churnReason,
      },
    });

    return NextResponse.json(client);
  } catch (error) {
    console.error('PUT /api/clients/[id] error:', error);
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

    const existing = await prisma.client.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    await prisma.client.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/clients/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
