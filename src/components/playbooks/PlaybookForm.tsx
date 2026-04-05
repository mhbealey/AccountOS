'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { StepsEditor, type StepDraft } from './StepsEditor';
import { PlaybookTrigger } from '@/types';
import type { Playbook } from '@/types';

// ---------------------------------------------------------------------------
// Trigger options
// ---------------------------------------------------------------------------

const TRIGGER_OPTIONS: { value: string; label: string }[] = [
  { value: PlaybookTrigger.NEW_CLIENT,        label: 'New Client' },
  { value: PlaybookTrigger.RENEWAL_90,        label: 'Renewal 90 Days' },
  { value: PlaybookTrigger.HEALTH_BELOW_40,   label: 'Health Below 40' },
  { value: PlaybookTrigger.HEALTH_ABOVE_80,   label: 'Health Above 80' },
  { value: PlaybookTrigger.QBR_14_DAYS,       label: 'QBR in 14 Days' },
  { value: PlaybookTrigger.CONTRACT_EXPIRING, label: 'Contract Expiring' },
  { value: PlaybookTrigger.DEAL_CLOSED_WON,   label: 'Deal Closed Won' },
  { value: PlaybookTrigger.DEAL_CLOSED_LOST,  label: 'Deal Closed Lost' },
  { value: PlaybookTrigger.CUSTOM,            label: 'Custom' },
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface PlaybookFormProps {
  playbook?: Playbook | null;
  onSave: (data: {
    name: string;
    description: string;
    trigger: string;
    isActive: boolean;
    steps: StepDraft[];
  }) => Promise<void>;
  onCancel: () => void;
  saving?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PlaybookForm({ playbook, onSave, onCancel, saving }: PlaybookFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [trigger, setTrigger] = useState<string>(PlaybookTrigger.CUSTOM);
  const [isActive, setIsActive] = useState(true);
  const [steps, setSteps] = useState<StepDraft[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (playbook) {
      setName(playbook.name);
      setDescription(playbook.description ?? '');
      setTrigger(playbook.trigger);
      setIsActive(playbook.isActive);
      setSteps(
        (playbook.steps ?? []).map((s) => ({
          id: s.id,
          title: s.title,
          dayOffset: s.dayOffset,
          taskTemplate: s.taskTemplate ?? '',
          sortOrder: s.sortOrder,
        }))
      );
    }
  }, [playbook]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Name is required';
    if (!trigger) errs.trigger = 'Trigger is required';

    const emptySteps = steps.filter((s) => !s.title.trim());
    if (emptySteps.length > 0) errs.steps = 'All steps must have a title';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSave({ name: name.trim(), description: description.trim(), trigger, isActive, steps });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          {playbook ? 'Edit Playbook' : 'New Playbook'}
        </h2>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="pb-name">
          Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="pb-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Client Onboarding"
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="pb-desc">Description</Label>
        <Textarea
          id="pb-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what this playbook does..."
          rows={3}
        />
      </div>

      {/* Trigger */}
      <div className="space-y-1.5">
        <Label htmlFor="pb-trigger">
          Trigger <span className="text-destructive">*</span>
        </Label>
        <Select id="pb-trigger" value={trigger} onChange={(e) => setTrigger(e.target.value)}>
          {TRIGGER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
        {errors.trigger && <p className="text-xs text-destructive">{errors.trigger}</p>}
      </div>

      {/* Active toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setIsActive(!isActive)}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
            isActive ? 'bg-primary' : 'bg-secondary'
          }`}
          role="switch"
          aria-checked={isActive}
        >
          <span
            className={`pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ${
              isActive ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
        <Label className="cursor-pointer" onClick={() => setIsActive(!isActive)}>
          Active
        </Label>
      </div>

      {/* Steps editor */}
      <StepsEditor steps={steps} onChange={setSteps} />
      {errors.steps && <p className="text-xs text-destructive">{errors.steps}</p>}

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving...' : playbook ? 'Update Playbook' : 'Create Playbook'}
        </Button>
      </div>
    </form>
  );
}
