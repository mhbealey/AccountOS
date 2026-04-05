'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { DealCard } from './DealCard';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Deal, DealStageLiteral } from '@/types';

interface KanbanColumnProps {
  stage: DealStageLiteral;
  deals: Deal[];
  onDealClick: (deal: Deal) => void;
}

const STAGE_COLORS: Record<DealStageLiteral, string> = {
  Lead: 'border-t-slate-400',
  Discovery: 'border-t-blue-400',
  Proposal: 'border-t-violet-400',
  Negotiation: 'border-t-amber-400',
  ClosedWon: 'border-t-emerald-400',
  ClosedLost: 'border-t-red-400',
};

const STAGE_LABELS: Record<DealStageLiteral, string> = {
  Lead: 'Lead',
  Discovery: 'Discovery',
  Proposal: 'Proposal',
  Negotiation: 'Negotiation',
  ClosedWon: 'Closed Won',
  ClosedLost: 'Closed Lost',
};

export function KanbanColumn({ stage, deals, onDealClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage,
    data: { type: 'column', stage },
  });

  const totalValue = deals.reduce((sum, d) => sum + d.value, 0);
  const weightedValue = deals.reduce(
    (sum, d) => sum + d.value * (d.probability / 100),
    0
  );

  return (
    <div
      className={cn(
        'flex h-full w-72 shrink-0 flex-col rounded-xl border border-border/50 border-t-2 bg-[#0a0f1e]/60',
        STAGE_COLORS[stage],
        isOver && 'border-primary/50 bg-primary/5'
      )}
    >
      <div className="space-y-1 p-3 pb-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">
            {STAGE_LABELS[stage]}
          </h3>
          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {deals.length}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatCurrency(totalValue)}</span>
          <span className="text-muted-foreground/60">
            Wtd: {formatCurrency(weightedValue)}
          </span>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className="flex flex-1 flex-col gap-2 overflow-y-auto p-2 pt-0"
      >
        <SortableContext
          items={deals.map((d) => d.id)}
          strategy={verticalListSortingStrategy}
        >
          {deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} onClick={onDealClick} />
          ))}
        </SortableContext>
        {deals.length === 0 && (
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-border/30 p-4 text-center text-xs text-muted-foreground/50">
            Drop deals here
          </div>
        )}
      </div>
    </div>
  );
}

export { STAGE_LABELS, STAGE_COLORS };
