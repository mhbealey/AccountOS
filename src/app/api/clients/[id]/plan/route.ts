import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const items = await prisma.accountPlanItem.findMany({
      where: { clientId: id },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error('GET /api/clients/[id]/plan error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();

    const item = await prisma.accountPlanItem.create({
      data: {
        clientId: id,
        task: body.task ?? '',
        description: body.description ?? null,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        roi: body.roi ?? null,
        comments: body.comments ?? null,
        order: body.order ?? 0,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('POST /api/clients/[id]/plan error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
