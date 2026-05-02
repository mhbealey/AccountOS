import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const serviceName: string = body.serviceName ?? 'Service';

    const activity = await prisma.activity.create({
      data: {
        clientId: id,
        type: 'service_ping',
        title: `Pinged ${serviceName}`,
        details: body.serviceId ?? null,
      },
    });

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error('POST /api/clients/[id]/ping error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
