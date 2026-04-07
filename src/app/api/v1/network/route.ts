import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const relationship = searchParams.get('relationship');
    const source = searchParams.get('source');

    const where: Record<string, string> = {};
    if (relationship) where.relationship = relationship;
    if (source) where.source = source;

    const contacts = await prisma.networkContact.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(contacts);
  } catch (error) {
    console.error('GET /api/v1/network error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch network contacts' },
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

    const contact = await prisma.networkContact.create({
      data: { name, ...rest },
    });

    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    console.error('POST /api/v1/network error:', error);
    return NextResponse.json(
      { error: 'Failed to create network contact' },
      { status: 500 }
    );
  }
}
