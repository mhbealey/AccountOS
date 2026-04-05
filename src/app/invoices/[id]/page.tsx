'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InvoicePreview } from '@/components/invoices/InvoicePreview';
import { InvoiceStatusActions } from '@/components/invoices/InvoiceStatusActions';
import { toast } from '@/components/layout/Toast';

interface InvoiceDetail {
  id: string;
  number: string;
  clientId: string;
  client: { id: string; name: string; status?: string };
  amount: number;
  tax: number;
  status: string;
  issuedDate: string;
  dueDate: string;
  paidDate: string | null;
  paymentMethod: string | null;
  notes: string | null;
  terms: string | null;
  reminderSentAt: string | null;
  createdAt: string;
  updatedAt: string;
  lineItems: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
    sortOrder: number;
  }>;
  timeEntries: Array<{
    id: string;
    description: string;
    hours: number;
    rate: number;
    date: string;
  }>;
}

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchInvoice = useCallback(async () => {
    try {
      const res = await fetch(`/api/invoices/${id}`);
      if (res.ok) {
        const data = await res.json();
        setInvoice(data);
      } else if (res.status === 404) {
        toast({ type: 'error', title: 'Invoice not found' });
        router.push('/invoices');
      }
    } catch {
      toast({ type: 'error', title: 'Failed to load invoice' });
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchInvoice();
  }, [fetchInvoice]);

  const handleStatusChange = async (status: string, extraData?: Record<string, string>) => {
    try {
      const body: Record<string, unknown> = { status };
      if (extraData) {
        Object.assign(body, extraData);
      }

      const res = await fetch(`/api/invoices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update status');
      }

      toast({ type: 'success', title: `Invoice marked as ${status}` });
      await fetchInvoice();
    } catch (error) {
      toast({
        type: 'error',
        title: error instanceof Error ? error.message : 'Failed to update status',
      });
    }
  };

  const handleSendReminder = async () => {
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reminderSentAt: new Date().toISOString() }),
      });

      if (!res.ok) throw new Error('Failed to send reminder');

      toast({ type: 'success', title: 'Payment reminder sent' });
      await fetchInvoice();
    } catch {
      toast({ type: 'error', title: 'Failed to send reminder' });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Build status timeline from available data
  const buildTimeline = (): Array<{ status: string; date: string }> => {
    if (!invoice) return [];
    const timeline: Array<{ status: string; date: string }> = [];

    timeline.push({ status: 'Created', date: invoice.createdAt });

    if (invoice.status !== 'Draft') {
      timeline.push({ status: 'Sent', date: invoice.issuedDate });
    }

    if (invoice.reminderSentAt) {
      timeline.push({ status: 'Reminder Sent', date: invoice.reminderSentAt });
    }

    if (invoice.paidDate) {
      timeline.push({
        status: `Paid${invoice.paymentMethod ? ` (${invoice.paymentMethod})` : ''}`,
        date: invoice.paidDate,
      });
    }

    if (invoice.status === 'Void') {
      timeline.push({ status: 'Voided', date: invoice.updatedAt });
    }

    if (invoice.status === 'Overdue') {
      timeline.push({ status: 'Overdue', date: invoice.dueDate });
    }

    return timeline;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-32 animate-pulse rounded-lg bg-card" />
        <div className="h-[600px] animate-pulse rounded-xl bg-card" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        Invoice not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <Button variant="ghost" size="sm" onClick={() => router.push('/invoices')}>
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to Invoices
        </Button>

        <div className="flex flex-wrap items-center gap-2">
          <InvoiceStatusActions
            invoiceId={invoice.id}
            currentStatus={invoice.status}
            onStatusChange={handleStatusChange}
            onSendReminder={handleSendReminder}
          />

          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="mr-1.5 h-3.5 w-3.5" />
            Print / PDF
          </Button>
        </div>
      </div>

      {/* Invoice preview */}
      <InvoicePreview invoice={invoice} statusTimeline={buildTimeline()} />
    </div>
  );
}
