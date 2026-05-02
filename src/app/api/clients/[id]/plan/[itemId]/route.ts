import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const { itemId } = await params;

  try {
    const body = await request.json();

    const data: Record<string, unknown> = {};
    if ('task' in body) data.task = body.task;
    if ('description' in body) data.description = body.description;
    if ('dueDate' in body) data.dueDate = body.dueDate ? new Date(body.dueDate) : null;
    if ('roi' in body) data.roi = body.roi;
    if ('comments' in body) data.comments = body.comments;
    if ('order' in body) data.order = body.order;

    const item = await prisma.accountPlanItem.update({
      where: { id: itemId },
      data,
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error('PATCH /api/clients/[id]/plan/[itemId] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const { itemId } = await params;

  try {
    await prisma.accountPlanItem.delete({ where: { id: itemId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/clients/[id]/plan/[itemId] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
