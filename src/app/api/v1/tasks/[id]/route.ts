import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const data: Record<string, unknown> = { ...body };

    // If completing, set completedAt
    if (body.status === 'done' && existing.status !== 'done') {
      data.completedAt = new Date();
    }

    if (body.dueDate !== undefined) {
      data.dueDate = body.dueDate ? new Date(body.dueDate) : null;
    }

    const task = await prisma.task.update({
      where: { id },
      data,
      include: { client: { select: { id: true, name: true } } },
    });

    // If recurring task completed, create next instance
    if (
      body.status === 'done' &&
      existing.status !== 'done' &&
      existing.recurring
    ) {
      const dueDate = existing.dueDate ? new Date(existing.dueDate) : new Date();
      switch (existing.recurring) {
        case 'daily':
          dueDate.setDate(dueDate.getDate() + 1);
          break;
        case 'weekly':
          dueDate.setDate(dueDate.getDate() + 7);
          break;
        case 'biweekly':
          dueDate.setDate(dueDate.getDate() + 14);
          break;
        case 'monthly':
          dueDate.setMonth(dueDate.getMonth() + 1);
          break;
        case 'quarterly':
          dueDate.setMonth(dueDate.getMonth() + 3);
          break;
      }

      await prisma.task.create({
        data: {
          title: existing.title,
          description: existing.description,
          clientId: existing.clientId,
          priority: existing.priority,
          status: 'open',
          category: existing.category,
          dueDate,
          recurring: existing.recurring,
          recurringAnchor: existing.recurringAnchor,
          playbook: existing.playbook,
          playbookStep: existing.playbookStep,
          sortOrder: existing.sortOrder,
        },
      });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('PATCH /api/v1/tasks/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
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

    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    await prisma.task.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/v1/tasks/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}
