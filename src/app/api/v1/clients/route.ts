import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      include: {
        contacts: { select: { id: true, name: true, isPrimary: true } },
      },
      orderBy: { name: 'asc' },
    });

    const mapped = clients.map((c) => {
      const primaryContact = c.contacts.find((ct) => ct.isPrimary);
      return {
        ...c,
        contactCount: c.contacts.length,
        primaryContactName: primaryContact?.name ?? null,
        contacts: undefined,
      };
    });

    return NextResponse.json(mapped);
  } catch (error) {
    console.error('GET /api/v1/clients error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, ...rest } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const client = await prisma.client.create({
      data: { name, ...rest },
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error('POST /api/v1/clients error:', error);
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    );
  }
}
