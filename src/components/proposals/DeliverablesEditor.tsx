'use client';

import * as React from 'react';
import { Plus, Trash2, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { type ProposalDeliverable } from '@/types';
import { generateId } from '@/lib/utils';

interface DeliverablesEditorProps {
  deliverables: ProposalDeliverable[];
  proposalId: string;
  onChange: (deliverables: ProposalDeliverable[]) => void;
}

export function DeliverablesEditor({
  deliverables,
  proposalId,
  onChange,
}: DeliverablesEditorProps) {
  const sorted = [...deliverables].sort((a, b) => a.sortOrder - b.sortOrder);

  const addDeliverable = () => {
    const newDeliverable: ProposalDeliverable = {
      id: generateId(),
      proposalId,
      title: '',
      description: null,
      sortOrder: sorted.length,
    };
    onChange([...deliverables, newDeliverable]);
  };

  const updateDeliverable = (
    id: string,
    field: 'title' | 'description',
    value: string
  ) => {
    onChange(
      deliverables.map((d) =>
        d.id === id
          ? { ...d, [field]: field === 'description' ? value || null : value }
          : d
      )
    );
  };

  const removeDeliverable = (id: string) => {
    const updated = deliverables
      .filter((d) => d.id !== id)
      .map((d, i) => ({ ...d, sortOrder: i }));
    onChange(updated);
  };

  const moveDeliverable = (id: string, direction: 'up' | 'down') => {
    const idx = sorted.findIndex((d) => d.id === id);
    if (
      (direction === 'up' && idx === 0) ||
      (direction === 'down' && idx === sorted.length - 1)
    )
      return;

    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    const updated = [...sorted];
    [updated[idx], updated[swapIdx]] = [updated[swapIdx], updated[idx]];
    onChange(updated.map((d, i) => ({ ...d, sortOrder: i })));
  };

  return (
    <div className="space-y-3">
      {sorted.length === 0 && (
        <p className="text-sm text-muted-foreground italic py-4 text-center">
          No deliverables added yet. Click below to add your first deliverable.
        </p>
      )}

      {sorted.map((deliverable, idx) => (
        <div
          key={deliverable.id}
          className="group flex gap-2 rounded-lg border border-border bg-secondary/50 p-3"
        >
          <div className="flex flex-col items-center gap-1 pt-1">
            <GripVertical className="h-4 w-4 text-muted-foreground/40" />
            <button
              type="button"
              onClick={() => moveDeliverable(deliverable.id, 'up')}
              disabled={idx === 0}
              className="rounded p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
            >
              <ChevronUp className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={() => moveDeliverable(deliverable.id, 'down')}
              disabled={idx === sorted.length - 1}
              className="rounded p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
            >
              <ChevronDown className="h-3 w-3" />
            </button>
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground/60 w-6 text-center">
                {idx + 1}
              </span>
              <Input
                value={deliverable.title}
                onChange={(e) =>
                  updateDeliverable(deliverable.id, 'title', e.target.value)
                }
                placeholder="Deliverable title"
                className="h-9 text-sm"
              />
            </div>
            <Textarea
              value={deliverable.description ?? ''}
              onChange={(e) =>
                updateDeliverable(deliverable.id, 'description', e.target.value)
              }
              placeholder="Description (optional)"
              rows={2}
              className="text-sm"
            />
          </div>

          <button
            type="button"
            onClick={() => removeDeliverable(deliverable.id)}
            className="self-start rounded p-1.5 text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addDeliverable}
        className="gap-1 w-full border-dashed"
      >
        <Plus className="h-3.5 w-3.5" />
        Add Deliverable
      </Button>
    </div>
  );
}
