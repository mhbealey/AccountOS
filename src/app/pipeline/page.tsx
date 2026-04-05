'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { KanbanBoard } from '@/components/pipeline/KanbanBoard';
import { PipelineListView } from '@/components/pipeline/PipelineListView';
import { DealForm, type DealFormData } from '@/components/pipeline/DealForm';
import { toast } from '@/components/layout/Toast';
import {
  LayoutGrid,
  List,
  Plus,
  DollarSign,
  TrendingUp,
  Target,
} from 'lucide-react';
import { formatCurrency, cn, getStageProbability } from '@/lib/utils';
import type { Deal, Client, DealStageLiteral } from '@/types';

type ViewMode = 'kanban' | 'list';

export default function PipelinePage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [clients, setClients] = useState<Pick<Client, 'id' | 'name'>[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchDeals = useCallback(async () => {
    try {
      const res = await fetch('/api/deals');
      if (!res.ok) throw new Error('Failed to fetch deals');
      const data = await res.json();
      setDeals(data);
    } catch {
      toast({ type: 'error', title: 'Failed to load deals' });
    }
  }, []);

  const fetchClients = useCallback(async () => {
    try {
      const res = await fetch('/api/clients');
      if (!res.ok) throw new Error('Failed to fetch clients');
      const data = await res.json();
      setClients(data.map((c: Client) => ({ id: c.id, name: c.name })));
    } catch {
      // Clients fetch may fail if no clients module yet
      setClients([]);
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchDeals(), fetchClients()]).finally(() =>
      setLoading(false)
    );
  }, [fetchDeals, fetchClients]);

  const handleStageDrop = useCallback(
    async (
      dealId: string,
      newStage: DealStageLiteral,
      extra?: { lostReason?: string; winFactors?: string }
    ) => {
      // Optimistic update
      setDeals((prev) =>
        prev.map((d) =>
          d.id === dealId
            ? {
                ...d,
                stage: newStage,
                probability: getStageProbability(newStage),
              }
            : d
        )
      );

      try {
        const body: Record<string, unknown> = {
          stage: newStage,
          probability: getStageProbability(newStage),
        };
        if (extra?.lostReason) body.lostReason = extra.lostReason;
        if (extra?.winFactors) body.winFactors = extra.winFactors;

        const res = await fetch(`/api/deals/${dealId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (!res.ok) throw new Error('Failed to update deal stage');

        const updated = await res.json();
        setDeals((prev) =>
          prev.map((d) => (d.id === updated.id ? updated : d))
        );

        toast({
          type: 'success',
          title: `Moved to ${newStage === 'ClosedWon' ? 'Closed Won' : newStage === 'ClosedLost' ? 'Closed Lost' : newStage}`,
        });
      } catch {
        // Revert
        await fetchDeals();
        toast({ type: 'error', title: 'Failed to move deal' });
      }
    },
    [fetchDeals]
  );

  const handleDealClick = useCallback(
    async (deal: Deal) => {
      // Fetch full deal with stage history
      try {
        const res = await fetch(`/api/deals/${deal.id}`);
        if (!res.ok) throw new Error('Failed to fetch deal');
        const fullDeal = await res.json();
        setEditingDeal(fullDeal);
        setFormOpen(true);
      } catch {
        setEditingDeal(deal);
        setFormOpen(true);
      }
    },
    []
  );

  const handleCreateDeal = () => {
    setEditingDeal(null);
    setFormOpen(true);
  };

  const handleFormSubmit = useCallback(
    async (data: DealFormData) => {
      setSaving(true);
      try {
        const body = {
          ...data,
          closeDate: data.closeDate || undefined,
          notes: data.notes || undefined,
          nextStep: data.nextStep || undefined,
        };

        if (editingDeal) {
          const res = await fetch(`/api/deals/${editingDeal.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });
          if (!res.ok) throw new Error('Failed to update deal');
          const updated = await res.json();
          setDeals((prev) =>
            prev.map((d) => (d.id === updated.id ? updated : d))
          );
          toast({ type: 'success', title: 'Deal updated' });
        } else {
          const res = await fetch('/api/deals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });
          if (!res.ok) throw new Error('Failed to create deal');
          const created = await res.json();
          setDeals((prev) => [created, ...prev]);
          toast({ type: 'success', title: 'Deal created' });
        }

        setFormOpen(false);
        setEditingDeal(null);
      } catch {
        toast({
          type: 'error',
          title: editingDeal
            ? 'Failed to update deal'
            : 'Failed to create deal',
        });
      } finally {
        setSaving(false);
      }
    },
    [editingDeal]
  );

  // Summary stats
  const openDeals = deals.filter(
    (d) => d.stage !== 'ClosedWon' && d.stage !== 'ClosedLost'
  );
  const totalPipelineValue = openDeals.reduce((s, d) => s + d.value, 0);
  const weightedValue = openDeals.reduce(
    (s, d) => s + d.value * (d.probability / 100),
    0
  );
  const avgProbability =
    openDeals.length > 0
      ? Math.round(
          openDeals.reduce((s, d) => s + d.probability, 0) / openDeals.length
        )
      : 0;

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pipeline</h1>
          <p className="text-sm text-muted-foreground">
            Manage your sales pipeline and deal flow
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border bg-secondary p-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all',
                viewMode === 'kanban'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <LayoutGrid className="h-4 w-4" />
              Board
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all',
                viewMode === 'list'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <List className="h-4 w-4" />
              List
            </button>
          </div>
          <Button onClick={handleCreateDeal}>
            <Plus className="h-4 w-4" />
            New Deal
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pipeline Value</p>
              <p className="text-lg font-bold text-foreground">
                {formatCurrency(totalPipelineValue)}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Weighted Value</p>
              <p className="text-lg font-bold text-foreground">
                {formatCurrency(weightedValue)}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
              <Target className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avg. Probability</p>
              <p className="text-lg font-bold text-foreground">
                {avgProbability}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : viewMode === 'kanban' ? (
        <KanbanBoard
          deals={deals}
          onStageDrop={handleStageDrop}
          onDealClick={handleDealClick}
        />
      ) : (
        <PipelineListView deals={deals} onDealClick={handleDealClick} />
      )}

      {/* Deal Form Modal */}
      <DealForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingDeal(null);
        }}
        deal={editingDeal}
        clients={clients}
        onSubmit={handleFormSubmit}
        isLoading={saving}
      />
    </div>
  );
}
