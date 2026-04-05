'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Play, CalendarDays, CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import type { Playbook } from '@/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ClientOption {
  id: string;
  name: string;
}

interface TriggerDialogProps {
  playbook: Playbook | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (playbookId: string, clientId: string) => Promise<{ tasksCreated: number; client: string } | null>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function addBusinessDays(from: Date, days: number): Date {
  const result = new Date(from);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    const dow = result.getDay();
    if (dow !== 0 && dow !== 6) added++;
  }
  return result;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TriggerDialog({ playbook, open, onOpenChange, onConfirm }: TriggerDialogProps) {
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [clientId, setClientId] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{ tasksCreated: number; client: string } | null>(null);

  // Fetch clients when dialog opens
  useEffect(() => {
    if (!open) {
      setClientId('');
      setSuccess(null);
      return;
    }
    (async () => {
      try {
        const res = await fetch('/api/clients');
        if (res.ok) {
          const data = await res.json();
          setClients(data.map((c: { id: string; name: string }) => ({ id: c.id, name: c.name })));
        }
      } catch {
        // silently fail
      }
    })();
  }, [open]);

  // Preview tasks with calculated due dates
  const preview = useMemo(() => {
    if (!playbook?.steps) return [];
    const today = new Date();
    return playbook.steps.map((step) => ({
      title: step.title,
      dayOffset: step.dayOffset,
      dueDate: addBusinessDays(today, step.dayOffset),
    }));
  }, [playbook]);

  const selectedClientName = clients.find((c) => c.id === clientId)?.name ?? '';

  const handleConfirm = async () => {
    if (!playbook || !clientId) return;
    setLoading(true);
    try {
      const result = await onConfirm(playbook.id, clientId);
      if (result) {
        setSuccess(result);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        {success ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-[#22c55e]" />
                Playbook Triggered
              </DialogTitle>
              <DialogDescription>
                {success.tasksCreated} task{success.tasksCreated !== 1 ? 's' : ''} created for{' '}
                <span className="font-medium text-foreground">{success.client}</span>.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => onOpenChange(false)}>Done</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Play className="h-5 w-5 text-primary" />
                Trigger: {playbook?.name}
              </DialogTitle>
              <DialogDescription>
                Select a client and review the tasks that will be created.
              </DialogDescription>
            </DialogHeader>

            {/* Client selection */}
            <div className="space-y-1.5 mt-4">
              <Label htmlFor="trigger-client">Client</Label>
              <Select
                id="trigger-client"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
              >
                <option value="">Select a client...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>

            {/* Preview */}
            {clientId && preview.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-foreground">
                  Tasks to create for{' '}
                  <span className="text-primary">{selectedClientName}</span>:
                </p>
                <div className="max-h-64 overflow-y-auto rounded-lg border border-border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-secondary/50">
                        <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                          Task
                        </th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">
                          Day
                        </th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground">
                          Due Date
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((task, i) => (
                        <tr key={i} className="border-b border-border last:border-0">
                          <td className="px-3 py-2 text-foreground">{task.title}</td>
                          <td className="px-3 py-2 text-right text-muted-foreground">
                            +{task.dayOffset}d
                          </td>
                          <td className="px-3 py-2 text-right text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <CalendarDays className="h-3 w-3" />
                              {formatDate(task.dueDate)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleConfirm} disabled={!clientId || loading}>
                {loading ? 'Creating...' : `Create ${preview.length} Task${preview.length !== 1 ? 's' : ''}`}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
