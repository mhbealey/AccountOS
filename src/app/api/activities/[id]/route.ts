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

    const existing = await prisma.activity.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    const activity = await prisma.activity.update({
      where: { id },
      data: {
        clientId: body.clientId,
        contactId: body.contactId,
        dealId: body.dealId,
        type: body.type,
        title: body.title,
        description: body.description,
        date: body.date ? new Date(body.date) : undefined,
        duration: body.duration,
        outcome: body.outcome,
        sentiment: body.sentiment,
        isKeyMoment: body.isKeyMoment,
      },
      include: {
        client: { select: { id: true, name: true } },
        contact: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(activity);
  } catch (error) {
    console.error('PUT /api/activities/[id] error:', error);
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

    const existing = await prisma.activity.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    await prisma.activity.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/activities/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
