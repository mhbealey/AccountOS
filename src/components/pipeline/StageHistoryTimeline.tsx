'use client';

import React from 'react';
import { ArrowRight, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/utils';
import type { StageChange } from '@/types';

interface StageHistoryTimelineProps {
  history: StageChange[];
}

const STAGE_DISPLAY: Record<string, string> = {
  Lead: 'Lead',
  Discovery: 'Discovery',
  Proposal: 'Proposal',
  Negotiation: 'Negotiation',
  ClosedWon: 'Closed Won',
  ClosedLost: 'Closed Lost',
  '': 'New',
};

function stageBadgeVariant(
  stage: string
): 'default' | 'success' | 'danger' | 'info' | 'warning' {
  switch (stage) {
    case 'ClosedWon':
      return 'success';
    case 'ClosedLost':
      return 'danger';
    case 'Negotiation':
      return 'warning';
    case 'Proposal':
      return 'info';
    default:
      return 'default';
  }
}

export function StageHistoryTimeline({ history }: StageHistoryTimelineProps) {
  if (!history.length) {
    return (
      <p className="text-sm text-muted-foreground">No stage history yet.</p>
    );
  }

  return (
    <div className="space-y-0">
      {history.map((change, idx) => (
        <div key={change.id} className="relative flex gap-3 pb-4">
          {/* Timeline line */}
          {idx < history.length - 1 && (
            <div className="absolute left-[11px] top-6 h-full w-px bg-border/50" />
          )}
          {/* Dot */}
          <div className="relative z-10 mt-1.5 h-[10px] w-[10px] shrink-0 rounded-full border-2 border-primary bg-background" />
          {/* Content */}
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant={stageBadgeVariant(change.fromStage)}>
                {STAGE_DISPLAY[change.fromStage] || change.fromStage}
              </Badge>
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
              <Badge variant={stageBadgeVariant(change.toStage)}>
                {STAGE_DISPLAY[change.toStage] || change.toStage}
              </Badge>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {formatDateTime(change.changedAt)}
            </div>
            {change.notes && (
              <p className="text-xs text-muted-foreground/80">
                {change.notes}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
