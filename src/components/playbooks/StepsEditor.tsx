'use client';

import React from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface StepDraft {
  id?: string;
  title: string;
  dayOffset: number;
  taskTemplate: string;
  sortOrder: number;
}

interface StepsEditorProps {
  steps: StepDraft[];
  onChange: (steps: StepDraft[]) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function StepsEditor({ steps, onChange }: StepsEditorProps) {
  const addStep = () => {
    const next: StepDraft = {
      title: '',
      dayOffset: 0,
      taskTemplate: '',
      sortOrder: steps.length,
    };
    onChange([...steps, next]);
  };

  const removeStep = (index: number) => {
    const updated = steps.filter((_, i) => i !== index).map((s, i) => ({ ...s, sortOrder: i }));
    onChange(updated);
  };

  const updateStep = (index: number, patch: Partial<StepDraft>) => {
    const updated = steps.map((s, i) => (i === index ? { ...s, ...patch } : s));
    onChange(updated);
  };

  const moveStep = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= steps.length) return;
    const updated = [...steps];
    const temp = updated[index];
    updated[index] = updated[target];
    updated[target] = temp;
    onChange(updated.map((s, i) => ({ ...s, sortOrder: i })));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-foreground">Steps</Label>
        <Button type="button" variant="outline" size="sm" onClick={addStep} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          Add Step
        </Button>
      </div>

      {steps.length === 0 && (
        <p className="text-sm text-muted-foreground py-4 text-center border border-dashed border-border rounded-lg">
          No steps yet. Add a step to get started.
        </p>
      )}

      <div className="space-y-3">
        {steps.map((step, index) => (
          <div
            key={index}
            className="rounded-lg border border-border bg-secondary/40 p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Step {index + 1}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={index === 0}
                  onClick={() => moveStep(index, -1)}
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={index === steps.length - 1}
                  onClick={() => moveStep(index, 1)}
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => removeStep(index)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
              <div className="space-y-1.5">
                <Label htmlFor={`step-title-${index}`} className="text-xs">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id={`step-title-${index}`}
                  value={step.title}
                  onChange={(e) => updateStep(index, { title: e.target.value })}
                  placeholder="e.g. Send welcome email"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`step-day-${index}`} className="text-xs">
                  Day Offset
                </Label>
                <Input
                  id={`step-day-${index}`}
                  type="number"
                  min={0}
                  value={step.dayOffset}
                  onChange={(e) =>
                    updateStep(index, { dayOffset: parseInt(e.target.value, 10) || 0 })
                  }
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor={`step-template-${index}`} className="text-xs">
                Task Template (JSON, optional)
              </Label>
              <Textarea
                id={`step-template-${index}`}
                rows={2}
                value={step.taskTemplate}
                onChange={(e) => updateStep(index, { taskTemplate: e.target.value })}
                placeholder='{"title":"Follow up","priority":"High","category":"onboarding"}'
                className="font-mono text-xs"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
