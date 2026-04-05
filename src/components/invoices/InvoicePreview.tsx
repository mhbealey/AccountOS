'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { InvoiceLineItems, type LineItem } from '@/components/invoices/InvoiceLineItems';
import { formatCurrency, formatDate } from '@/lib/utils';

interface InvoicePreviewProps {
  invoice: {
    number: string;
    status: string;
    issuedDate: string;
    dueDate: string;
    paidDate: string | null;
    amount: number;
    tax: number;
    notes: string | null;
    terms: string | null;
    client: { id: string; name: string; status?: string };
    lineItems: Array<{
      id: string;
      description: string;
      quantity: number;
      unitPrice: number;
      amount: number;
    }>;
  };
  statusTimeline?: Array<{ status: string; date: string }>;
}

const statusBadgeVariant: Record<string, 'default' | 'info' | 'success' | 'danger' | 'warning'> = {
  Draft: 'default',
  Sent: 'info',
  Viewed: 'info',
  Paid: 'success',
  Overdue: 'danger',
  Void: 'default',
};

export function InvoicePreview({ invoice, statusTimeline }: InvoicePreviewProps) {
  const subtotal = invoice.lineItems.reduce((sum, item) => sum + item.amount, 0);
  const taxAmount = subtotal * (invoice.tax / 100);
  const total = subtotal + taxAmount;

  return (
    <div className="rounded-xl border border-border bg-card print:border-none print:bg-white print:text-black">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border p-6 sm:flex-row sm:items-start sm:justify-between print:border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-foreground print:text-black">AccountOS</h1>
          <p className="mt-1 text-sm text-muted-foreground print:text-gray-500">
            Professional Services
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-foreground print:text-black">INVOICE</div>
          <div className="mt-1 font-mono text-lg text-primary print:text-indigo-600">
            {invoice.number}
          </div>
          <Badge
            variant={statusBadgeVariant[invoice.status] || 'default'}
            className="mt-2 text-sm print:hidden"
          >
            {invoice.status}
          </Badge>
        </div>
      </div>

      {/* Client + dates */}
      <div className="grid grid-cols-1 gap-6 border-b border-border p-6 sm:grid-cols-2 print:border-gray-200">
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground print:text-gray-500">
            Bill To
          </div>
          <div className="mt-2 text-base font-semibold text-foreground print:text-black">
            {invoice.client.name}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground print:text-gray-500">
              Issued
            </div>
            <div className="mt-1 text-foreground print:text-black">{formatDate(invoice.issuedDate)}</div>
          </div>
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground print:text-gray-500">
              Due
            </div>
            <div className="mt-1 text-foreground print:text-black">{formatDate(invoice.dueDate)}</div>
          </div>
          {invoice.paidDate && (
            <div className="col-span-2">
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground print:text-gray-500">
                Paid
              </div>
              <div className="mt-1 text-[#22c55e]">{formatDate(invoice.paidDate)}</div>
            </div>
          )}
        </div>
      </div>

      {/* Line items */}
      <div className="border-b border-border p-6 print:border-gray-200">
        <InvoiceLineItems
          items={invoice.lineItems.map((item) => ({
            ...item,
          }))}
          onChange={() => {}}
          readOnly
        />
      </div>

      {/* Totals */}
      <div className="flex justify-end border-b border-border p-6 print:border-gray-200">
        <div className="w-64 space-y-2 text-sm">
          <div className="flex justify-between text-muted-foreground print:text-gray-500">
            <span>Subtotal</span>
            <span className="font-medium text-foreground print:text-black">{formatCurrency(subtotal)}</span>
          </div>
          {invoice.tax > 0 && (
            <div className="flex justify-between text-muted-foreground print:text-gray-500">
              <span>Tax ({invoice.tax}%)</span>
              <span className="font-medium text-foreground print:text-black">{formatCurrency(taxAmount)}</span>
            </div>
          )}
          <div className="border-t border-border pt-2 print:border-gray-200">
            <div className="flex justify-between">
              <span className="text-base font-semibold text-foreground print:text-black">Total</span>
              <span className="text-base font-bold text-primary print:text-indigo-600">
                {formatCurrency(total)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes + Terms */}
      {(invoice.notes || invoice.terms) && (
        <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2">
          {invoice.notes && (
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground print:text-gray-500">
                Notes
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-foreground print:text-black">
                {invoice.notes}
              </p>
            </div>
          )}
          {invoice.terms && (
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground print:text-gray-500">
                Terms & Conditions
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-foreground print:text-black">
                {invoice.terms}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Status Timeline */}
      {statusTimeline && statusTimeline.length > 0 && (
        <div className="border-t border-border p-6 print:hidden">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">
            Status Timeline
          </div>
          <div className="relative ml-3">
            <div className="absolute left-0 top-0 h-full w-px bg-border" />
            {statusTimeline.map((event, i) => (
              <div key={i} className="relative flex items-start gap-4 pb-4 last:pb-0">
                <div
                  className={`relative z-10 flex h-6 w-6 shrink-0 -ml-3 items-center justify-center rounded-full border-2 ${
                    i === statusTimeline.length - 1
                      ? 'border-primary bg-primary/20'
                      : 'border-border bg-card'
                  }`}
                >
                  <div
                    className={`h-2 w-2 rounded-full ${
                      i === statusTimeline.length - 1 ? 'bg-primary' : 'bg-muted-foreground'
                    }`}
                  />
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{event.status}</span>
                    <span className="text-xs text-muted-foreground">{formatDate(event.date)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
