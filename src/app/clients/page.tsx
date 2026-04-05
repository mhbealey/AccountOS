'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { ClientForm } from '@/components/clients/ClientForm';
import { formatCurrency, formatRelativeTime, formatDate } from '@/lib/utils';
import type { Client, ClientStatusLiteral } from '@/types';
import {
  Search,
  Plus,
  Users,
  ArrowUpDown,
  Trash2,
} from 'lucide-react';

const STATUS_OPTIONS: ClientStatusLiteral[] = [
  'Prospect',
  'Onboarding',
  'Active',
  'At-Risk',
  'Paused',
  'Churned',
];

const INDUSTRY_OPTIONS = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Manufacturing',
  'Retail',
  'Consulting',
  'Media',
  'Real Estate',
  'Other',
];

const SOURCE_OPTIONS = [
  'Referral',
  'Website',
  'LinkedIn',
  'Conference',
  'Cold Outreach',
  'Inbound',
  'Partner',
  'Other',
];

const HEALTH_RANGES = [
  { label: 'Critical (0-30)', min: 0, max: 30 },
  { label: 'At Risk (31-60)', min: 31, max: 60 },
  { label: 'Healthy (61-80)', min: 61, max: 80 },
  { label: 'Thriving (81-100)', min: 81, max: 100 },
];

type SortField = 'name' | 'healthScore' | 'mrr' | 'lastContactAt';
type SortDir = 'asc' | 'desc';

function getStatusBadgeVariant(status: string): 'default' | 'success' | 'warning' | 'danger' | 'info' {
  switch (status) {
    case 'Active': return 'success';
    case 'Onboarding': return 'info';
    case 'At-Risk': return 'warning';
    case 'Churned': return 'danger';
    case 'Paused': return 'warning';
    case 'Prospect': return 'default';
    default: return 'default';
  }
}

function getHealthDotColor(score: number) {
  if (score <= 30) return 'bg-red-400';
  if (score <= 60) return 'bg-yellow-400';
  if (score <= 80) return 'bg-emerald-400';
  return 'bg-blue-400';
}

