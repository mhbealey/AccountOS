import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { validateActivity } from '@/lib/validators';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const clientId = searchParams.get('clientId');
    const type = searchParams.get('type');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    const where: Record<string, unknown> = {};

    if (clientId) where.clientId = clientId;
    if (type) where.type = type;

    if (dateFrom || dateTo) {
      const dateFilter: Record<string, Date> = {};
      if (dateFrom) dateFilter.gte = new Date(dateFrom);
      if (dateTo) dateFilter.lte = new Date(dateTo);
      where.date = dateFilter;
    }

    const activities = await prisma.activity.findMany({
      where,
      include: {
        client: { select: { id: true, name: true } },
        contact: { select: { id: true, name: true } },
      },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(activities);
  } catch (error) {
    console.error('GET /api/activities error:', error);
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
    const validation = validateActivity(body);
    if (!validation.valid) {
      return NextResponse.json({ errors: validation.errors }, { status: 400 });
    }

    if (body.clientId) {
      const client = await prisma.client.findUnique({ where: { id: body.clientId } });
      if (!client) {
        return NextResponse.json({ error: 'Client not found' }, { status: 404 });
      }
    }

    const activityDate = body.date ? new Date(body.date) : new Date();

    const activity = await prisma.activity.create({
      data: {
        clientId: body.clientId,
        contactId: body.contactId,
        dealId: body.dealId,
        type: body.type,
        title: body.title,
        description: body.description,
        date: activityDate,
        duration: body.duration,
        outcome: body.outcome,
        sentiment: body.sentiment,
        isKeyMoment: body.isKeyMoment ?? false,
      },
      include: {
        client: { select: { id: true, name: true } },
        contact: { select: { id: true, name: true } },
      },
    });

    // Auto-update client.lastContactAt
    if (body.clientId) {
      await prisma.client.update({
        where: { id: body.clientId },
        data: { lastContactAt: activityDate },
      });
    }

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error('POST /api/activities error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
