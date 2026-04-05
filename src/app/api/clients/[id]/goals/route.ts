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

    const client = await prisma.client.findUnique({ where: { id } });
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const goals = await prisma.clientGoal.findMany({
      where: { clientId: id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(goals);
  } catch (error) {
    console.error('GET /api/clients/[id]/goals error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
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

    const client = await prisma.client.findUnique({ where: { id } });
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    if (!body.title || !body.title.trim()) {
      return NextResponse.json({ errors: { title: 'title is required' } }, { status: 400 });
    }

    const goal = await prisma.clientGoal.create({
      data: {
        clientId: id,
        title: body.title,
        description: body.description,
        targetMetric: body.targetMetric,
        targetValue: body.targetValue,
        currentValue: body.currentValue,
        status: body.status || 'In Progress',
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        quarter: body.quarter,
        notes: body.notes,
      },
    });

    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    console.error('POST /api/clients/[id]/goals error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