function isOverdue(dateStr: Date | string | null): boolean {
  if (!dateStr) return false;
  const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  const now = new Date();
  const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
  return diff > 14;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [healthFilter, setHealthFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const [formOpen, setFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/clients');
      if (res.ok) {
        const data = await res.json();
        setClients(data);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const filtered = useMemo(() => {
    let list = [...clients];

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q));
    }

    if (statusFilter) {
      list = list.filter((c) => c.status === statusFilter);
    }

    if (industryFilter) {
      list = list.filter((c) => c.industry === industryFilter);
    }

    if (sourceFilter) {
      list = list.filter((c) => c.source === sourceFilter);
    }

    if (healthFilter) {
      const range = HEALTH_RANGES[parseInt(healthFilter)];
      if (range) {
        list = list.filter((c) => c.healthScore >= range.min && c.healthScore <= range.max);
      }
    }

    list.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'name':
          cmp = a.name.localeCompare(b.name);
          break;
        case 'healthScore':
          cmp = a.healthScore - b.healthScore;
          break;
        case 'mrr':
          cmp = a.mrr - b.mrr;
          break;
        case 'lastContactAt': {
          const aDate = a.lastContactAt ? new Date(a.lastContactAt).getTime() : 0;
          const bDate = b.lastContactAt ? new Date(b.lastContactAt).getTime() : 0;
          cmp = aDate - bDate;
          break;
        }
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return list;
  }, [clients, debouncedSearch, statusFilter, industryFilter, sourceFilter, healthFilter, sortField, sortDir]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const handleCreateClient = async (data: Partial<Client>) => {
    const res = await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create client');
    await fetchClients();
  };

  const handleUpdateClient = async (data: Partial<Client>) => {
    if (!editingClient) return;
    const res = await fetch(`/api/clients/${editingClient.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update client');
    await fetchClients();
  };

  const handleDeleteClient = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await fetch(`/api/clients/${deleteTarget.id}`, { method: 'DELETE' });
      setDeleteTarget(null);
      await fetchClients();
    } finally {
      setDeleteLoading(false);
    }
  };

  const primaryContact = (client: Client) => {
    if (!client.contacts || client.contacts.length === 0) return null;
    return client.contacts.find((c) => c.isPrimary) ?? client.contacts[0];
  };

  const SortHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <th
      className="pb-3 pr-4 cursor-pointer select-none hover:text-foreground transition-colors"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown className={`h-3 w-3 ${sortField === field ? 'text-primary' : ''}`} />
      </div>
    </th>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Clients</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {clients.length} client{clients.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <Button onClick={() => { setEditingClient(null); setFormOpen(true); }}>
          <Plus className="h-4 w-4" />
          New Client
        </Button>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-10"
          placeholder="Search clients by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-40"
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>

        <Select
          value={industryFilter}
          onChange={(e) => setIndustryFilter(e.target.value)}
          className="w-40"
        >
          <option value="">All Industries</option>
          {INDUSTRY_OPTIONS.map((i) => (
            <option key={i} value={i}>{i}</option>
          ))}
        </Select>

        <Select
          value={healthFilter}
          onChange={(e) => setHealthFilter(e.target.value)}
          className="w-48"
        >
          <option value="">All Health</option>
          {HEALTH_RANGES.map((r, idx) => (
            <option key={idx} value={idx}>{r.label}</option>
          ))}
        </Select>

        <Select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="w-40"
        >
          <option value="">All Sources</option>
          {SOURCE_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Users className="h-7 w-7" />}
          title={debouncedSearch || statusFilter || industryFilter || healthFilter || sourceFilter
            ? 'No clients match your filters'
            : 'No clients yet'}
          description={
            debouncedSearch || statusFilter || industryFilter || healthFilter || sourceFilter
              ? 'Try adjusting your search or filters.'
              : 'Add your first client to get started.'
          }
          actionLabel={!debouncedSearch && !statusFilter ? 'New Client' : undefined}
          onAction={!debouncedSearch && !statusFilter ? () => { setEditingClient(null); setFormOpen(true); } : undefined}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-[#12122a]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <SortHeader field="name">Name</SortHeader>
                <th className="pb-3 pr-4">Primary Contact</th>
                <th className="pb-3 pr-4">Status</th>
                <SortHeader field="healthScore">Health</SortHeader>
                <SortHeader field="mrr">MRR</SortHeader>
                <SortHeader field="lastContactAt">Last Contact</SortHeader>
                <th className="pb-3 pr-4">Next QBR</th>
                <th className="pb-3 w-20"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((client) => {
                const primary = primaryContact(client);
                const contactOverdue = isOverdue(client.lastContactAt);
                return (
                  <tr
                    key={client.id}
                    className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                  >
                    <td className="py-3 pr-4">
                      <Link
                        href={`/clients/${client.id}`}
                        className="font-medium text-foreground hover:text-primary transition-colors"
                      >
                        {client.name}
                      </Link>
                      {client.industry && (
                        <p className="text-xs text-muted-foreground">{client.industry}</p>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {primary ? (
                        <div>
                          <span className="text-foreground">{primary.name}</span>
                          {primary.title && (
                            <p className="text-xs text-muted-foreground">{primary.title}</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs">-</span>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant={getStatusBadgeVariant(client.status)}>
                        {client.status}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className={`h-2.5 w-2.5 rounded-full ${getHealthDotColor(client.healthScore)}`} />
                        <span className="text-foreground">{client.healthScore}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-foreground">
                      {formatCurrency(client.mrr)}
                    </td>
                    <td className={`py-3 pr-4 ${contactOverdue ? 'text-red-400' : 'text-muted-foreground'}`}>
                      {client.lastContactAt
                        ? formatRelativeTime(client.lastContactAt)
                        : '-'}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {client.nextQbrDate
                        ? formatDate(client.nextQbrDate)
                        : '-'}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-400 hover:text-red-300"
                          onClick={() => setDeleteTarget(client)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      <ClientForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingClient(null);
        }}
        client={editingClient}
        onSubmit={editingClient ? handleUpdateClient : handleCreateClient}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Client</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.name}</strong>?
              This will permanently remove the client and all associated data including
              contacts, deals, activities, invoices, time entries, contracts, and proposals.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteClient}
              disabled={deleteLoading}
            >
              {deleteLoading ? 'Deleting...' : 'Delete Client'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
