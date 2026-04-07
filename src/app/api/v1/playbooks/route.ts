import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const playbooks = await prisma.playbook.findMany({
      include: {
        _count: { select: { steps: true } },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(playbooks);
  } catch (error) {
    console.error('GET /api/v1/playbooks error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch playbooks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, trigger, ...rest } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    if (!trigger) {
      return NextResponse.json(
        { error: 'Trigger is required' },
        { status: 400 }
      );
    }

    const playbook = await prisma.playbook.create({
      data: { name, trigger, ...rest },
    });

    return NextResponse.json(playbook, { status: 201 });
  } catch (error) {
    console.error('POST /api/v1/playbooks error:', error);
    return NextResponse.json(
      { error: 'Failed to create playbook' },
      { status: 500 }
    );
  }
}
