import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.networkContact.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Network contact not found' },
        { status: 404 }
      );
    }

    const data: Record<string, unknown> = { ...body };
    if (body.lastContactAt !== undefined)
      data.lastContactAt = body.lastContactAt
        ? new Date(body.lastContactAt)
        : null;
    if (body.nextFollowUp !== undefined)
      data.nextFollowUp = body.nextFollowUp
        ? new Date(body.nextFollowUp)
        : null;

    const contact = await prisma.networkContact.update({
      where: { id },
      data,
    });

    return NextResponse.json(contact);
  } catch (error) {
    console.error('PATCH /api/v1/network/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update network contact' },
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

    const existing = await prisma.networkContact.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Network contact not found' },
        { status: 404 }
      );
    }

    await prisma.networkContact.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/v1/network/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete network contact' },
      { status: 500 }
    );
  }
}
