'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  FileText,
  Plus,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Calendar,
} from 'lucide-react';
import { cn, formatCurrency, formatDate } from '@/lib/utils';

interface Invoice {
  id: string;
  number: string;
  clientName: string;
  clientId: string;
  amount: number;
  tax: number;
  status: string;
  issuedDate: string;
  dueDate: string;
  paidDate: string | null;
}

type StatusTab = 'All' | 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Void';

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

function daysOverdue(dueDate: string): number {
  const diff = new Date().getTime() - new Date(dueDate).getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

const statusTabs: StatusTab[] = ['All', 'Draft', 'Sent', 'Paid', 'Overdue', 'Void'];

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<StatusTab>('All');

  useEffect(() => {
    fetch('/api/v1/invoices')
      .then((r) => r.json())
      .then((data) => {
        setInvoices(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (activeTab === 'All') return invoices;
    return invoices.filter((inv) => inv.status === activeTab);
  }, [invoices, activeTab]);

  const summary = useMemo(() => {
    const outstanding = invoices
      .filter((i) => i.status === 'Sent' || i.status === 'Overdue')
      .reduce((s, i) => s + i.amount + i.tax, 0);
    const overdue = invoices
      .filter((i) => i.status === 'Overdue')
      .reduce((s, i) => s + i.amount + i.tax, 0);
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const paidThisMonth = invoices
      .filter((i) => i.status === 'Paid' && i.paidDate && new Date(i.paidDate) >= monthStart)
      .reduce((s, i) => s + i.amount + i.tax, 0);
    return { outstanding, overdue, paidThisMonth };
  }, [invoices]);

  const summaryCards = [
    { label: 'Outstanding', value: formatCurrency(summary.outstanding), icon: DollarSign, color: 'text-blue-400' },
    { label: 'Overdue', value: formatCurrency(summary.overdue), icon: AlertCircle, color: 'text-red-400' },
    { label: 'Paid This Month', value: formatCurrency(summary.paidThisMonth), icon: CheckCircle, color: 'text-emerald-400' },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="text-[#00D4AA]" size={24} />
          <h1 className="text-2xl font-semibold text-[#F0F4F8]">Invoices</h1>
        </div>
        <Link
          href="/invoices/new"
          className="flex items-center gap-2 px-4 py-2 bg-[#00D4AA] text-[#050E1A] rounded-lg text-sm font-medium hover:bg-[#00D4AA]/90 transition-colors"
        >
          <Plus size={16} />
          Create Invoice
        </Link>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-[#0B1B2E] rounded-xl border border-[#1A3550] p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon size={16} className={card.color} />
                <span className="text-xs text-[#829AB1]">{card.label}</span>
              </div>
              <p className="text-xl font-semibold text-[#F0F4F8]">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Status Tabs */}
      <div className="flex gap-1 bg-[#0B1B2E] rounded-lg p-1 border border-[#1A3550] w-fit">
        {statusTabs.map((tab) => {
          const count =
            tab === 'All'
              ? invoices.length
              : invoices.filter((i) => i.status === tab).length;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                activeTab === tab
                  ? 'bg-[#00D4AA]/10 text-[#00D4AA]'
                  : 'text-[#829AB1] hover:text-[#F0F4F8]'
              )}
            >
              {tab}
              {count > 0 && (
                <span className="ml-1.5 text-xs opacity-70">({count})</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Invoice List */}
      <div className="bg-[#0B1B2E] rounded-xl border border-[#1A3550] divide-y divide-[#1A3550]">
        {loading ? (
          <div className="p-8 text-center text-[#829AB1]">Loading invoices...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-[#829AB1]">No invoices found.</div>
        ) : (
          filtered.map((inv) => {
            const isVoid = inv.status === 'Void';
            const overdueDays =
              inv.status === 'Overdue' ? daysOverdue(inv.dueDate) : 0;
            return (
              <Link
                key={inv.id}
                href={`/invoices/${inv.id}`}
                className="flex items-center gap-4 px-4 py-4 hover:bg-[#1A3550]/30 transition-colors"
              >
                {/* Invoice Number */}
                <span
                  className={cn(
                    'text-sm font-medium shrink-0 w-24',
                    isVoid ? 'line-through text-slate-500' : 'text-[#F0F4F8]'
                  )}
                >
                  {inv.number}
                </span>

                {/* Client */}
                <span className="flex-1 text-sm text-[#829AB1] truncate">
                  {inv.clientName}
                </span>

                {/* Amount */}
                <span
                  className={cn(
                    'text-sm font-semibold shrink-0',
                    isVoid ? 'line-through text-slate-500' : 'text-[#F0F4F8]'
                  )}
                >
                  {formatCurrency(inv.amount + inv.tax)}
                </span>

                {/* Status Badge */}
                <span
                  className={cn(
                    'text-xs px-2.5 py-1 rounded-full border shrink-0',
                    getInvoiceStatusColor(inv.status),
                    isVoid && 'line-through'
                  )}
                >
                  {inv.status}
                </span>

                {/* Issued Date */}
                <span className="text-xs text-[#829AB1] shrink-0 hidden sm:inline w-24 text-right">
                  {inv.issuedDate ? formatDate(inv.issuedDate) : '-'}
                </span>

                {/* Due Date */}
                <span
                  className={cn(
                    'text-xs shrink-0 hidden md:inline w-24 text-right',
                    inv.status === 'Overdue' ? 'text-red-400' : 'text-[#829AB1]'
                  )}
                >
                  {inv.dueDate ? formatDate(inv.dueDate) : '-'}
                </span>

                {/* Days overdue */}
                {overdueDays > 0 && (
                  <span className="text-xs text-red-400 shrink-0 hidden lg:inline">
                    {overdueDays}d overdue
                  </span>
                )}
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
