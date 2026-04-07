import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    const where = clientId ? { clientId } : {};

    const activities = await prisma.activity.findMany({
      where,
      include: {
        client: { select: { id: true, name: true } },
        contact: { select: { id: true, name: true } },
      },
      orderBy: { date: 'desc' },
    });

    const mapped = activities.map((a) => ({
      ...a,
      clientName: a.client?.name ?? null,
      contactName: a.contact?.name ?? null,
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error('GET /api/v1/activities error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, title, clientId, ...rest } = body;

    if (!type || !title) {
      return NextResponse.json(
        { error: 'Type and title are required' },
        { status: 400 }
      );
    }

    const activity = await prisma.activity.create({
      data: {
        type,
        title,
        clientId: clientId || null,
        ...rest,
        date: rest.date ? new Date(rest.date) : new Date(),
      },
      include: {
        client: { select: { id: true, name: true } },
        contact: { select: { id: true, name: true } },
      },
    });

    // Update client lastContactAt
    if (clientId) {
      await prisma.client.update({
        where: { id: clientId },
        data: { lastContactAt: new Date() },
      });
    }

    return NextResponse.json(
      {
        ...activity,
        clientName: activity.client?.name ?? null,
        contactName: activity.contact?.name ?? null,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/v1/activities error:', error);
    return NextResponse.json(
      { error: 'Failed to create activity' },
      { status: 500 }
    );
  }
}
