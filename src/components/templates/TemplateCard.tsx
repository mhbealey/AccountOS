'use client';

import React from 'react';
import { Pencil, Trash2, Eye, Mail } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Template } from '@/types';

// ---------------------------------------------------------------------------
// Category badge config
// ---------------------------------------------------------------------------

const CATEGORY_STYLES: Record<string, { label: string; className: string }> = {
  welcome:          { label: 'Welcome',          className: 'bg-[rgba(34,197,94,0.15)] text-[#22c55e]' },
  follow_up:        { label: 'Follow Up',        className: 'bg-[rgba(59,130,246,0.15)] text-[#3b82f6]' },
  check_in:         { label: 'Check In',         className: 'bg-[rgba(59,130,246,0.15)] text-[#3b82f6]' },
  qbr_invite:       { label: 'QBR Invite',       className: 'bg-[rgba(249,115,22,0.15)] text-[#f97316]' },
  renewal:          { label: 'Renewal',          className: 'bg-[rgba(168,85,247,0.15)] text-[#a855f7]' },
  thank_you:        { label: 'Thank You',        className: 'bg-[rgba(34,197,94,0.15)] text-[#22c55e]' },
  referral_ask:     { label: 'Referral Ask',     className: 'bg-[rgba(236,72,153,0.15)] text-[#ec4899]' },
  proposal_cover:   { label: 'Proposal Cover',   className: 'bg-[rgba(148,163,184,0.15)] text-[#94a3b8]' },
  payment_reminder: { label: 'Payment Reminder', className: 'bg-[rgba(234,179,8,0.15)] text-[#eab308]' },
  offboarding:      { label: 'Offboarding',      className: 'bg-[rgba(239,68,68,0.15)] text-[#ef4444]' },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function countVariables(body: string, subject?: string | null): number {
  const text = (subject ?? '') + body;
  const matches = text.match(/\{\{[^}]+\}\}/g);
  return new Set(matches ?? []).size;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface TemplateCardProps {
  template: Template;
  onEdit: (template: Template) => void;
  onDelete: (template: Template) => void;
  onPreview: (template: Template) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TemplateCard({ template, onEdit, onDelete, onPreview }: TemplateCardProps) {
  const catStyle = CATEGORY_STYLES[template.category] ?? {
    label: template.category,
    className: 'bg-[rgba(148,163,184,0.15)] text-[#94a3b8]',
  };

  const varCount = countVariables(template.body, template.subject);

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-snug">{template.name}</CardTitle>
          <Badge className={catStyle.className}>{catStyle.label}</Badge>
        </div>
        {template.subject && (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1.5 truncate">
            <Mail className="h-3 w-3 shrink-0" />
            {template.subject}
          </p>
        )}
      </CardHeader>

      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
          {template.body}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          {varCount} variable{varCount !== 1 ? 's' : ''} used
        </p>
      </CardContent>

      <CardFooter className="flex items-center gap-2 border-t border-border pt-4">
        <Button variant="outline" size="sm" onClick={() => onPreview(template)} className="gap-1.5">
          <Eye className="h-3.5 w-3.5" />
          Preview
        </Button>
        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(template)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => onDelete(template)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
