'use client';

import React from 'react';
import {
  Play,
  Pencil,
  Trash2,
  ListChecks,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Playbook, PlaybookTriggerLiteral } from '@/types';

// ---------------------------------------------------------------------------
// Trigger badge config
// ---------------------------------------------------------------------------

const TRIGGER_STYLES: Record<PlaybookTriggerLiteral, { label: string; className: string }> = {
  new_client:        { label: 'New Client',        className: 'bg-[rgba(34,197,94,0.15)] text-[#22c55e]' },
  renewal_90:        { label: 'Renewal 90d',       className: 'bg-[rgba(59,130,246,0.15)] text-[#3b82f6]' },
  health_below_40:   { label: 'Health < 40',       className: 'bg-[rgba(239,68,68,0.15)] text-[#ef4444]' },
  health_above_80:   { label: 'Health > 80',       className: 'bg-[rgba(168,85,247,0.15)] text-[#a855f7]' },
  qbr_14_days:       { label: 'QBR 14d',          className: 'bg-[rgba(249,115,22,0.15)] text-[#f97316]' },
  contract_expiring: { label: 'Contract Expiring', className: 'bg-[rgba(234,179,8,0.15)] text-[#eab308]' },
  deal_closed_won:   { label: 'Deal Won',          className: 'bg-[rgba(34,197,94,0.15)] text-[#22c55e]' },
  deal_closed_lost:  { label: 'Deal Lost',         className: 'bg-[rgba(239,68,68,0.15)] text-[#ef4444]' },
  custom:            { label: 'Custom',            className: 'bg-[rgba(148,163,184,0.15)] text-[#94a3b8]' },
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface PlaybookCardProps {
  playbook: Playbook;
  onEdit: (playbook: Playbook) => void;
  onDelete: (playbook: Playbook) => void;
  onTrigger: (playbook: Playbook) => void;
  onToggleActive: (playbook: Playbook) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PlaybookCard({
  playbook,
  onEdit,
  onDelete,
  onTrigger,
  onToggleActive,
}: PlaybookCardProps) {
  const triggerStyle = TRIGGER_STYLES[playbook.trigger] ?? TRIGGER_STYLES.custom;
  const stepCount = playbook.steps?.length ?? 0;

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-snug">{playbook.name}</CardTitle>
          <button
            type="button"
            onClick={() => onToggleActive(playbook)}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
              playbook.isActive ? 'bg-primary' : 'bg-secondary'
            }`}
            role="switch"
            aria-checked={playbook.isActive}
            aria-label={playbook.isActive ? 'Deactivate playbook' : 'Activate playbook'}
          >
            <span
              className={`pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ${
                playbook.isActive ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
        {playbook.description && (
          <CardDescription className="line-clamp-2 mt-1">
            {playbook.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={triggerStyle.className}>{triggerStyle.label}</Badge>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <ListChecks className="h-3.5 w-3.5" />
            {stepCount} step{stepCount !== 1 ? 's' : ''}
          </span>
          {!playbook.isActive && (
            <Badge className="bg-[rgba(148,163,184,0.15)] text-[#94a3b8]">Inactive</Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex items-center gap-2 border-t border-border pt-4">
        <Button
          size="sm"
          onClick={() => onTrigger(playbook)}
          disabled={!playbook.isActive}
          className="gap-1.5"
        >
          <Play className="h-3.5 w-3.5" />
          Trigger Now
        </Button>
        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(playbook)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => onDelete(playbook)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
