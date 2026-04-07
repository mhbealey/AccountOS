'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  FileText,
  Send,
  CheckCircle,
  XCircle,
  Printer,
} from 'lucide-react';
import { cn, formatCurrency, formatDate } from '@/lib/utils';

interface LineItem {
  description: string;
  qty: number;
  unitPrice: number;
  amount: number;
}

interface InvoiceDetail {
  id: string;
  number: string;
  clientName: string;
  clientId: string;
  clientEmail?: string;
  clientAddress?: string;
  amount: number;
  tax: number;
  status: string;
  issuedDate: string;
  dueDate: string;
  paidDate: string | null;
  lineItems: LineItem[];
  notes?: string;
  terms?: string;
}

function getInvoiceStatusColor(status: string): string {
  const map: Record<string, string> = {
    Draft: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    Sent: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Paid: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Overdue: 'bg-red-500/10 text-red-400 border-red-500/20',
    Void: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
  };
  return map[status] ?? 'bg-slate-500/10 text-slate-400 border-slate-500/20';
}

function getNextActions(status: string): { label: string; newStatus: string; icon: React.ElementType; color: string }[] {
  switch (status) {
    case 'Draft':
      return [
        { label: 'Send Invoice', newStatus: 'Sent', icon: Send, color: 'bg-blue-500 hover:bg-blue-600' },
        { label: 'Void', newStatus: 'Void', icon: XCircle, color: 'bg-slate-600 hover:bg-slate-700' },
      ];
    case 'Sent':
      return [
        { label: 'Mark Paid', newStatus: 'Paid', icon: CheckCircle, color: 'bg-emerald-500 hover:bg-emerald-600' },
        { label: 'Void', newStatus: 'Void', icon: XCircle, color: 'bg-slate-600 hover:bg-slate-700' },
      ];
    case 'Overdue':
      return [
        { label: 'Mark Paid', newStatus: 'Paid', icon: CheckCircle, color: 'bg-emerald-500 hover:bg-emerald-600' },
        { label: 'Void', newStatus: 'Void', icon: XCircle, color: 'bg-slate-600 hover:bg-slate-700' },
      ];
    case 'Paid':
      return [
        { label: 'Void', newStatus: 'Void', icon: XCircle, color: 'bg-slate-600 hover:bg-slate-700' },
      ];
    default:
      return [];
  }
}

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/v1/invoices/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setInvoice(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  async function updateStatus(newStatus: string) {
    if (!invoice) return;
    try {
      await fetch(`/api/v1/invoices/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      setInvoice({
        ...invoice,
        status: newStatus,
        paidDate: newStatus === 'Paid' ? new Date().toISOString() : invoice.paidDate,
      });
    } catch {
      // handle error silently
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-[#0B1B2E] rounded-xl border border-[#1A3550] p-8 text-center text-[#829AB1]">
          Loading invoice...
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-[#0B1B2E] rounded-xl border border-[#1A3550] p-8 text-center text-[#829AB1]">
          Invoice not found.
        </div>
      </div>
    );
  }

  const subtotal = invoice.lineItems?.reduce((s, item) => s + item.amount, 0) ?? invoice.amount;
  const total = subtotal + (invoice.tax ?? 0);
  const actions = getNextActions(invoice.status);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/invoices"
          className="flex items-center gap-2 text-sm text-[#829AB1] hover:text-[#F0F4F8] transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Invoices
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3 py-2 text-sm text-[#829AB1] border border-[#1A3550] rounded-lg hover:bg-[#1A3550]/50 transition-colors"
          >
            <Printer size={14} />
            Print
          </button>
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.newStatus}
                onClick={() => updateStatus(action.newStatus)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors',
                  action.color
                )}
              >
                <Icon size={14} />
                {action.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Invoice Document */}
      <div className="bg-[#0B1B2E] rounded-xl border border-[#1A3550] p-8 print:bg-white print:text-black print:border-none">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#00D4AA] print:text-emerald-600">
              AccountOS
            </h1>
            <p className="text-sm text-[#829AB1] mt-1 print:text-gray-500">
              Professional Services
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-3 justify-end mb-2">
              <h2 className="text-xl font-semibold text-[#F0F4F8] print:text-black">
                {invoice.number}
              </h2>
              <span
                className={cn(
                  'text-xs px-2.5 py-1 rounded-full border print:hidden',
                  getInvoiceStatusColor(invoice.status)
                )}
              >
                {invoice.status}
              </span>
            </div>
            {invoice.issuedDate && (
              <p className="text-sm text-[#829AB1] print:text-gray-500">
                Issued: {formatDate(invoice.issuedDate)}
              </p>
            )}
            {invoice.dueDate && (
              <p className="text-sm text-[#829AB1] print:text-gray-500">
                Due: {formatDate(invoice.dueDate)}
              </p>
            )}
            {invoice.paidDate && (
              <p className="text-sm text-emerald-400 print:text-emerald-600">
                Paid: {formatDate(invoice.paidDate)}
              </p>
            )}
          </div>
        </div>

        {/* Client Info */}
        <div className="mb-8 pb-6 border-b border-[#1A3550] print:border-gray-200">
          <p className="text-xs text-[#829AB1] uppercase tracking-wider mb-1 print:text-gray-400">
            Bill To
          </p>
          <p className="text-sm font-medium text-[#F0F4F8] print:text-black">
            {invoice.clientName}
          </p>
          {invoice.clientEmail && (
            <p className="text-sm text-[#829AB1] print:text-gray-500">
              {invoice.clientEmail}
            </p>
          )}
          {invoice.clientAddress && (
            <p className="text-sm text-[#829AB1] print:text-gray-500">
              {invoice.clientAddress}
            </p>
          )}
        </div>

        {/* Line Items Table */}
        <table className="w-full mb-8">
          <thead>
            <tr className="border-b border-[#1A3550] print:border-gray-200">
              <th className="text-left text-xs font-medium text-[#829AB1] uppercase tracking-wider pb-3 print:text-gray-400">
                Description
              </th>
              <th className="text-right text-xs font-medium text-[#829AB1] uppercase tracking-wider pb-3 w-20 print:text-gray-400">
                Qty
              </th>
              <th className="text-right text-xs font-medium text-[#829AB1] uppercase tracking-wider pb-3 w-28 print:text-gray-400">
                Unit Price
              </th>
              <th className="text-right text-xs font-medium text-[#829AB1] uppercase tracking-wider pb-3 w-28 print:text-gray-400">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1A3550]/50 print:divide-gray-100">
            {invoice.lineItems?.map((item, idx) => (
              <tr key={idx}>
                <td className="py-3 text-sm text-[#F0F4F8] print:text-black">
                  {item.description}
                </td>
                <td className="py-3 text-sm text-[#829AB1] text-right print:text-gray-600">
                  {item.qty}
                </td>
                <td className="py-3 text-sm text-[#829AB1] text-right print:text-gray-600">
                  {formatCurrency(item.unitPrice)}
                </td>
                <td className="py-3 text-sm font-medium text-[#F0F4F8] text-right print:text-black">
                  {formatCurrency(item.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#829AB1] print:text-gray-500">Subtotal</span>
              <span className="text-[#F0F4F8] print:text-black">
                {formatCurrency(subtotal)}
              </span>
            </div>
            {invoice.tax > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-[#829AB1] print:text-gray-500">Tax</span>
                <span className="text-[#F0F4F8] print:text-black">
                  {formatCurrency(invoice.tax)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-base font-semibold pt-2 border-t border-[#1A3550] print:border-gray-200">
              <span className="text-[#F0F4F8] print:text-black">Total</span>
              <span className="text-[#00D4AA] print:text-emerald-600">
                {formatCurrency(total)}
              </span>
            </div>
          </div>
        </div>

        {/* Notes & Terms */}
        {(invoice.notes || invoice.terms) && (
          <div className="space-y-4 pt-6 border-t border-[#1A3550] print:border-gray-200">
            {invoice.notes && (
              <div>
                <p className="text-xs font-medium text-[#829AB1] uppercase tracking-wider mb-1 print:text-gray-400">
                  Notes
                </p>
                <p className="text-sm text-[#829AB1] print:text-gray-600">
                  {invoice.notes}
                </p>
              </div>
            )}
            {invoice.terms && (
              <div>
                <p className="text-xs font-medium text-[#829AB1] uppercase tracking-wider mb-1 print:text-gray-400">
                  Terms
                </p>
                <p className="text-sm text-[#829AB1] print:text-gray-600">
                  {invoice.terms}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
