import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

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

    if (!body.clientId) {
      return NextResponse.json({ errors: { clientId: 'clientId is required' } }, { status: 400 });
    }

    const playbook = await prisma.playbook.findUnique({
      where: { id },
      include: { steps: { orderBy: { sortOrder: 'asc' } } },
    });

    if (!playbook) {
      return NextResponse.json({ error: 'Playbook not found' }, { status: 404 });
    }

    if (!playbook.isActive) {
      return NextResponse.json({ error: 'Playbook is not active' }, { status: 400 });
    }

    const client = await prisma.client.findUnique({ where: { id: body.clientId } });
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const now = new Date();
    const tasks = [];

    for (const step of playbook.steps) {
      const dueDate = new Date(now);
      dueDate.setDate(dueDate.getDate() + step.dayOffset);

      const task = await prisma.task.create({
        data: {
          title: step.title,
          description: step.taskTemplate,
          clientId: body.clientId,
          priority: 'Medium',
          status: 'open',
          category: 'playbook',
          dueDate,
          playbook: playbook.name,
        },
      });

      tasks.push(task);
    }

    return NextResponse.json(
      {
        success: true,
        playbook: playbook.name,
        client: client.name,
        tasksCreated: tasks.length,
        tasks,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/playbooks/[id]/trigger error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
