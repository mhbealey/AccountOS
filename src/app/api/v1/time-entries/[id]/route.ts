import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.timeEntry.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Time entry not found' },
        { status: 404 }
      );
    }

    const data: Record<string, unknown> = { ...body };
    if (body.date) data.date = new Date(body.date);
    if (body.hours != null) data.hours = Number(body.hours);
    if (body.rate != null) data.rate = Number(body.rate);

    const entry = await prisma.timeEntry.update({
      where: { id },
      data,
      include: { client: { select: { id: true, name: true } } },
    });

    return NextResponse.json(entry);
  } catch (error) {
    console.error('PATCH /api/v1/time-entries/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update time entry' },
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

    const existing = await prisma.timeEntry.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Time entry not found' },
        { status: 404 }
      );
    }

    await prisma.timeEntry.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/v1/time-entries/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete time entry' },
      { status: 500 }
    );
  }
}
