import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { validateContact } from '@/lib/validators';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const client = await prisma.client.findUnique({ where: { id } });
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const contacts = await prisma.contact.findMany({
      where: { clientId: id },
      orderBy: { isPrimary: 'desc' },
    });

    return NextResponse.json(contacts);
  } catch (error) {
    console.error('GET /api/clients/[id]/contacts error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const client = await prisma.client.findUnique({ where: { id } });
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const validation = validateContact({ ...body, clientId: id });
    if (!validation.valid) {
      return NextResponse.json({ errors: validation.errors }, { status: 400 });
    }

    const contact = await prisma.contact.create({
      data: {
        clientId: id,
        name: body.name,
        title: body.title,
        email: body.email,
        phone: body.phone,
        role: body.role,
        sentiment: body.sentiment,
        isPrimary: body.isPrimary ?? false,
        isExecutive: body.isExecutive ?? false,
        notes: body.notes,
        linkedinUrl: body.linkedinUrl,
        birthday: body.birthday,
        interests: body.interests,
      },
    });

    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    console.error('POST /api/clients/[id]/contacts error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
