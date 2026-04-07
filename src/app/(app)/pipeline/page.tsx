'use client';

import { useState, useEffect, useCallback, DragEvent } from 'react';
import { Header } from '@/components/layout/Header';
import {
  Plus,
  LayoutGrid,
  List,
  X,
  DollarSign,
  TrendingUp,
  Target,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn, formatCurrency, formatDate } from '@/lib/utils';

// ─── Types ───
interface Deal {
  id: string;
  title: string;
  clientName: string;
  clientId: string;
  value: number;
  stage: string;
  probability: number;
  closeDate: string | null;
  nextStep: string | null;
  daysInStage: number;
  notes: string | null;
  createdAt: string;
}

interface ClientOption {
  id: string;
  name: string;
}

const STAGES = ['Lead', 'Discovery', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'] as const;

type SortField = 'title' | 'clientName' | 'value' | 'stage' | 'probability' | 'closeDate' | 'daysInStage';

// ─── Helpers ───
function getDaysColor(days: number) {
  if (days < 14) return 'bg-emerald-500/20 text-emerald-400';
  if (days <= 30) return 'bg-yellow-500/20 text-yellow-400';
  return 'bg-red-500/20 text-red-400';
}

export default function PipelinePage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [showModal, setShowModal] = useState(false);
  const [draggedDealId, setDraggedDealId] = useState<string | null>(null);

  // List sort
  const [sortField, setSortField] = useState<SortField>('createdAt' as SortField);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formClientId, setFormClientId] = useState('');
  const [formValue, setFormValue] = useState('');
  const [formStage, setFormStage] = useState('Lead');
  const [formCloseDate, setFormCloseDate] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch
  const fetchDeals = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/deals');
      if (res.ok) setDeals(await res.json());
    } catch (e) {
      console.error('Failed to fetch deals', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchClients = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/clients');
      if (res.ok) setClients(await res.json());
    } catch (e) {
      console.error('Failed to fetch clients', e);
    }
  }, []);

  useEffect(() => {
    fetchDeals();
    fetchClients();
  }, [fetchDeals, fetchClients]);

  // Drag & Drop
  const handleDragStart = (e: DragEvent, dealId: string) => {
    setDraggedDealId(dealId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', dealId);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: DragEvent, newStage: string) => {
    e.preventDefault();
    const dealId = draggedDealId || e.dataTransfer.getData('text/plain');
    if (!dealId) return;

    const deal = deals.find((d) => d.id === dealId);
    if (!deal || deal.stage === newStage) {
      setDraggedDealId(null);
      return;
    }

    // Optimistic update
    setDeals((prev) =>
      prev.map((d) =>
        d.id === dealId ? { ...d, stage: newStage, daysInStage: 0 } : d
      )
    );
    setDraggedDealId(null);

    try {
      await fetch(`/api/v1/deals/${dealId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      });
      fetchDeals();
    } catch {
      fetchDeals(); // revert on error
    }
  };

  // Add Deal
  const handleAddDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formClientId || !formValue) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/v1/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle,
          clientId: formClientId,
          value: Number(formValue),
          stage: formStage,
          closeDate: formCloseDate || null,
          notes: formNotes || null,
        }),
      });
      if (res.ok) {
        const newDeal = await res.json();
        setDeals((prev) => [newDeal, ...prev]);
        setShowModal(false);
        setFormTitle('');
        setFormClientId('');
        setFormValue('');
        setFormStage('Lead');
        setFormCloseDate('');
        setFormNotes('');
      }
    } catch (err) {
      console.error('Failed to add deal', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Sort handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const sortedDeals = [...deals].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    const av = a[sortField];
    const bv = b[sortField];
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    if (typeof av === 'string') return av.localeCompare(bv as string) * dir;
    return ((av as number) - (bv as number)) * dir;
  });

  // Summary
  const totalDeals = deals.length;
  const totalValue = deals.reduce((s, d) => s + d.value, 0);
  const weightedValue = deals.reduce((s, d) => s + d.value * (d.probability / 100), 0);

  // Stage groups
  const stageDeals = (stage: string) => deals.filter((d) => d.stage === stage);
  const stageValue = (stage: string) => stageDeals(stage).reduce((s, d) => s + d.value, 0);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown size={14} className="text-[#829AB1]/50" />;
    return sortDir === 'asc' ? <ChevronUp size={14} className="text-[#00D4AA]" /> : <ChevronDown size={14} className="text-[#00D4AA]" />;
  };

  return (
    <div className="min-h-screen bg-[#050E1A]">
      <Header
        title="Pipeline"
        actions={
          <div className="flex items-center gap-2">
            <div className="flex bg-[#0B1B2E] rounded-lg border border-[#1A3550] p-0.5">
              <button
                onClick={() => setView('kanban')}
                className={cn(
                  'p-1.5 rounded-md transition-colors',
                  view === 'kanban' ? 'bg-[#00D4AA]/10 text-[#00D4AA]' : 'text-[#829AB1] hover:text-[#F0F4F8]'
                )}
                aria-label="Kanban view"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setView('list')}
                className={cn(
                  'p-1.5 rounded-md transition-colors',
                  view === 'list' ? 'bg-[#00D4AA]/10 text-[#00D4AA]' : 'text-[#829AB1] hover:text-[#F0F4F8]'
                )}
                aria-label="List view"
              >
                <List size={16} />
              </button>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00D4AA] text-[#050E1A] text-sm font-medium rounded-lg hover:bg-[#00D4AA]/90 transition-colors"
            >
              <Plus size={16} />
              Add Deal
            </button>
          </div>
        }
      />

      <div className="p-4 md:p-6 space-y-6">
        {/* Pipeline Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total Deals', value: totalDeals.toString(), icon: Target, accent: 'text-[#00D4AA]' },
            { label: 'Total Value', value: formatCurrency(totalValue), icon: DollarSign, accent: 'text-[#00D4AA]' },
            { label: 'Weighted Value', value: formatCurrency(weightedValue), icon: TrendingUp, accent: 'text-[#00D4AA]' },
          ].map((m) => (
            <div key={m.label} className="bg-[#0B1B2E] rounded-xl border border-[#1A3550] p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#00D4AA]/10">
                <m.icon size={20} className={m.accent} />
              </div>
              <div>
                <p className="text-xs text-[#829AB1]">{m.label}</p>
                <p className="text-lg font-semibold text-[#F0F4F8]">{m.value}</p>
              </div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-[#00D4AA] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : view === 'kanban' ? (
          /* ─── Kanban View ─── */
          <div className="flex gap-4 overflow-x-auto pb-4">
            {STAGES.map((stage) => {
              const sd = stageDeals(stage);
              const sv = stageValue(stage);
              return (
                <div
                  key={stage}
                  className="flex-shrink-0 w-72"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, stage)}
                >
                  {/* Column Header */}
                  <div className="bg-[#0B1B2E] rounded-t-xl border border-[#1A3550] p-3">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-medium text-[#F0F4F8]">{stage}</h3>
                      <span className="text-xs bg-[#1A3550] text-[#829AB1] px-2 py-0.5 rounded-full">
                        {sd.length}
                      </span>
                    </div>
                    <p className="text-xs text-[#829AB1]">{formatCurrency(sv)}</p>
                  </div>

                  {/* Cards */}
                  <div className="space-y-2 mt-2 min-h-[200px]">
                    {sd.map((deal) => (
                      <div
                        key={deal.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, deal.id)}
                        className={cn(
                          'bg-[#0B1B2E] rounded-xl border border-[#1A3550] p-4 cursor-grab active:cursor-grabbing transition-all hover:border-[#00D4AA]/30',
                          draggedDealId === deal.id && 'opacity-50'
                        )}
                      >
                        <h4 className="text-sm font-medium text-[#F0F4F8] mb-1 truncate">{deal.title}</h4>
                        <p className="text-xs text-[#829AB1] mb-2">{deal.clientName}</p>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-[#00D4AA]">
                            {formatCurrency(deal.value)}
                          </span>
                          <span className="text-xs text-[#829AB1]">{deal.probability}%</span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {deal.closeDate && (
                            <span className="text-xs text-[#829AB1]">
                              Close: {formatDate(deal.closeDate)}
                            </span>
                          )}
                          <span
                            className={cn(
                              'text-xs px-2 py-0.5 rounded-full',
                              getDaysColor(deal.daysInStage)
                            )}
                          >
                            {deal.daysInStage}d
                          </span>
                        </div>
                        {deal.nextStep && (
                          <p className="text-xs text-[#829AB1] mt-2 italic truncate">
                            Next: {deal.nextStep}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ─── List View ─── */
          <div className="bg-[#0B1B2E] rounded-xl border border-[#1A3550] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1A3550]">
                    {([
                      ['title', 'Title'],
                      ['clientName', 'Client'],
                      ['value', 'Value'],
                      ['stage', 'Stage'],
                      ['probability', 'Prob.'],
                      ['closeDate', 'Close Date'],
                      ['daysInStage', 'Days'],
                    ] as [SortField, string][]).map(([field, label]) => (
                      <th
                        key={field}
                        className="text-left px-4 py-3 text-xs font-medium text-[#829AB1] uppercase tracking-wider cursor-pointer hover:text-[#F0F4F8] select-none"
                        onClick={() => handleSort(field)}
                      >
                        <div className="flex items-center gap-1">
                          {label}
                          <SortIcon field={field} />
                        </div>
                      </th>
                    ))}
                    <th className="text-left px-4 py-3 text-xs font-medium text-[#829AB1] uppercase tracking-wider">
                      Next Step
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedDeals.map((deal) => (
                    <tr key={deal.id} className="border-b border-[#1A3550]/50 hover:bg-[#1A3550]/20">
                      <td className="px-4 py-3 text-[#F0F4F8] font-medium">{deal.title}</td>
                      <td className="px-4 py-3 text-[#829AB1]">{deal.clientName}</td>
                      <td className="px-4 py-3 text-[#00D4AA] font-semibold">{formatCurrency(deal.value)}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-1 rounded-full bg-[#1A3550] text-[#F0F4F8]">
                          {deal.stage}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#829AB1]">{deal.probability}%</td>
                      <td className="px-4 py-3 text-[#829AB1]">
                        {deal.closeDate ? formatDate(deal.closeDate) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('text-xs px-2 py-0.5 rounded-full', getDaysColor(deal.daysInStage))}>
                          {deal.daysInStage}d
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#829AB1] text-xs max-w-[200px] truncate">
                        {deal.nextStep || '—'}
                      </td>
                    </tr>
                  ))}
                  {sortedDeals.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-[#829AB1]">
                        No deals yet. Click &quot;Add Deal&quot; to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ─── Add Deal Modal ─── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0B1B2E] rounded-xl border border-[#1A3550] w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#F0F4F8]">Add Deal</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded hover:bg-[#1A3550] text-[#829AB1]"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddDeal} className="space-y-4">
              <div>
                <label className="block text-xs text-[#829AB1] mb-1">Title *</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                  className="w-full bg-[#050E1A] border border-[#1A3550] rounded-lg px-3 py-2 text-sm text-[#F0F4F8] placeholder-[#829AB1]/50 focus:outline-none focus:border-[#00D4AA]/50"
                  placeholder="Deal title"
                />
              </div>
              <div>
                <label className="block text-xs text-[#829AB1] mb-1">Client *</label>
                <select
                  value={formClientId}
                  onChange={(e) => setFormClientId(e.target.value)}
                  required
                  className="w-full bg-[#050E1A] border border-[#1A3550] rounded-lg px-3 py-2 text-sm text-[#F0F4F8] focus:outline-none focus:border-[#00D4AA]/50"
                >
                  <option value="">Select client</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#829AB1] mb-1">Value ($) *</label>
                  <input
                    type="number"
                    value={formValue}
                    onChange={(e) => setFormValue(e.target.value)}
                    required
                    min={0}
                    className="w-full bg-[#050E1A] border border-[#1A3550] rounded-lg px-3 py-2 text-sm text-[#F0F4F8] placeholder-[#829AB1]/50 focus:outline-none focus:border-[#00D4AA]/50"
                    placeholder="10000"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#829AB1] mb-1">Stage</label>
                  <select
                    value={formStage}
                    onChange={(e) => setFormStage(e.target.value)}
                    className="w-full bg-[#050E1A] border border-[#1A3550] rounded-lg px-3 py-2 text-sm text-[#F0F4F8] focus:outline-none focus:border-[#00D4AA]/50"
                  >
                    {STAGES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-[#829AB1] mb-1">Close Date</label>
                <input
                  type="date"
                  value={formCloseDate}
                  onChange={(e) => setFormCloseDate(e.target.value)}
                  className="w-full bg-[#050E1A] border border-[#1A3550] rounded-lg px-3 py-2 text-sm text-[#F0F4F8] focus:outline-none focus:border-[#00D4AA]/50"
                />
              </div>
              <div>
                <label className="block text-xs text-[#829AB1] mb-1">Notes</label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-[#050E1A] border border-[#1A3550] rounded-lg px-3 py-2 text-sm text-[#F0F4F8] placeholder-[#829AB1]/50 focus:outline-none focus:border-[#00D4AA]/50 resize-none"
                  placeholder="Optional notes..."
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-[#829AB1] hover:text-[#F0F4F8] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#00D4AA] text-[#050E1A] text-sm font-medium rounded-lg hover:bg-[#00D4AA]/90 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Deal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
