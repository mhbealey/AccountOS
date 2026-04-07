import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const now = new Date();

    // Auto-update Sent -> Overdue if past due
    await prisma.invoice.updateMany({
      where: {
        status: 'Sent',
        dueDate: { lt: now },
      },
      data: { status: 'Overdue' },
    });

    const invoices = await prisma.invoice.findMany({
      include: {
        client: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const mapped = invoices.map((inv) => ({
      ...inv,
      clientName: inv.client.name,
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error('GET /api/v1/invoices error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientId, amount, lineItems, ...rest } = body;

    if (!clientId || amount == null) {
      return NextResponse.json(
        { error: 'ClientId and amount are required' },
        { status: 400 }
      );
    }

    // Auto-increment invoice number
    const user = await prisma.user.findFirst();
    const counter = (user?.invoiceCounter ?? 0) + 1;

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { invoiceCounter: counter },
      });
    }

    const number = `INV-${String(counter).padStart(4, '0')}`;

    const invoice = await prisma.invoice.create({
      data: {
        clientId,
        number,
        amount: Number(amount),
        tax: rest.tax != null ? Number(rest.tax) : 0,
        status: rest.status || 'Draft',
        issuedDate: rest.issuedDate ? new Date(rest.issuedDate) : new Date(),
        dueDate: rest.dueDate
          ? new Date(rest.dueDate)
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        notes: rest.notes || null,
        terms: rest.terms || null,
        lineItems: lineItems
          ? {
              create: lineItems.map(
                (
                  item: {
                    description: string;
                    quantity?: number;
                    unitPrice: number;
                    amount: number;
                    sortOrder?: number;
                  },
                  index: number
                ) => ({
                  description: item.description,
                  quantity: item.quantity ?? 1,
                  unitPrice: Number(item.unitPrice),
                  amount: Number(item.amount),
                  sortOrder: item.sortOrder ?? index,
                })
              ),
            }
          : undefined,
      },
      include: {
        client: { select: { id: true, name: true } },
        lineItems: true,
      },
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error('POST /api/v1/invoices error:', error);
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}
