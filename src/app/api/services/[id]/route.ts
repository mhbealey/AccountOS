import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: serviceId } = await params;

  try {
    const body = await request.json();
    const { clientId, status, revenue, notes } = body;

    if (!clientId || !status) {
      return NextResponse.json(
        { error: 'clientId and status are required' },
        { status: 400 }
      );
    }

    // Verify service exists
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    // Verify client exists
    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Upsert ClientService record
    const clientService = await prisma.clientService.upsert({
      where: {
        clientId_serviceId: {
          clientId,
          serviceId,
        },
      },
      update: {
        status,
        revenue: revenue ?? undefined,
        notes: notes ?? undefined,
      },
      create: {
        clientId,
        serviceId,
        status,
        revenue: revenue ?? null,
        notes: notes ?? null,
      },
    });

    return NextResponse.json(clientService, { status: 201 });
  } catch (error) {
    console.error('POST /services/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
