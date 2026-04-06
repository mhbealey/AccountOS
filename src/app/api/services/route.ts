import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const [services, clients, clientServices] = await Promise.all([
      prisma.service.findMany({ orderBy: { name: 'asc' } }),
      prisma.client.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
      prisma.clientService.findMany(),
    ]);

    // Build matrix: for each client, which services they have and the status
    const matrix = clients.map((client) => {
      const serviceMap: Record<string, { status: string; revenue: number | null; clientServiceId: string }> = {};
      for (const cs of clientServices) {
        if (cs.clientId === client.id) {
          serviceMap[cs.serviceId] = {
            status: cs.status,
            revenue: cs.revenue,
            clientServiceId: cs.id,
          };
        }
      }
      return {
        clientId: client.id,
        clientName: client.name,
        services: serviceMap,
      };
    });

    return NextResponse.json({ services, matrix });
  } catch (error) {
    console.error('GET /services error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
