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

    const existing = await prisma.contract.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    const contract = await prisma.contract.update({
      where: { id },
      data: {
        title: body.title,
        type: body.type,
        status: body.status,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        value: body.value,
        monthlyValue: body.monthlyValue,
        renewalType: body.renewalType,
        renewalTerms: body.renewalTerms,
        reminderDays: body.reminderDays,
        autoRenewDate: body.autoRenewDate ? new Date(body.autoRenewDate) : undefined,
        terminationClause: body.terminationClause,
        fileUrl: body.fileUrl,
        notes: body.notes,
      },
      include: {
        client: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(contract);
  } catch (error) {
    console.error('PUT /api/contracts/[id] error:', error);
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

    const existing = await prisma.contract.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    await prisma.contract.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/contracts/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
