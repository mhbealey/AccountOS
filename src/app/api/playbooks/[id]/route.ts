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

    const existing = await prisma.playbook.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Playbook not found' }, { status: 404 });
    }

    // If steps are provided, delete existing and recreate
    if (body.steps && Array.isArray(body.steps)) {
      await prisma.playbookStep.deleteMany({ where: { playbookId: id } });
    }

    const playbook = await prisma.playbook.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        trigger: body.trigger,
        isActive: body.isActive,
        ...(body.steps && Array.isArray(body.steps)
          ? {
              steps: {
                create: body.steps.map(
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
            }
          : {}),
      },
      include: {
        steps: { orderBy: { sortOrder: 'asc' } },
      },
    });

    return NextResponse.json(playbook);
  } catch (error) {
    console.error('PUT /api/playbooks/[id] error:', error);
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

    const existing = await prisma.playbook.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Playbook not found' }, { status: 404 });
    }

    await prisma.playbook.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/playbooks/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
