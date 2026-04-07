import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where = status ? { status } : {};

    const tasks = await prisma.task.findMany({
      where,
      include: {
        client: { select: { id: true, name: true } },
      },
      orderBy: [{ dueDate: 'asc' }, { sortOrder: 'asc' }],
    });

    const mapped = tasks.map((t) => ({
      ...t,
      clientName: t.client?.name ?? null,
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error('GET /api/v1/tasks error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, ...rest } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const task = await prisma.task.create({
      data: {
        title,
        ...rest,
        dueDate: rest.dueDate ? new Date(rest.dueDate) : null,
      },
      include: {
        client: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('POST /api/v1/tasks error:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}
