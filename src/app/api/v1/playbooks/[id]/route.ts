import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const playbook = await prisma.playbook.findUnique({
      where: { id },
      include: {
        steps: { orderBy: { sortOrder: 'asc' } },
      },
    });

    if (!playbook) {
      return NextResponse.json(
        { error: 'Playbook not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(playbook);
  } catch (error) {
    console.error('GET /api/v1/playbooks/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch playbook' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.playbook.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Playbook not found' },
        { status: 404 }
      );
    }

    const { steps, ...rest } = body;

    const playbook = await prisma.playbook.update({
      where: { id },
      data: rest,
      include: { steps: { orderBy: { sortOrder: 'asc' } } },
    });

    return NextResponse.json(playbook);
  } catch (error) {
    console.error('PATCH /api/v1/playbooks/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update playbook' },
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

    const existing = await prisma.playbook.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Playbook not found' },
        { status: 404 }
      );
    }

    await prisma.playbook.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/v1/playbooks/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete playbook' },
      { status: 500 }
    );
  }
}
