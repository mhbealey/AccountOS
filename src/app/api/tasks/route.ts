import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { validateTask } from '@/lib/validators';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const category = searchParams.get('category');
    const clientId = searchParams.get('clientId');
    const dueDateFrom = searchParams.get('dueDateFrom');
    const dueDateTo = searchParams.get('dueDateTo');

    const where: Record<string, unknown> = {};

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (category) where.category = category;
    if (clientId) where.clientId = clientId;

    if (dueDateFrom || dueDateTo) {
      const dateFilter: Record<string, Date> = {};
      if (dueDateFrom) dateFilter.gte = new Date(dueDateFrom);
      if (dueDateTo) dateFilter.lte = new Date(dueDateTo);
      where.dueDate = dateFilter;
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        client: { select: { id: true, name: true } },
      },
      orderBy: [{ dueDate: 'asc' }, { priority: 'asc' }],
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('GET /api/tasks error:', error);
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
    const validation = validateTask(body);
    if (!validation.valid) {
      return NextResponse.json({ errors: validation.errors }, { status: 400 });
    }

    if (body.clientId) {
      const client = await prisma.client.findUnique({ where: { id: body.clientId } });
      if (!client) {
        return NextResponse.json({ error: 'Client not found' }, { status: 404 });
      }
    }

    const task = await prisma.task.create({
      data: {
        title: body.title,
        description: body.description,
        clientId: body.clientId,
        priority: body.priority || 'Medium',
        status: body.status || 'open',
        category: body.category,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        recurring: body.recurring,
        playbook: body.playbook,
      },
      include: {
        client: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('POST /api/tasks error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
