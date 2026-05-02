import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      select: {
        id: true,
        name: true,
        mrr: true,
        contractStart: true,
        createdAt: true,
        forecastCallPercent: true,
        forecastReason: true,
        services: {
          include: { service: true },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(clients);
  } catch (error) {
    console.error('GET /api/os error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
