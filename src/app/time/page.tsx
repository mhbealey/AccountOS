'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { LiveTimer } from '@/components/time/LiveTimer';
import { TimeEntryForm } from '@/components/time/TimeEntryForm';
import { TimeEntryList, type TimeEntry } from '@/components/time/TimeEntryList';
import { WeeklyGrid } from '@/components/time/WeeklyGrid';
import { MonthlySummary } from '@/components/time/MonthlySummary';
import { TimeCharts } from '@/components/time/TimeCharts';
import { toast } from '@/components/layout/Toast';

interface Client {
  id: string;
  name: string;
}

export default function TimeTrackingPage() {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [prefill, setPrefill] = useState<{
    clientId?: string;
    description?: string;
    hours?: number;
    category?: string;
    billable?: boolean;
  } | undefined>(undefined);

  const fetchEntries = useCallback(async () => {
    try {
      const res = await fetch('/api/time-entries');
      if (res.ok) {
        const data = await res.json();
        setEntries(data);
      }
    } catch {
      toast({ type: 'error', title: 'Failed to load time entries' });
    }
  }, []);

  const fetchClients = useCallback(async () => {
    try {
      const res = await fetch('/api/clients');
      if (res.ok) {
        const data = await res.json();
        setClients(data.map((c: { id: string; name: string }) => ({ id: c.id, name: c.name })));
      }
    } catch {
      // silently fail, clients are not critical
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchEntries(), fetchClients()]).finally(() => setLoading(false));
  }, [fetchEntries, fetchClients]);

  const handleTimerStop = (data: {
    clientId: string;
    description: string;
    hours: number;
    category: string;
    billable: boolean;
  }) => {
    setPrefill({
      clientId: data.clientId,
      description: data.description,
      hours: data.hours,
      category: data.category,
      billable: data.billable,
    });
  };

  const handleSubmit = async (data: {
    clientId: string;
    description: string;
    hours: number;
    rate: number;
    date: string;
    category: string;
    billable: boolean;
  }) => {
    const res = await fetch('/api/time-entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: data.clientId || null,
        description: data.description,
        hours: data.hours,
        rate: data.rate,
        date: data.date,
        category: data.category,
        billable: data.billable,
      }),
    });

    if (!res.ok) {
      throw new Error('Failed to create time entry');
    }

    setPrefill(undefined);
    await fetchEntries();
  };

  const handleEdit = (entry: TimeEntry) => {
    setPrefill({
      clientId: entry.clientId || '',
      description: entry.description,
      hours: entry.hours,
      category: entry.category || 'Delivery',
      billable: entry.billable,
    });
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/time-entries/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Delete failed');
    await fetchEntries();
  };

  const existingHoursForDate = useCallback(
    (date: string): number => {
      return entries
        .filter((e) => e.date.startsWith(date))
        .reduce((sum, e) => sum + e.hours, 0);
    },
    [entries]
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-40 animate-pulse rounded-xl bg-card" />
        <div className="h-32 animate-pulse rounded-xl bg-card" />
        <div className="h-64 animate-pulse rounded-xl bg-card" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Live Timer */}
      <LiveTimer clients={clients} onTimerStop={handleTimerStop} />

      {/* Manual Entry Form */}
      <TimeEntryForm
        clients={clients}
        prefill={prefill}
        onSubmit={handleSubmit}
        existingHoursForDate={existingHoursForDate}
      />

      {/* Tabbed views */}
      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">Entries</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <TimeEntryList
            entries={entries}
            clients={clients}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </TabsContent>

        <TabsContent value="weekly">
          <WeeklyGrid entries={entries} />
        </TabsContent>

        <TabsContent value="monthly">
          <MonthlySummary entries={entries} />
        </TabsContent>

        <TabsContent value="charts">
          <TimeCharts entries={entries} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
