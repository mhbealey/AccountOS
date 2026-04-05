import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

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

    const existing = await prisma.clientGoal.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {
      title: body.title,
      description: body.description,
      targetMetric: body.targetMetric,
      targetValue: body.targetValue,
      currentValue: body.currentValue,
      status: body.status,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      quarter: body.quarter,
      notes: body.notes,
    };

    // If status changed to 'Achieved', set achievedAt
    if (body.status === 'Achieved' && existing.status !== 'Achieved') {
      updateData.achievedAt = new Date();
    }

    const goal = await prisma.clientGoal.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(goal);
  } catch (error) {
    console.error('PUT /api/goals/[id] error:', error);
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

    const existing = await prisma.clientGoal.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    await prisma.clientGoal.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/goals/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
