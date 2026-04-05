'use client';

import React, { useState, useMemo } from 'react';
import {
  Pencil,
  Trash2,
  ArrowUpDown,
  Filter,
  DollarSign,
  FileText,
  Check,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { EmptyState } from '@/components/ui/empty-state';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from '@/components/layout/Toast';

export interface TimeEntry {
  id: string;
  clientId: string | null;
  client: { id: string; name: string } | null;
  description: string;
  hours: number;
  rate: number;
  date: string;
  category: string | null;
  billable: boolean;
  invoiceId: string | null;
  invoice: { id: string; number: string } | null;
}

interface TimeEntryListProps {
  entries: TimeEntry[];
  clients: { id: string; name: string }[];
  onEdit: (entry: TimeEntry) => void;
  onDelete: (id: string) => Promise<void>;
}

const CATEGORIES = ['Strategy', 'Delivery', 'Admin', 'Meeting', 'QBR'];

const categoryColors: Record<string, string> = {
  Strategy: 'bg-[rgba(59,130,246,0.15)] text-[#3b82f6]',
  Delivery: 'bg-[rgba(34,197,94,0.15)] text-[#22c55e]',
  Admin: 'bg-[rgba(148,163,184,0.15)] text-[#94a3b8]',
  Meeting: 'bg-[rgba(234,179,8,0.15)] text-[#eab308]',
  QBR: 'bg-[rgba(168,85,247,0.15)] text-[#a855f7]',
};

export function TimeEntryList({ entries, clients, onEdit, onDelete }: TimeEntryListProps) {
  const [filterClient, setFilterClient] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterBillable, setFilterBillable] = useState('');
  const [filterUninvoiced, setFilterUninvoiced] = useState(false);
  const [sortField, setSortField] = useState<'date' | 'hours' | 'amount'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = [...entries];

    if (filterClient) {
      result = result.filter((e) => e.clientId === filterClient);
    }
    if (filterDateFrom) {
      result = result.filter((e) => e.date >= filterDateFrom);
    }
    if (filterDateTo) {
      result = result.filter((e) => e.date <= filterDateTo);
    }
    if (filterCategory) {
      result = result.filter((e) => e.category === filterCategory);
    }
    if (filterBillable === 'true') {
      result = result.filter((e) => e.billable);
    } else if (filterBillable === 'false') {
      result = result.filter((e) => !e.billable);
    }
    if (filterUninvoiced) {
      result = result.filter((e) => !e.invoiceId);
    }

    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'date') {
        cmp = a.date.localeCompare(b.date);
      } else if (sortField === 'hours') {
        cmp = a.hours - b.hours;
      } else {
        cmp = a.hours * a.rate - b.hours * b.rate;
      }
      return sortDir === 'desc' ? -cmp : cmp;
    });

    return result;
  }, [entries, filterClient, filterDateFrom, filterDateTo, filterCategory, filterBillable, filterUninvoiced, sortField, sortDir]);

  const toggleSort = (field: 'date' | 'hours' | 'amount') => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDelete(id);
      toast({ type: 'success', title: 'Time entry deleted' });
    } catch {
      toast({ type: 'error', title: 'Failed to delete entry' });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card">
      {/* Header and filters */}
      <div className="flex items-center justify-between border-b border-border p-4">
        <h3 className="text-base font-semibold text-foreground">
          Time Entries{' '}
          <span className="text-sm font-normal text-muted-foreground">({filtered.length})</span>
        </h3>
        <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="mr-1.5 h-3.5 w-3.5" />
          Filters
        </Button>
      </div>

      {showFilters && (
        <div className="grid grid-cols-2 gap-3 border-b border-border p-4 sm:grid-cols-3 lg:grid-cols-6">
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
          <div className="space-y-1">
            <Label className="text-xs">From</Label>
            <Input type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">To</Label>
            <Input type="date" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Category</Label>
            <Select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              <option value="">All</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Billable</Label>
            <Select value={filterBillable} onChange={(e) => setFilterBillable(e.target.value)}>
              <option value="">All</option>
              <option value="true">Billable</option>
              <option value="false">Non-billable</option>
            </Select>
          </div>
          <div className="flex items-end">
            <Button
              variant={filterUninvoiced ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterUninvoiced(!filterUninvoiced)}
              className="w-full"
            >
              Uninvoiced
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState title="No time entries" description="Start the timer or add a manual entry." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
                <th className="px-4 py-3">
                  <button className="inline-flex items-center gap-1 hover:text-foreground" onClick={() => toggleSort('date')}>
                    Date <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">
                  <button className="inline-flex items-center gap-1 hover:text-foreground" onClick={() => toggleSort('hours')}>
                    Hours <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-4 py-3">Rate</th>
                <th className="px-4 py-3">
                  <button className="inline-flex items-center gap-1 hover:text-foreground" onClick={() => toggleSort('amount')}>
                    Amount <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-center">Billable</th>
                <th className="px-4 py-3 text-center">Invoiced</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry) => (
                <tr
                  key={entry.id}
                  className="border-b border-border/50 transition-colors hover:bg-secondary/50"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {formatDate(entry.date)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-foreground">
                    {entry.client?.name || <span className="text-muted-foreground">--</span>}
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-foreground">
                    {entry.description}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-foreground">
                    {entry.hours.toFixed(2)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {formatCurrency(entry.rate)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-foreground">
                    {formatCurrency(entry.hours * entry.rate)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {entry.category ? (
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                          categoryColors[entry.category] || 'bg-secondary text-muted-foreground'
                        }`}
                      >
                        {entry.category}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">--</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {entry.billable ? (
                      <DollarSign className="mx-auto h-4 w-4 text-[#22c55e]" />
                    ) : (
                      <X className="mx-auto h-4 w-4 text-muted-foreground" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {entry.invoiceId ? (
                      <Badge variant="info" className="text-[10px]">
                        <FileText className="mr-1 h-3 w-3" />
                        {entry.invoice?.number || 'Yes'}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">--</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                        onClick={() => onEdit(entry)}
                        aria-label="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleDelete(entry.id)}
                        disabled={deletingId === entry.id}
                        aria-label="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
