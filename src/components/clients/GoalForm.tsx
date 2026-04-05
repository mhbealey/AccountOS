'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import type { ClientGoal, ClientGoalStatusLiteral } from '@/types';

const STATUS_OPTIONS: ClientGoalStatusLiteral[] = [
  'In Progress',
  'Achieved',
  'Missed',
  'Cancelled',
];

interface GoalFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal?: ClientGoal | null;
  onSubmit: (data: Partial<ClientGoal>) => Promise<void>;
}

export function GoalForm({ open, onOpenChange, goal, onSubmit }: GoalFormProps) {
  const isEdit = !!goal;

  const [form, setForm] = useState({
    title: '',
    description: '',
    targetMetric: '',
    targetValue: 0,
    currentValue: 0,
    status: 'In Progress' as ClientGoalStatusLiteral,
    dueDate: '',
    quarter: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (goal) {
      setForm({
        title: goal.title,
        description: goal.description ?? '',
        targetMetric: goal.targetMetric ?? '',
        targetValue: goal.targetValue ?? 0,
        currentValue: goal.currentValue ?? 0,
        status: goal.status,
        dueDate: goal.dueDate ? new Date(goal.dueDate).toISOString().split('T')[0] : '',
        quarter: goal.quarter ?? '',
      });
    } else {
      setForm({
        title: '',
        description: '',
        targetMetric: '',
        targetValue: 0,
        currentValue: 0,
        status: 'In Progress',
        dueDate: '',
        quarter: '',
      });
    }
    setErrors({});
  }, [goal, open]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (form.targetValue < 0) errs.targetValue = 'Target value cannot be negative';
    if (form.currentValue < 0) errs.currentValue = 'Current value cannot be negative';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        title: form.title.trim(),
        description: form.description || null,
        targetMetric: form.targetMetric || null,
        targetValue: form.targetValue || null,
        currentValue: form.currentValue || null,
        status: form.status,
        dueDate: form.dueDate ? new Date(form.dueDate) : null,
        quarter: form.quarter || null,
      });
      onOpenChange(false);
    } catch {
      setErrors({ _form: 'Failed to save goal.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Goal' : 'Add Goal'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {errors._form && <p className="text-sm text-red-400">{errors._form}</p>}

          <div className="space-y-1.5">
            <Label htmlFor="gf-title">Title *</Label>
            <Input
              id="gf-title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Increase adoption to 80%"
            />
            {errors.title && <p className="text-xs text-red-400">{errors.title}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="gf-desc">Description</Label>
            <Textarea
              id="gf-desc"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="gf-metric">Target Metric</Label>
              <Input
                id="gf-metric"
                value={form.targetMetric}
                onChange={(e) => setForm({ ...form, targetMetric: e.target.value })}
                placeholder="e.g., Active Users"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="gf-status">Status</Label>
              <Select
                id="gf-status"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as ClientGoalStatusLiteral })}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="gf-target">Target Value</Label>
              <Input
                id="gf-target"
                type="number"
                min={0}
                value={form.targetValue}
                onChange={(e) => setForm({ ...form, targetValue: parseFloat(e.target.value) || 0 })}
              />
              {errors.targetValue && <p className="text-xs text-red-400">{errors.targetValue}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="gf-current">Current Value</Label>
              <Input
                id="gf-current"
                type="number"
                min={0}
                value={form.currentValue}
                onChange={(e) => setForm({ ...form, currentValue: parseFloat(e.target.value) || 0 })}
              />
              {errors.currentValue && <p className="text-xs text-red-400">{errors.currentValue}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="gf-due">Due Date</Label>
              <Input
                id="gf-due"
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="gf-quarter">Quarter</Label>
              <Input
                id="gf-quarter"
                value={form.quarter}
                onChange={(e) => setForm({ ...form, quarter: e.target.value })}
                placeholder="Q1 2026"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Goal'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
