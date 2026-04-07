import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const entries = await prisma.timeEntry.findMany({
      include: {
        client: { select: { id: true, name: true } },
      },
      orderBy: { date: 'desc' },
    });

    const mapped = entries.map((e) => ({
      ...e,
      clientName: e.client?.name ?? null,
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error('GET /api/v1/time-entries error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch time entries' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { description, hours, rate, date, ...rest } = body;

    if (!description || hours == null || rate == null || !date) {
      return NextResponse.json(
        { error: 'Description, hours, rate, and date are required' },
        { status: 400 }
      );
    }

    const entry = await prisma.timeEntry.create({
      data: {
        description,
        hours: Number(hours),
        rate: Number(rate),
        date: new Date(date),
        ...rest,
      },
      include: {
        client: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error('POST /api/v1/time-entries error:', error);
    return NextResponse.json(
      { error: 'Failed to create time entry' },
      { status: 500 }
    );
  }
}
