import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { validateTimeEntry } from '@/lib/validators';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const clientId = searchParams.get('clientId');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const billable = searchParams.get('billable');
    const uninvoiced = searchParams.get('uninvoiced');

    const where: Record<string, unknown> = {};

    if (clientId) where.clientId = clientId;

    if (dateFrom || dateTo) {
      const dateFilter: Record<string, Date> = {};
      if (dateFrom) dateFilter.gte = new Date(dateFrom);
      if (dateTo) dateFilter.lte = new Date(dateTo);
      where.date = dateFilter;
    }

    if (billable !== null && billable !== undefined) {
      where.billable = billable === 'true';
    }

    if (uninvoiced === 'true') {
      where.invoiceId = null;
    }

    const timeEntries = await prisma.timeEntry.findMany({
      where,
      include: {
        client: { select: { id: true, name: true } },
        invoice: { select: { id: true, number: true } },
      },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(timeEntries);
  } catch (error) {
    console.error('GET /api/time-entries error:', error);
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
    const validation = validateTimeEntry(body);
    if (!validation.valid) {
      return NextResponse.json({ errors: validation.errors }, { status: 400 });
    }

    if (body.clientId) {
      const client = await prisma.client.findUnique({ where: { id: body.clientId } });
      if (!client) {
        return NextResponse.json({ error: 'Client not found' }, { status: 404 });
      }
    }

    const timeEntry = await prisma.timeEntry.create({
      data: {
        clientId: body.clientId,
        description: body.description,
        hours: body.hours,
        rate: body.rate,
        date: new Date(body.date),
        category: body.category,
        billable: body.billable ?? true,
        timerStart: body.timerStart ? new Date(body.timerStart) : undefined,
      },
      include: {
        client: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(timeEntry, { status: 201 });
  } catch (error) {
    console.error('POST /api/time-entries error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
