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

    const existing = await prisma.timeEntry.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Time entry not found' }, { status: 404 });
    }

    const timeEntry = await prisma.timeEntry.update({
      where: { id },
      data: {
        clientId: body.clientId,
        description: body.description,
        hours: body.hours,
        rate: body.rate,
        date: body.date ? new Date(body.date) : undefined,
        category: body.category,
        billable: body.billable,
        invoiceId: body.invoiceId,
        timerStart: body.timerStart ? new Date(body.timerStart) : body.timerStart === null ? null : undefined,
      },
      include: {
        client: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(timeEntry);
  } catch (error) {
    console.error('PUT /api/time-entries/[id] error:', error);
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

    const existing = await prisma.timeEntry.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Time entry not found' }, { status: 404 });
    }

    await prisma.timeEntry.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/time-entries/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
