import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const contract = await prisma.contract.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, name: true } },
      },
    });

    if (!contract) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(contract);
  } catch (error) {
    console.error('GET /api/v1/contracts/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contract' },
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

    const existing = await prisma.contract.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      );
    }

    const data: Record<string, unknown> = { ...body };
    if (body.startDate !== undefined)
      data.startDate = body.startDate ? new Date(body.startDate) : null;
    if (body.endDate !== undefined)
      data.endDate = body.endDate ? new Date(body.endDate) : null;
    if (body.value !== undefined)
      data.value = body.value != null ? Number(body.value) : null;
    if (body.monthlyValue !== undefined)
      data.monthlyValue =
        body.monthlyValue != null ? Number(body.monthlyValue) : null;

    const contract = await prisma.contract.update({
      where: { id },
      data,
      include: { client: { select: { id: true, name: true } } },
    });

    return NextResponse.json(contract);
  } catch (error) {
    console.error('PATCH /api/v1/contracts/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update contract' },
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

    const existing = await prisma.contract.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      );
    }

    await prisma.contract.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/v1/contracts/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete contract' },
      { status: 500 }
    );
  }
}
