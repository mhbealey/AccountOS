'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  FileText,
  ArrowUpDown,
  Filter,
} from 'lucide-react';
import { differenceInDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { EmptyState } from '@/components/ui/empty-state';
import { InvoiceForm } from '@/components/invoices/InvoiceForm';
import { AgingReport } from '@/components/invoices/AgingReport';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from '@/components/layout/Toast';

interface Invoice {
  id: string;
  number: string;
  clientId: string;
  client: { id: string; name: string };
  amount: number;
  tax: number;
  status: string;
  issuedDate: string;
  dueDate: string;
  paidDate: string | null;
  lineItems: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
}

interface Client {
  id: string;
  name: string;
}

const statusBadgeVariant: Record<string, 'default' | 'info' | 'success' | 'danger' | 'warning'> = {
  Draft: 'default',
  Sent: 'info',
  Viewed: 'info',
  Paid: 'success',
  Overdue: 'danger',
  Void: 'default',
};

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterClient, setFilterClient] = useState('');
  const [sortField, setSortField] = useState<'number' | 'date' | 'amount'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const fetchInvoices = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.set('status', filterStatus);
      const res = await fetch(`/api/invoices?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setInvoices(data);
      }
    } catch {
      toast({ type: 'error', title: 'Failed to load invoices' });
    }
  }, [filterStatus]);

  const fetchClients = useCallback(async () => {
    try {
      const res = await fetch('/api/clients');
      if (res.ok) {
        const data = await res.json();
        setClients(data.map((c: { id: string; name: string }) => ({ id: c.id, name: c.name })));
      }
    } catch {
      // non-critical
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchInvoices(), fetchClients()]).finally(() => setLoading(false));
  }, [fetchInvoices, fetchClients]);

  const filteredInvoices = useMemo(() => {
    let result = [...invoices];

    if (filterClient) {
      result = result.filter((inv) => inv.clientId === filterClient);
    }

    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'number') {
        cmp = a.number.localeCompare(b.number);
      } else if (sortField === 'date') {
        cmp = a.issuedDate.localeCompare(b.issuedDate);
      } else {
        cmp = a.amount - b.amount;
      }
      return sortDir === 'desc' ? -cmp : cmp;
    });

    return result;
  }, [invoices, filterClient, sortField, sortDir]);

  const toggleSort = (field: 'number' | 'date' | 'amount') => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const getAgingIndicator = (inv: Invoice) => {
    if (inv.status === 'Paid' || inv.status === 'Void' || inv.status === 'Draft') return null;
    const now = new Date();
    const due = new Date(inv.dueDate);
    const days = differenceInDays(now, due);
    if (days <= 0) return null;
    if (days <= 30) return <span className="text-xs text-[#eab308]">{days}d overdue</span>;
    if (days <= 60) return <span className="text-xs text-[#f97316]">{days}d overdue</span>;
    return <span className="text-xs text-[#ef4444]">{days}d overdue</span>;
  };

  const handleCreateInvoice = async (data: {
    clientId: string;
    lineItems: Array<{ description: string; quantity: number; unitPrice: number; amount: number }>;
    tax: number;
    issuedDate: string;
    dueDate: string;
    notes: string;
    terms: string;
    timeEntryIds: string[];
  }) => {
    const subtotal = data.lineItems.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = subtotal * (data.tax / 100);

    const res = await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: data.clientId,
        amount: subtotal + taxAmount,
        tax: data.tax,
        issuedDate: data.issuedDate,
        dueDate: data.dueDate,
        notes: data.notes || null,
        terms: data.terms || null,
        lineItems: data.lineItems,
        timeEntryIds: data.timeEntryIds,
      }),
    });

    if (!res.ok) {
      throw new Error('Failed to create invoice');
    }

    toast({ type: 'success', title: 'Invoice created' });
    setShowCreateForm(false);
    await fetchInvoices();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-32 animate-pulse rounded-xl bg-card" />
        <div className="h-64 animate-pulse rounded-xl bg-card" />
      </div>
    );
  }

  if (showCreateForm) {
    return (
      <InvoiceForm
        clients={clients}
        onSave={handleCreateInvoice}
        onCancel={() => setShowCreateForm(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Aging Report */}
      <AgingReport invoices={invoices} />

      {/* Invoice List */}
      <div className="rounded-xl border border-border bg-card">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <h3 className="text-base font-semibold text-foreground">
            Invoices{' '}
            <span className="text-sm font-normal text-muted-foreground">
              ({filteredInvoices.length})
            </span>
          </h3>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="mr-1.5 h-3.5 w-3.5" />
              Filters
            </Button>
            <Button size="sm" onClick={() => setShowCreateForm(true)}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              New Invoice
            </Button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="grid grid-cols-2 gap-3 border-b border-border p-4 sm:grid-cols-4">
            <div className="space-y-1">
              <Label className="text-xs">Status</Label>
              <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="">All statuses</option>
                {['Draft', 'Sent', 'Viewed', 'Paid', 'Overdue', 'Void'].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Client</Label>
              <Select value={filterClient} onChange={(e) => setFilterClient(e.target.value)}>
                <option value="">All clients</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        )}

        {/* Table */}
        {filteredInvoices.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-8 w-8" />}
            title="No invoices"
            description="Create your first invoice to get started."
            actionLabel="New Invoice"
            onAction={() => setShowCreateForm(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
                  <th className="px-4 py-3">
                    <button
                      className="inline-flex items-center gap-1 hover:text-foreground"
                      onClick={() => toggleSort('number')}
                    >
                      Number <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">
                    <button
                      className="inline-flex items-center gap-1 hover:text-foreground"
                      onClick={() => toggleSort('amount')}
                    >
                      Amount <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">
                    <button
                      className="inline-flex items-center gap-1 hover:text-foreground"
                      onClick={() => toggleSort('date')}
                    >
                      Issued <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="px-4 py-3">Due</th>
                  <th className="px-4 py-3">Paid</th>
                  <th className="px-4 py-3">Aging</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="cursor-pointer border-b border-border/50 transition-colors hover:bg-secondary/50"
                    onClick={() => router.push(`/invoices/${inv.id}`)}
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-mono font-medium text-primary">
                      {inv.number}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-foreground">
                      {inv.client.name}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-foreground">
                      {formatCurrency(inv.amount)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <Badge variant={statusBadgeVariant[inv.status] || 'default'}>
                        {inv.status}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {formatDate(inv.issuedDate)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {formatDate(inv.dueDate)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {inv.paidDate ? formatDate(inv.paidDate) : '--'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {getAgingIndicator(inv) || <span className="text-xs text-muted-foreground">--</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
