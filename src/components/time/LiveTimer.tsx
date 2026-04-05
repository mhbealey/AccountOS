'use client';

import React, { useEffect } from 'react';
import { Play, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useTimerStore, formatElapsed } from '@/store/timer';
import { cn } from '@/lib/utils';

interface Client {
  id: string;
  name: string;
}

interface LiveTimerProps {
  clients: Client[];
  onTimerStop: (data: {
    clientId: string;
    description: string;
    hours: number;
    category: string;
    billable: boolean;
  }) => void;
}

const CATEGORIES = ['Strategy', 'Delivery', 'Admin', 'Meeting', 'QBR'];

export function LiveTimer({ clients, onTimerStop }: LiveTimerProps) {
  const {
    isRunning,
    elapsed,
    clientId,
    description,
    category,
    billable,
    start,
    stop,
    tick,
    setClientId,
    setDescription,
    setCategory,
    setBillable,
  } = useTimerStore();

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isRunning, tick]);

  const handleToggle = () => {
    if (isRunning) {
      const result = stop();
      onTimerStop({
        clientId,
        description,
        hours: result.hours,
        category,
        billable,
      });
    } else {
      start();
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex flex-col items-center gap-6 md:flex-row">
        {/* Timer display */}
        <div className="flex flex-col items-center gap-3">
          <div className="font-mono text-5xl font-bold tracking-wider text-foreground tabular-nums">
            {formatElapsed(elapsed)}
          </div>
          <Button
            onClick={handleToggle}
            className={cn(
              'h-12 w-40 text-base font-semibold',
              isRunning
                ? 'animate-pulse bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600'
                : ''
            )}
          >
            {isRunning ? (
              <>
                <Square className="mr-2 h-4 w-4" />
                Stop
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Start
              </>
            )}
          </Button>
        </div>

        {/* Timer inputs */}
        <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

          <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
            <Label>Description</Label>
            <Input
              placeholder="What are you working on?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
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

          <div className="flex items-end gap-2 pb-1">
            <Checkbox checked={billable} onCheckedChange={setBillable} />
            <Label className="cursor-pointer" onClick={() => setBillable(!billable)}>
              Billable
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
}
