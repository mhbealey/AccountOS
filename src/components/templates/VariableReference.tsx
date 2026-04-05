'use client';

import React from 'react';
import { Label } from '@/components/ui/label';

// ---------------------------------------------------------------------------
// Available variables
// ---------------------------------------------------------------------------

export const TEMPLATE_VARIABLES = [
  { key: '{{clientName}}',       description: 'Client company name' },
  { key: '{{contactName}}',      description: 'Primary contact name' },
  { key: '{{contactTitle}}',     description: 'Contact job title' },
  { key: '{{myName}}',           description: 'Your name' },
  { key: '{{businessName}}',     description: 'Your business name' },
  { key: '{{qbrDate}}',          description: 'Next QBR date' },
  { key: '{{contractEndDate}}',  description: 'Contract end date' },
  { key: '{{invoiceNumber}}',    description: 'Invoice number' },
  { key: '{{invoiceAmount}}',    description: 'Invoice amount' },
  { key: '{{invoiceDueDate}}',   description: 'Invoice due date' },
] as const;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface VariableReferenceProps {
  onInsert: (variable: string) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function VariableReference({ onInsert }: VariableReferenceProps) {
  return (
    <div className="space-y-2">
      <Label className="text-xs">Available Variables</Label>
      <div className="rounded-lg border border-border bg-secondary/40 p-3 space-y-1 max-h-64 overflow-y-auto">
        {TEMPLATE_VARIABLES.map((v) => (
          <button
            key={v.key}
            type="button"
            onClick={() => onInsert(v.key)}
            className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <code className="font-mono text-primary">{v.key}</code>
            <span className="text-muted-foreground truncate">{v.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
