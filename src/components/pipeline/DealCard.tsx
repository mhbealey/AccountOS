'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GripVertical, Calendar, TrendingUp } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Deal } from '@/types';

interface DealCardProps {
  deal: Deal;
  onClick?: (deal: Deal) => void;
  isDragOverlay?: boolean;
}

function getDaysInStage(deal: Deal): number {
  const lastStageChange = deal.stageHistory?.length
    ? deal.stageHistory[deal.stageHistory.length - 1]
    : null;
  const stageDate = lastStageChange
    ? new Date(lastStageChange.changedAt)
    : new Date(deal.createdAt);
  return Math.floor(
    (Date.now() - stageDate.getTime()) / (1000 * 60 * 60 * 24)
  );
}

function getDaysInStageBadgeVariant(
  days: number
): 'success' | 'warning' | 'danger' {
  if (days < 14) return 'success';
  if (days <= 30) return 'warning';
  return 'danger';
}

export function DealCard({ deal, onClick, isDragOverlay }: DealCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: deal.id,
    data: { type: 'deal', deal },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const daysInStage = getDaysInStage(deal);

  return (
    <Card
      ref={!isDragOverlay ? setNodeRef : undefined}
      style={!isDragOverlay ? style : undefined}
      className={cn(
        'cursor-pointer border-border/60 bg-[#0f1729] p-3 transition-all hover:border-primary/40 hover:shadow-md hover:shadow-primary/5',
        isDragging && 'opacity-40',
        isDragOverlay && 'shadow-xl shadow-black/40 border-primary/50 rotate-2'
      )}
      onClick={() => onClick?.(deal)}
    >
      <div className="flex items-start gap-2">
        <button
          className="mt-0.5 shrink-0 cursor-grab touch-none text-muted-foreground/50 hover:text-muted-foreground active:cursor-grabbing"
          {...(!isDragOverlay ? { ...attributes, ...listeners } : {})}
          aria-label="Drag deal"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1 space-y-2">
          <div>
            <p className="truncate text-sm font-medium text-foreground">
              {deal.title}
            </p>
            {deal.client && (
              <p className="truncate text-xs text-muted-foreground">
                {deal.client.name}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-foreground">
              {formatCurrency(deal.value)}
            </span>
            <Badge variant={getDaysInStageBadgeVariant(daysInStage)}>
              {daysInStage}d
            </Badge>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {deal.probability}%
            </span>
            {deal.closeDate && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(deal.closeDate)}
              </span>
            )}
          </div>

          {deal.nextStep && (
            <p className="truncate text-xs italic text-muted-foreground/70">
              Next: {deal.nextStep}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

export { getDaysInStage, getDaysInStageBadgeVariant };
