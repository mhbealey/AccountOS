'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Fuse from 'fuse.js';
import {
  Search,
  Plus,
  ArrowUpDown,
  Users,
  Phone,
} from 'lucide-react';
import {
  cn,
  formatCurrency,
  formatRelativeTime,
  getHealthColor,
  getStatusColor,
} from '@/lib/utils';

interface Client {
  id: string;
  name: string;
  status: string;
  industry: string;
  tier: string;
  mrr: number;
  healthScore: number;
  lastContactAt: string;
  contactCount: number;
  primaryContactName: string;
}

const STATUS_FILTERS = ['All', 'Active', 'Onboarding', 'At-Risk', 'Paused', 'Churned'] as const;
const SORT_OPTIONS = [
  { label: 'Health Score', key: 'healthScore' },
  { label: 'MRR', key: 'mrr' },
  { label: 'Last Contact', key: 'lastContactAt' },
  { label: 'Name', key: 'name' },
] as const;

type SortKey = (typeof SORT_OPTIONS)[number]['key'];

function HealthRing({ score, size = 48 }: { score: number; size?: number }) {
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const strokeColor =
    score <= 30 ? '#ef4444' : score <= 60 ? '#eab308' : score <= 80 ? '#10b981' : '#3b82f6';

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1A3550"
          strokeWidth={3}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={3}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span
        className={cn('absolute inset-0 flex items-center justify-center text-xs font-semibold', getHealthColor(score))}
      >
        {score}
      </span>
    </div>
  );
}

function TierBadge({ tier }: { tier: string }) {
  const colors: Record<string, string> = {
    Enterprise: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    Growth: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Starter: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    Strategic: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };
  return (
    <span className={cn('text-[10px] px-2 py-0.5 rounded-full border font-medium', colors[tier] ?? colors.Starter)}>
      {tier}
    </span>
  );
}

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sortKey, setSortKey] = useState<SortKey>('healthScore');
  const [sortOpen, setSortOpen] = useState(false);

  useEffect(() => {
    fetch('/api/v1/clients')
      .then((r) => r.json())
      .then((data) => {
        setClients(Array.isArray(data) ? data : data.clients ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const fuse = useMemo(
    () => new Fuse(clients, { keys: ['name', 'industry'], threshold: 0.4 }),
    [clients],
  );

  const filtered = useMemo(() => {
    let result = search ? fuse.search(search).map((r) => r.item) : [...clients];

    if (statusFilter !== 'All') {
      result = result.filter((c) => c.status === statusFilter);
    }

    result.sort((a, b) => {
      switch (sortKey) {
        case 'healthScore':
          return b.healthScore - a.healthScore;
        case 'mrr':
          return b.mrr - a.mrr;
        case 'lastContactAt':
          return new Date(b.lastContactAt).getTime() - new Date(a.lastContactAt).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return result;
  }, [clients, search, statusFilter, sortKey, fuse]);

  return (
    <div className="min-h-screen bg-[#050E1A]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#050E1A]/95 backdrop-blur border-b border-[#1A3550]">
        <div className="px-4 md:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-[#F0F4F8]">Clients</h1>
              <p className="text-sm text-[#829AB1]">
                {filtered.length} client{filtered.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={() => router.push('/clients/new')}
              className="hidden md:flex items-center gap-2 bg-[#00D4AA] text-[#050E1A] px-4 py-2 rounded-lg font-medium text-sm hover:bg-[#00D4AA]/90 transition-colors"
            >
              <Plus size={16} />
              Add Client
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#829AB1]" />
            <input
              type="text"
              placeholder="Search clients by name or industry..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0B1B2E] border border-[#1A3550] rounded-lg pl-10 pr-4 py-2.5 text-sm text-[#F0F4F8] placeholder-[#829AB1]/60 focus:outline-none focus:border-[#00D4AA]/50 transition-colors"
            />
          </div>

          {/* Filters row */}
          <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1">
            <div className="flex items-center gap-1.5 shrink-0">
              {STATUS_FILTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border',
                    statusFilter === s
                      ? 'bg-[#00D4AA]/10 text-[#00D4AA] border-[#00D4AA]/30'
                      : 'bg-[#0B1B2E] text-[#829AB1] border-[#1A3550] hover:border-[#829AB1]/40',
                  )}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="relative shrink-0">
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#829AB1] bg-[#0B1B2E] border border-[#1A3550] hover:border-[#829AB1]/40 transition-colors"
              >
                <ArrowUpDown size={12} />
                {SORT_OPTIONS.find((o) => o.key === sortKey)?.label}
              </button>
              {sortOpen && (
                <div className="absolute right-0 top-full mt-1 bg-[#0B1B2E] border border-[#1A3550] rounded-lg shadow-xl z-20 py-1 min-w-[140px]">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => {
                        setSortKey(opt.key);
                        setSortOpen(false);
                      }}
                      className={cn(
                        'block w-full text-left px-3 py-1.5 text-xs transition-colors',
                        sortKey === opt.key ? 'text-[#00D4AA]' : 'text-[#829AB1] hover:text-[#F0F4F8] hover:bg-[#0D2137]',
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="px-4 md:px-8 py-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-[#0B1B2E] rounded-xl border border-[#1A3550] p-5 h-48 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#829AB1]">
            <Users size={48} className="mb-4 opacity-40" />
            <p className="text-lg font-medium mb-1">No clients found</p>
            <p className="text-sm opacity-60">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((client) => (
              <button
                key={client.id}
                onClick={() => router.push(`/clients/${client.id}`)}
                className="bg-[#0B1B2E] rounded-xl border border-[#1A3550] p-5 text-left hover:bg-[#0D2137] hover:border-[#1A3550]/80 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[#F0F4F8] font-semibold truncate group-hover:text-[#00D4AA] transition-colors">
                      {client.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1A3550]/60 text-[#829AB1] font-medium">
                        {client.industry}
                      </span>
                      <TierBadge tier={client.tier} />
                    </div>
                  </div>
                  <HealthRing score={client.healthScore} />
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className={cn('text-[10px] px-2 py-0.5 rounded-full border font-medium', getStatusColor(client.status))}>
                    {client.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-[#829AB1]">
                  <div className="flex items-center justify-between">
                    <span>MRR</span>
                    <span className="text-[#F0F4F8] font-medium">{formatCurrency(client.mrr)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Phone size={10} />
                      Primary
                    </span>
                    <span className="text-[#F0F4F8] truncate ml-2">{client.primaryContactName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Last contact</span>
                    <span>{formatRelativeTime(client.lastContactAt)}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Mobile FAB */}
      <button
        onClick={() => router.push('/clients/new')}
        className="md:hidden fixed bottom-20 right-4 w-14 h-14 bg-[#00D4AA] text-[#050E1A] rounded-full shadow-lg flex items-center justify-center z-20 hover:bg-[#00D4AA]/90 transition-colors"
        aria-label="Add Client"
      >
        <Plus size={24} />
      </button>
    </div>
  );
}
