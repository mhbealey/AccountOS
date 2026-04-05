import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const playbooks = await prisma.playbook.findMany({
      include: {
        steps: { orderBy: { sortOrder: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(playbooks);
  } catch (error) {
    console.error('GET /api/playbooks error:', error);
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

    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ errors: { name: 'name is required' } }, { status: 400 });
    }

    if (!body.trigger || !body.trigger.trim()) {
      return NextResponse.json({ errors: { trigger: 'trigger is required' } }, { status: 400 });
    }

    const steps = body.steps || [];

    const playbook = await prisma.playbook.create({
      data: {
        name: body.name,
        description: body.description,
        trigger: body.trigger,
        isActive: body.isActive ?? true,
        steps: {
          create: steps.map(
            (
              s: { title: string; dayOffset?: number; taskTemplate?: string; sortOrder?: number },
              index: number
            ) => ({
              title: s.title,
              dayOffset: s.dayOffset ?? 0,
              taskTemplate: s.taskTemplate,
              sortOrder: s.sortOrder ?? index,
            })
          ),
        },
      },
      include: {
        steps: { orderBy: { sortOrder: 'asc' } },
      },
    });

    return NextResponse.json(playbook, { status: 201 });
  } catch (error) {
    console.error('POST /api/playbooks error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
