'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Lightbulb,
  Plus,
  X,
  Loader2,
  AlertCircle,
  Calendar,
  DollarSign,
  Search,
  ArrowRight,
} from 'lucide-react';
import { cn, formatCurrency, formatDate } from '@/lib/utils';

interface Proposal {
  id: string;
  title: string;
  clientId: string;
  clientName: string;
  status: string;
  type: string;
  investmentAmount: number;
  validUntil: string;
  sentAt: string | null;
  acceptedAt: string | null;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  Draft: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  Sent: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Accepted: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Declined: 'bg-red-500/10 text-red-400 border-red-500/20',
  Expired: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
};

const emptyForm = {
  title: '',
  clientName: '',
  type: 'Retainer',
  investmentAmount: 0,
  validUntil: '',
};

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  useEffect(() => {
    async function fetchProposals() {
      try {
        setLoading(true);
        const res = await fetch('/api/v1/proposals');
        if (!res.ok) throw new Error(`Failed to load proposals (${res.status})`);
        const json = await res.json();
        setProposals(Array.isArray(json) ? json : json.proposals ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    }
    fetchProposals();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, status: 'Draft' }),
      });
      if (!res.ok) throw new Error('Failed to create proposal');
      const created = await res.json();
      setProposals((prev) => [created, ...prev]);
      setShowModal(false);
      setForm(emptyForm);
    } catch {
      // silently handle
    }
  };

  const statuses = ['All', 'Draft', 'Sent', 'Accepted', 'Declined', 'Expired'];

  const filtered = proposals.filter((p) => {
    const matchesSearch =
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.clientName?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#00D4AA]" />
          <p className="text-[#829AB1] text-sm">Loading proposals...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-center px-4">
          <AlertCircle className="h-8 w-8 text-red-400" />
          <p className="text-red-400 font-medium">Failed to load proposals</p>
          <p className="text-[#829AB1] text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F0F4F8]">Proposals</h1>
          <p className="text-[#829AB1] text-sm mt-1">Create and manage client proposals</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#00D4AA] text-[#050E1A] rounded-lg font-medium text-sm hover:bg-[#00D4AA]/90 transition-colors"
        >
          <Plus size={16} />
          New Proposal
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#829AB1]" />
          <input
            type="text"
            placeholder="Search proposals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#0B1B2E] border border-[#1A3550] rounded-lg text-[#F0F4F8] text-sm placeholder:text-[#829AB1]/50 focus:outline-none focus:border-[#00D4AA]/50"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                statusFilter === s
                  ? 'bg-[#00D4AA]/10 text-[#00D4AA] border border-[#00D4AA]/30'
                  : 'bg-[#0B1B2E] text-[#829AB1] border border-[#1A3550] hover:border-[#829AB1]/30'
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((proposal) => (
          <Link
            key={proposal.id}
            href={`/proposals/${proposal.id}`}
            className="bg-[#0B1B2E] rounded-xl border border-[#1A3550] p-5 space-y-4 hover:border-[#00D4AA]/30 transition-colors group"
          >
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <h3 className="text-[#F0F4F8] font-semibold truncate group-hover:text-[#00D4AA] transition-colors">
                  {proposal.title}
                </h3>
                <p className="text-[#829AB1] text-sm mt-0.5">{proposal.clientName}</p>
              </div>
              <ArrowRight size={16} className="text-[#829AB1] shrink-0 mt-1 group-hover:text-[#00D4AA] transition-colors" />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={cn(
                  'px-2 py-0.5 rounded-full text-xs font-medium border',
                  statusColors[proposal.status] ?? 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                )}
              >
                {proposal.status}
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium border bg-[#1A3550]/50 text-[#829AB1] border-[#1A3550]">
                {proposal.type}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[#829AB1]">
                  <DollarSign size={14} />
                  Investment
                </span>
                <span className="text-[#F0F4F8] font-medium">{formatCurrency(proposal.investmentAmount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[#829AB1]">
                  <Calendar size={14} />
                  Valid Until
                </span>
                <span className="text-[#F0F4F8]">{formatDate(proposal.validUntil)}</span>
              </div>
              {proposal.sentAt && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[#829AB1]">
                    <Calendar size={14} />
                    Sent
                  </span>
                  <span className="text-[#F0F4F8]">{formatDate(proposal.sentAt)}</span>
                </div>
              )}
              {proposal.acceptedAt && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[#829AB1]">
                    <Calendar size={14} />
                    Accepted
                  </span>
                  <span className="text-emerald-400">{formatDate(proposal.acceptedAt)}</span>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <Lightbulb className="h-12 w-12 text-[#829AB1]/30 mx-auto mb-3" />
          <p className="text-[#829AB1]">No proposals found</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[#0B1B2E] border border-[#1A3550] rounded-xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#F0F4F8]">New Proposal</h2>
              <button onClick={() => setShowModal(false)} className="text-[#829AB1] hover:text-[#F0F4F8]">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-sm text-[#829AB1] block mb-1">Title</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 bg-[#050E1A] border border-[#1A3550] rounded-lg text-[#F0F4F8] text-sm focus:outline-none focus:border-[#00D4AA]/50"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-[#829AB1] block mb-1">Client Name</label>
                <input
                  value={form.clientName}
                  onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                  className="w-full px-3 py-2 bg-[#050E1A] border border-[#1A3550] rounded-lg text-[#F0F4F8] text-sm focus:outline-none focus:border-[#00D4AA]/50"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-[#829AB1] block mb-1">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-3 py-2 bg-[#050E1A] border border-[#1A3550] rounded-lg text-[#F0F4F8] text-sm focus:outline-none focus:border-[#00D4AA]/50"
                  >
                    {['Retainer', 'Project', 'Consulting', 'Advisory'].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-[#829AB1] block mb-1">Investment ($)</label>
                  <input
                    type="number"
                    value={form.investmentAmount}
                    onChange={(e) => setForm({ ...form, investmentAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#050E1A] border border-[#1A3550] rounded-lg text-[#F0F4F8] text-sm focus:outline-none focus:border-[#00D4AA]/50"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-[#829AB1] block mb-1">Valid Until</label>
                <input
                  type="date"
                  value={form.validUntil}
                  onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
                  className="w-full px-3 py-2 bg-[#050E1A] border border-[#1A3550] rounded-lg text-[#F0F4F8] text-sm focus:outline-none focus:border-[#00D4AA]/50"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-[#829AB1] hover:text-[#F0F4F8] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00D4AA] text-[#050E1A] rounded-lg font-medium text-sm hover:bg-[#00D4AA]/90 transition-colors"
                >
                  Create Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
