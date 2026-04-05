'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { StageHistoryTimeline } from './StageHistoryTimeline';
import { getStageProbability } from '@/lib/utils';
import type { Deal, Client, DealStageLiteral, StageChange } from '@/types';

interface DealFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deal?: Deal | null;
  clients: Pick<Client, 'id' | 'name'>[];
  onSubmit: (data: DealFormData) => void;
  isLoading?: boolean;
}

export interface DealFormData {
  title: string;
  clientId: string;
  value: number;
  stage: DealStageLiteral;
  probability: number;
  closeDate: string;
  nextStep: string;
  notes: string;
}

const STAGES: { value: DealStageLiteral; label: string }[] = [
  { value: 'Lead', label: 'Lead' },
  { value: 'Discovery', label: 'Discovery' },
  { value: 'Proposal', label: 'Proposal' },
  { value: 'Negotiation', label: 'Negotiation' },
  { value: 'ClosedWon', label: 'Closed Won' },
  { value: 'ClosedLost', label: 'Closed Lost' },
];

export function DealForm({
  open,
  onOpenChange,
  deal,
  clients,
  onSubmit,
  isLoading,
}: DealFormProps) {
  const isEditing = !!deal;

  const [form, setForm] = useState<DealFormData>({
    title: '',
    clientId: '',
    value: 0,
    stage: 'Lead',
    probability: 10,
    closeDate: '',
    nextStep: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (deal) {
      setForm({
        title: deal.title,
        clientId: deal.clientId,
        value: deal.value,
        stage: deal.stage,
        probability: deal.probability,
        closeDate: deal.closeDate
          ? new Date(deal.closeDate).toISOString().split('T')[0]
          : '',
        nextStep: deal.nextStep || '',
        notes: deal.notes || '',
      });
    } else {
      setForm({
        title: '',
        clientId: '',
        value: 0,
        stage: 'Lead',
        probability: 10,
        closeDate: '',
        nextStep: '',
        notes: '',
      });
    }
    setErrors({});
  }, [deal, open]);

  const handleStageChange = (newStage: DealStageLiteral) => {
    setForm((prev) => ({
      ...prev,
      stage: newStage,
      probability: getStageProbability(newStage),
    }));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.clientId) errs.clientId = 'Client is required';
    if (!form.value || form.value <= 0) errs.value = 'Value must be positive';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Deal' : 'New Deal'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="deal-title">
              Title <span className="text-red-400">*</span>
            </Label>
            <Input
              id="deal-title"
              value={form.title}
              onChange={(e) =>
                setForm((p) => ({ ...p, title: e.target.value }))
              }
              placeholder="e.g., Website Redesign Project"
            />
            {errors.title && (
              <p className="text-xs text-red-400">{errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="deal-client">
              Client <span className="text-red-400">*</span>
            </Label>
            <Select
              id="deal-client"
              value={form.clientId}
              onChange={(e) =>
                setForm((p) => ({ ...p, clientId: e.target.value }))
              }
            >
              <option value="">Select a client...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
            {errors.clientId && (
              <p className="text-xs text-red-400">{errors.clientId}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deal-value">
                Value ($) <span className="text-red-400">*</span>
              </Label>
              <Input
                id="deal-value"
                type="number"
                min={0}
                step={100}
                value={form.value || ''}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    value: parseFloat(e.target.value) || 0,
                  }))
                }
                placeholder="10000"
              />
              {errors.value && (
                <p className="text-xs text-red-400">{errors.value}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="deal-stage">Stage</Label>
              <Select
                id="deal-stage"
                value={form.stage}
                onChange={(e) =>
                  handleStageChange(e.target.value as DealStageLiteral)
                }
              >
                {STAGES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deal-probability">Probability (%)</Label>
              <Input
                id="deal-probability"
                type="number"
                min={0}
                max={100}
                value={form.probability}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    probability: parseInt(e.target.value) || 0,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deal-close-date">Close Date</Label>
              <Input
                id="deal-close-date"
                type="date"
                value={form.closeDate}
                onChange={(e) =>
                  setForm((p) => ({ ...p, closeDate: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deal-next-step">Next Step</Label>
            <Input
              id="deal-next-step"
              value={form.nextStep}
              onChange={(e) =>
                setForm((p) => ({ ...p, nextStep: e.target.value }))
              }
              placeholder="e.g., Schedule follow-up call"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deal-notes">Notes</Label>
            <Textarea
              id="deal-notes"
              value={form.notes}
              onChange={(e) =>
                setForm((p) => ({ ...p, notes: e.target.value }))
              }
              placeholder="Additional notes..."
              rows={3}
            />
          </div>

          {isEditing && deal?.stageHistory && deal.stageHistory.length > 0 && (
            <div className="space-y-2 border-t border-border pt-4">
              <Label>Stage History</Label>
              <StageHistoryTimeline
                history={deal.stageHistory as StageChange[]}
              />
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? 'Saving...'
                : isEditing
                  ? 'Update Deal'
                  : 'Create Deal'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
