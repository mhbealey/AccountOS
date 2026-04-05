'use client';

import React, { useMemo } from 'react';
import { startOfWeek, addDays, format, isSameDay, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import type { TimeEntry } from '@/components/time/TimeEntryList';

interface WeeklyGridProps {
  entries: TimeEntry[];
  weekStart?: Date;
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getIntensityClass(hours: number): string {
  if (hours === 0) return 'bg-secondary';
  if (hours <= 1) return 'bg-indigo-500/20 text-indigo-300';
  if (hours <= 3) return 'bg-indigo-500/40 text-indigo-200';
  if (hours <= 5) return 'bg-indigo-500/60 text-indigo-100';
  if (hours <= 8) return 'bg-indigo-500/80 text-white';
  return 'bg-indigo-500 text-white';
}

export function WeeklyGrid({ entries, weekStart }: WeeklyGridProps) {
  const mondayOfWeek = useMemo(() => {
    return weekStart || startOfWeek(new Date(), { weekStartsOn: 1 });
  }, [weekStart]);

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(mondayOfWeek, i));
  }, [mondayOfWeek]);

  const clientMap = useMemo(() => {
    const map = new Map<string, { name: string; hours: number[] }>();

    entries.forEach((entry) => {
      const clientKey = entry.client?.id || '_none';
      const clientName = entry.client?.name || 'No Client';

      if (!map.has(clientKey)) {
        map.set(clientKey, { name: clientName, hours: new Array(7).fill(0) });
      }

      const entryDate = typeof entry.date === 'string' ? parseISO(entry.date) : entry.date;
      const dayIndex = days.findIndex((d) => isSameDay(d, entryDate));
      if (dayIndex >= 0) {
        map.get(clientKey)!.hours[dayIndex] += entry.hours;
      }
    });

    return map;
  }, [entries, days]);

  const dayTotals = useMemo(() => {
    const totals = new Array(7).fill(0);
    clientMap.forEach(({ hours }) => {
      hours.forEach((h, i) => {
        totals[i] += h;
      });
    });
    return totals;
  }, [clientMap]);

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border p-4">
        <h3 className="text-base font-semibold text-foreground">
          Weekly View{' '}
          <span className="text-sm font-normal text-muted-foreground">
            {format(days[0], 'MMM d')} - {format(days[6], 'MMM d, yyyy')}
          </span>
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-xs font-medium text-muted-foreground">
              <th className="px-4 py-3 text-left">Client</th>
              {DAY_LABELS.map((label, i) => (
                <th key={label} className="px-3 py-3 text-center">
                  <div>{label}</div>
                  <div className="mt-0.5 text-[10px] text-muted-foreground/60">
                    {format(days[i], 'M/d')}
                  </div>
                </th>
              ))}
              <th className="px-4 py-3 text-center font-semibold text-foreground">Total</th>
            </tr>
          </thead>
          <tbody>
            {clientMap.size === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No entries for this week
                </td>
              </tr>
            ) : (
              Array.from(clientMap.entries()).map(([key, { name, hours }]) => {
                const total = hours.reduce((a, b) => a + b, 0);
                return (
                  <tr key={key} className="border-b border-border/50">
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-foreground">
                      {name}
                    </td>
                    {hours.map((h, i) => (
                      <td key={i} className="px-3 py-3 text-center">
                        <div
                          className={cn(
                            'mx-auto flex h-8 w-12 items-center justify-center rounded-md text-xs font-mono font-medium transition-colors',
                            getIntensityClass(h)
                          )}
                        >
                          {h > 0 ? h.toFixed(1) : ''}
                        </div>
                      </td>
                    ))}
                    <td className="px-4 py-3 text-center font-mono font-semibold text-foreground">
                      {total.toFixed(1)}
                    </td>
                  </tr>
                );
              })
            )}
            {/* Totals row */}
            {clientMap.size > 0 && (
              <tr className="bg-secondary/30">
                <td className="px-4 py-3 font-semibold text-foreground">Total</td>
                {dayTotals.map((t, i) => (
                  <td key={i} className="px-3 py-3 text-center font-mono font-semibold text-foreground">
                    {t > 0 ? t.toFixed(1) : ''}
                  </td>
                ))}
                <td className="px-4 py-3 text-center font-mono font-bold text-primary">
                  {dayTotals.reduce((a, b) => a + b, 0).toFixed(1)}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
