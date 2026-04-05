'use client';

import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/layout/Toast';

interface Client {
  id: string;
  name: string;
}

interface TimeEntryFormData {
  clientId: string;
  description: string;
  hours: number;
  rate: number;
  date: string;
  category: string;
  billable: boolean;
}

interface TimeEntryFormProps {
  clients: Client[];
  defaultRate?: number;
  prefill?: Partial<TimeEntryFormData>;
  onSubmit: (data: TimeEntryFormData) => Promise<void>;
  existingHoursForDate?: (date: string) => number;
}

const CATEGORIES = ['Strategy', 'Delivery', 'Admin', 'Meeting', 'QBR'];

export function TimeEntryForm({
  clients,
  defaultRate = 150,
  prefill,
  onSubmit,
  existingHoursForDate,
}: TimeEntryFormProps) {
  const today = new Date().toISOString().split('T')[0];

  const [clientId, setClientId] = useState(prefill?.clientId ?? '');
  const [description, setDescription] = useState(prefill?.description ?? '');
  const [hours, setHours] = useState(prefill?.hours ?? 1);
  const [rate, setRate] = useState(prefill?.rate ?? defaultRate);
  const [date, setDate] = useState(prefill?.date ?? today);
  const [category, setCategory] = useState(prefill?.category ?? 'Delivery');
  const [billable, setBillable] = useState(prefill?.billable ?? true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (prefill) {
      if (prefill.clientId !== undefined) setClientId(prefill.clientId);
      if (prefill.description !== undefined) setDescription(prefill.description);
      if (prefill.hours !== undefined) setHours(prefill.hours);
      if (prefill.category !== undefined) setCategory(prefill.category);
      if (prefill.billable !== undefined) setBillable(prefill.billable);
    }
  }, [prefill]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      toast({ type: 'error', title: 'Description is required' });
      return;
    }

    if (hours <= 0) {
      toast({ type: 'error', title: 'Hours must be greater than 0' });
      return;
    }

    // Check conflict warning
    if (existingHoursForDate) {
      const existing = existingHoursForDate(date);
      if (existing + hours > 10) {
        toast({
          type: 'warning',
          title: 'High hours warning',
          description: `Total hours for ${date} will be ${(existing + hours).toFixed(1)}h (over 10h).`,
        });
      }
    }

    setSubmitting(true);
    try {
      await onSubmit({ clientId, description, hours, rate, date, category, billable });
      // Reset form
      setDescription('');
      setHours(1);
      setDate(today);
      toast({ type: 'success', title: 'Time entry created' });
    } catch {
      toast({ type: 'error', title: 'Failed to create time entry' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-6">
      <h3 className="mb-4 text-base font-semibold text-foreground">Manual Entry</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <div className="space-y-1.5">
          <Label>Client</Label>
          <Select value={clientId} onChange={(e) => setClientId(e.target.value)}>
            <option value="">Select client...</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1.5 lg:col-span-2">
          <Label>
            Description <span className="text-destructive">*</span>
          </Label>
          <Input
            placeholder="What did you work on?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label>Hours</Label>
          <Input
            type="number"
            min="0.25"
            step="0.25"
            value={hours}
            onChange={(e) => setHours(parseFloat(e.target.value) || 0)}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Rate ($/hr)</Label>
          <Input
            type="number"
            min="0"
            step="1"
            value={rate}
            onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Date</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <Label>Category</Label>
          <Select value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex items-end gap-2 pb-2">
          <Checkbox checked={billable} onCheckedChange={setBillable} />
          <Label className="cursor-pointer" onClick={() => setBillable(!billable)}>
            Billable
          </Label>
        </div>

        <div className="flex items-end lg:col-span-4">
          <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            {submitting ? 'Adding...' : 'Add Entry'}
          </Button>
        </div>
      </div>
    </form>
  );
}
