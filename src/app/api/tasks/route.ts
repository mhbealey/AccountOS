import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {};
    if (status) {
      where.status = status;
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        client: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const result = tasks.map(({ client, ...task }) => ({
      ...task,
      clientName: client?.name ?? null,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('GET /tasks error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        title: body.title,
        description: body.description ?? null,
        status: body.status ?? 'todo',
        priority: body.priority ?? 'medium',
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        clientId: body.clientId ?? null,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('POST /tasks error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
