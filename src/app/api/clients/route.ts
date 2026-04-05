import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { validateClient } from '@/lib/validators';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { industry: { contains: search } },
        { notes: { contains: search } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const clients = await prisma.client.findMany({
      where,
      include: {
        _count: {
          select: { contacts: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(clients);
  } catch (error) {
    console.error('GET /api/clients error:', error);
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
    const validation = validateClient(body);
    if (!validation.valid) {
      return NextResponse.json({ errors: validation.errors }, { status: 400 });
    }

    const client = await prisma.client.create({
      data: {
        name: body.name,
        status: body.status,
        industry: body.industry,
        website: body.website,
        companySize: body.companySize,
        source: body.source,
        referredById: body.referredById,
        notes: body.notes,
        mrr: body.mrr ?? 0,
        contractValue: body.contractValue ?? 0,
        healthScore: body.healthScore ?? 50,
        engagementScore: body.engagementScore ?? 50,
        satisfactionScore: body.satisfactionScore,
        paymentScore: body.paymentScore ?? 100,
        adoptionScore: body.adoptionScore,
        csmPulse: body.csmPulse ?? 50,
        onboardedAt: body.onboardedAt ? new Date(body.onboardedAt) : undefined,
        lastContactAt: body.lastContactAt ? new Date(body.lastContactAt) : undefined,
        nextQbrDate: body.nextQbrDate ? new Date(body.nextQbrDate) : undefined,
      },
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error('POST /api/clients error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
