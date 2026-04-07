import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const status = searchParams.get('status');

    const where: Record<string, string> = {};
    if (clientId) where.clientId = clientId;
    if (status) where.status = status;

    const proposals = await prisma.proposal.findMany({
      where,
      include: {
        client: { select: { id: true, name: true } },
        _count: { select: { deliverables: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(proposals);
  } catch (error) {
    console.error('GET /api/v1/proposals error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch proposals' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, clientId, ...rest } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      );
    }

    const proposal = await prisma.proposal.create({
      data: { title, clientId, ...rest },
    });

    return NextResponse.json(proposal, { status: 201 });
  } catch (error) {
    console.error('POST /api/v1/proposals error:', error);
    return NextResponse.json(
      { error: 'Failed to create proposal' },
      { status: 500 }
    );
  }
}
