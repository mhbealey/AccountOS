import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { validateContract } from '@/lib/validators';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const status = searchParams.get('status');
    const clientId = searchParams.get('clientId');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (clientId) where.clientId = clientId;

    const contracts = await prisma.contract.findMany({
      where,
      include: {
        client: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(contracts);
  } catch (error) {
    console.error('GET /api/contracts error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = validateContract(body);
    if (!validation.valid) {
      return NextResponse.json({ errors: validation.errors }, { status: 400 });
    }

    const client = await prisma.client.findUnique({ where: { id: body.clientId } });
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const contract = await prisma.contract.create({
      data: {
        clientId: body.clientId,
        title: body.title,
        type: body.type,
        status: body.status || 'Draft',
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        value: body.value,
        monthlyValue: body.monthlyValue,
        renewalType: body.renewalType,
        renewalTerms: body.renewalTerms,
        reminderDays: body.reminderDays ?? 30,
        autoRenewDate: body.autoRenewDate ? new Date(body.autoRenewDate) : undefined,
        terminationClause: body.terminationClause,
        fileUrl: body.fileUrl,
        notes: body.notes,
      },
      include: {
        client: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(contract, { status: 201 });
  } catch (error) {
    console.error('POST /api/contracts error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
