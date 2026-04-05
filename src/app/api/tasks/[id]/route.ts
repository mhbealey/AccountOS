import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

function calculateNextDueDate(currentDueDate: Date | null, recurring: string): Date {
  const base = currentDueDate || new Date();
  const next = new Date(base);

  switch (recurring) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'biweekly':
      next.setDate(next.getDate() + 14);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'quarterly':
      next.setMonth(next.getMonth() + 3);
      break;
    case 'yearly':
      next.setFullYear(next.getFullYear() + 1);
      break;
    default:
      next.setDate(next.getDate() + 7);
      break;
  }

  return next;
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

    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const statusChangedToDone =
      body.status === 'done' && existing.status !== 'done';

    const updateData: Record<string, unknown> = {
      title: body.title,
      description: body.description,
      clientId: body.clientId,
      priority: body.priority,
      status: body.status,
      category: body.category,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      recurring: body.recurring,
      playbook: body.playbook,
    };

    if (statusChangedToDone) {
      updateData.completedAt = new Date();
    }

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        client: { select: { id: true, name: true } },
      },
    });

    // If completed and has recurring schedule, create the next instance
    if (statusChangedToDone && (existing.recurring || body.recurring)) {
      const recurringValue = body.recurring || existing.recurring;
      const nextDueDate = calculateNextDueDate(existing.dueDate, recurringValue);

      await prisma.task.create({
        data: {
          title: existing.title,
          description: existing.description,
          clientId: existing.clientId,
          priority: existing.priority,
          status: 'open',
          category: existing.category,
          dueDate: nextDueDate,
          recurring: recurringValue,
          playbook: existing.playbook,
        },
      });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('PUT /api/tasks/[id] error:', error);
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

    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    await prisma.task.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/tasks/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
