'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Search, Plus, X, ChevronRight } from 'lucide-react';
import { cn, formatCurrency, getScoreColor } from '@/lib/utils';

type Client = {
  id: string;
  name: string;
  industry: string;
  status: string;
  tier: string;
  mrr: number;
  contactName: string;
  contactEmail: string;
  currentScore: number;
};

type StatusFilter = 'All' | 'Active' | 'Onboarding' | 'Churned';

const STATUS_FILTERS: StatusFilter[] = ['All', 'Active', 'Onboarding', 'Churned'];

const statusDotColor: Record<string, string> = {
  active: 'bg-[#00D4AA]',
  onboarding: 'bg-amber-400',
  churned: 'bg-red-500',
};

function AddClientModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-xl border border-[#1A3550] bg-[#0B1B2E] p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#F0F4F8]">Add Client</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-[#829AB1] hover:bg-[#0D2137] hover:text-[#F0F4F8] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="text-sm text-[#829AB1]">Client creation form coming soon.</p>
      </div>
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 16;
  const filled = (score / 100) * circumference;

  return (
    <div className="relative flex h-11 w-11 items-center justify-center">
      <svg className="h-11 w-11 -rotate-90" viewBox="0 0 40 40">
        <circle
          cx="20"
          cy="20"
          r="16"
          fill="none"
          stroke="#1A3550"
          strokeWidth="3"
        />
        <circle
          cx="20"
          cy="20"
          r="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeDasharray={`${filled} ${circumference - filled}`}
          strokeLinecap="round"
          className={getScoreColor(score)}
        />
      </svg>
      <span className={cn('absolute text-xs font-semibold', getScoreColor(score))}>
        {score}
      </span>
    </div>
  );
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetch('/api/clients')
      .then((res) => res.json())
      .then((data) => setClients(data.clients ?? []))
      .catch(() => setClients([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = clients;
    if (statusFilter !== 'All') {
      result = result.filter(
        (c) => c.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.industry.toLowerCase().includes(q) ||
          c.contactName.toLowerCase().includes(q)
      );
    }
    return result;
  }, [clients, statusFilter, search]);

  return (
    <div className="min-h-full bg-[#050E1A] px-4 py-6 md:px-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#F0F4F8]">Clients</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="hidden md:flex items-center gap-2 rounded-lg bg-[#00D4AA] px-4 py-2 text-sm font-medium text-[#050E1A] hover:bg-[#00D4AA]/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Client
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#829AB1]" />
        <input
          type="text"
          placeholder="Search clients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-[#1A3550] bg-[#0B1B2E] py-2.5 pl-10 pr-4 text-sm text-[#F0F4F8] placeholder-[#829AB1] outline-none focus:border-[#00D4AA]/50 transition-colors"
        />
      </div>

      {/* Filter pills */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={cn(
              'whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
              statusFilter === s
                ? 'bg-[#00D4AA]/15 text-[#00D4AA] border border-[#00D4AA]/30'
                : 'bg-[#0B1B2E] text-[#829AB1] border border-[#1A3550] hover:text-[#F0F4F8]'
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Client list / grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#1A3550] border-t-[#00D4AA]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#829AB1]">
          <p className="text-sm">No clients found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((client) => (
            <Link
              key={client.id}
              href={`/clients/${client.id}`}
              className="group flex items-center gap-4 rounded-xl border border-[#1A3550] bg-[#0B1B2E] p-4 hover:bg-[#0D2137] transition-colors cursor-pointer"
            >
              {/* Score */}
              <ScoreBadge score={client.currentScore} />

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-semibold text-[#F0F4F8]">
                    {client.name}
                  </span>
                  <span className="shrink-0 rounded-full bg-[#1A3550] px-2 py-0.5 text-[10px] font-medium text-[#829AB1]">
                    {client.industry}
                  </span>
                </div>

                <div className="mt-1 flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        'inline-block h-1.5 w-1.5 rounded-full',
                        statusDotColor[client.status.toLowerCase()] ?? 'bg-[#829AB1]'
                      )}
                    />
                    <span className="text-[#829AB1] capitalize">{client.status}</span>
                  </span>
                  <span className="text-[#829AB1]">
                    {formatCurrency(client.mrr)}/mo
                  </span>
                </div>

                <p className="mt-1 truncate text-xs text-[#829AB1]/70">
                  {client.contactName}
                </p>
              </div>

              {/* Arrow */}
              <ChevronRight className="h-4 w-4 shrink-0 text-[#1A3550] group-hover:text-[#829AB1] transition-colors" />
            </Link>
          ))}
        </div>
      )}

      {/* Mobile FAB */}
      <button
        onClick={() => setModalOpen(true)}
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#00D4AA] text-[#050E1A] shadow-lg shadow-[#00D4AA]/20 md:hidden hover:bg-[#00D4AA]/90 transition-colors"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Modal */}
      {modalOpen && <AddClientModal onClose={() => setModalOpen(false)} />}
    </div>
  );
}
