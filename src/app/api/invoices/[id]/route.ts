import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { transition } from '@/lib/invoice-state-machine';

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

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, name: true, status: true } },
        lineItems: { orderBy: { sortOrder: 'asc' } },
        timeEntries: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error('GET /api/invoices/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
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

    const existing = await prisma.invoice.findUnique({
      where: { id },
      include: { timeEntries: true },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Enforce state machine transitions if status is changing
    if (body.status && body.status !== existing.status) {
      const result = transition(existing.status, body.status);
      if (!result.valid) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
    }

    const updateData: Record<string, unknown> = {
      amount: body.amount,
      tax: body.tax,
      status: body.status,
      issuedDate: body.issuedDate ? new Date(body.issuedDate) : undefined,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      notes: body.notes,
      terms: body.terms,
      paymentMethod: body.paymentMethod,
      reminderSentAt: body.reminderSentAt ? new Date(body.reminderSentAt) : undefined,
    };

    // If marking as Paid, set paidDate
    if (body.status === 'Paid' && existing.status !== 'Paid') {
      updateData.paidDate = body.paidDate ? new Date(body.paidDate) : new Date();
    }

    // If voiding, unlink time entries
    if (body.status === 'Void' && existing.status !== 'Void') {
      await prisma.timeEntry.updateMany({
        where: { invoiceId: id },
        data: { invoiceId: null },
      });
    }

    const invoice = await prisma.invoice.update({
      where: { id },
      data: updateData,
      include: {
        client: { select: { id: true, name: true } },
        lineItems: { orderBy: { sortOrder: 'asc' } },
        timeEntries: true,
      },
    });

    return NextResponse.json(invoice);
  } catch (error) {
    console.error('PUT /api/invoices/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.invoice.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    if (existing.status !== 'Draft') {
      return NextResponse.json(
        { error: 'Only draft invoices can be deleted' },
        { status: 400 }
      );
    }

    // Unlink time entries before deleting
    await prisma.timeEntry.updateMany({
      where: { invoiceId: id },
      data: { invoiceId: null },
    });

    await prisma.invoice.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/invoices/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
