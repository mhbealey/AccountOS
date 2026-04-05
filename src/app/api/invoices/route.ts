import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        client: { select: { id: true, name: true } },
        lineItems: { orderBy: { sortOrder: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(invoices);
  } catch (error) {
    console.error('GET /api/invoices error:', error);
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

    if (!body.clientId) {
      return NextResponse.json({ errors: { clientId: 'clientId is required' } }, { status: 400 });
    }

    const client = await prisma.client.findUnique({ where: { id: body.clientId } });
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Auto-generate sequential invoice number
    const lastInvoice = await prisma.invoice.findFirst({
      where: { number: { startsWith: 'INV-' } },
      orderBy: { number: 'desc' },
    });

    let nextNumber = 'INV-001';
    if (lastInvoice) {
      const lastNum = parseInt(lastInvoice.number.replace('INV-', ''), 10);
      if (!isNaN(lastNum)) {
        nextNumber = `INV-${String(lastNum + 1).padStart(3, '0')}`;
      }
    }

    const invoiceNumber = body.number || nextNumber;

    // Calculate amount from line items if provided
    const lineItems = body.lineItems || [];
    let amount = body.amount;
    if (!amount && lineItems.length > 0) {
      amount = lineItems.reduce(
        (sum: number, item: { quantity?: number; unitPrice: number; amount?: number }) =>
          sum + (item.amount || (item.quantity || 1) * item.unitPrice),
        0
      );
    }

    if (!amount || amount <= 0) {
      return NextResponse.json({ errors: { amount: 'amount must be positive' } }, { status: 400 });
    }

    if (!body.issuedDate || !body.dueDate) {
      return NextResponse.json(
        { errors: { issuedDate: 'issuedDate is required', dueDate: 'dueDate is required' } },
        { status: 400 }
      );
    }

    const invoice = await prisma.invoice.create({
      data: {
        clientId: body.clientId,
        number: invoiceNumber,
        amount,
        tax: body.tax ?? 0,
        status: body.status || 'Draft',
        issuedDate: new Date(body.issuedDate),
        dueDate: new Date(body.dueDate),
        notes: body.notes,
        terms: body.terms,
        lineItems: {
          create: lineItems.map(
            (
              item: { description: string; quantity?: number; unitPrice: number; amount?: number; sortOrder?: number },
              index: number
            ) => ({
              description: item.description,
              quantity: item.quantity || 1,
              unitPrice: item.unitPrice,
              amount: item.amount || (item.quantity || 1) * item.unitPrice,
              sortOrder: item.sortOrder ?? index,
            })
          ),
        },
      },
      include: {
        client: { select: { id: true, name: true } },
        lineItems: { orderBy: { sortOrder: 'asc' } },
      },
    });

    // Link time entries if provided
    if (body.timeEntryIds && Array.isArray(body.timeEntryIds) && body.timeEntryIds.length > 0) {
      await prisma.timeEntry.updateMany({
        where: { id: { in: body.timeEntryIds } },
        data: { invoiceId: invoice.id },
      });
    }

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error('POST /api/invoices error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
