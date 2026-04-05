import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const expenses = await prisma.expense.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(expenses);
  } catch (error) {
    console.error('GET /api/expenses error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    if (!body.title || !body.title.trim()) {
      return NextResponse.json({ errors: { title: 'title is required' } }, { status: 400 });
    }

    if (body.amount === undefined || body.amount === null || body.amount < 0) {
      return NextResponse.json({ errors: { amount: 'amount must be a positive number' } }, { status: 400 });
    }

    const expense = await prisma.expense.create({
      data: {
        title: body.title,
        amount: body.amount,
        frequency: body.frequency || 'monthly',
        category: body.category,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        notes: body.notes,
      },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error('POST /api/expenses error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
