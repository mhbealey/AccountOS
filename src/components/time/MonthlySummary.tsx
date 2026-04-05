'use client';

import React, { useMemo } from 'react';
import { formatCurrency } from '@/lib/utils';
import type { TimeEntry } from '@/components/time/TimeEntryList';

interface MonthlySummaryProps {
  entries: TimeEntry[];
}

interface ClientSummary {
  clientId: string;
  clientName: string;
  totalHours: number;
  totalRevenue: number;
  effectiveRate: number;
}

export function MonthlySummary({ entries }: MonthlySummaryProps) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthEntries = useMemo(() => {
    return entries.filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
  }, [entries, currentMonth, currentYear]);

  const summaries = useMemo(() => {
    const map = new Map<string, ClientSummary>();

    monthEntries.forEach((entry) => {
      const key = entry.client?.id || '_none';
      const name = entry.client?.name || 'No Client';

      if (!map.has(key)) {
        map.set(key, {
          clientId: key,
          clientName: name,
          totalHours: 0,
          totalRevenue: 0,
          effectiveRate: 0,
        });
      }

      const s = map.get(key)!;
      s.totalHours += entry.hours;
      s.totalRevenue += entry.hours * entry.rate;
    });

    const result = Array.from(map.values());
    result.forEach((s) => {
      s.effectiveRate = s.totalHours > 0 ? s.totalRevenue / s.totalHours : 0;
    });

    return result.sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [monthEntries]);

  const grandTotalHours = summaries.reduce((a, b) => a + b.totalHours, 0);
  const grandTotalRevenue = summaries.reduce((a, b) => a + b.totalRevenue, 0);
  const grandEffectiveRate = grandTotalHours > 0 ? grandTotalRevenue / grandTotalHours : 0;

  const monthLabel = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border p-4">
        <h3 className="text-base font-semibold text-foreground">
          Monthly Summary{' '}
          <span className="text-sm font-normal text-muted-foreground">{monthLabel}</span>
        </h3>
      </div>

      {summaries.length === 0 ? (
        <div className="px-4 py-8 text-center text-sm text-muted-foreground">
          No entries this month
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3 text-right">Hours</th>
                <th className="px-4 py-3 text-right">Revenue</th>
                <th className="px-4 py-3 text-right">Effective Rate</th>
              </tr>
            </thead>
            <tbody>
              {summaries.map((s) => (
                <tr key={s.clientId} className="border-b border-border/50">
                  <td className="px-4 py-3 font-medium text-foreground">{s.clientName}</td>
                  <td className="px-4 py-3 text-right font-mono text-foreground">
                    {s.totalHours.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-foreground">
                    {formatCurrency(s.totalRevenue)}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {formatCurrency(s.effectiveRate)}/hr
                  </td>
                </tr>
              ))}
              <tr className="bg-secondary/30">
                <td className="px-4 py-3 font-semibold text-foreground">Grand Total</td>
                <td className="px-4 py-3 text-right font-mono font-semibold text-foreground">
                  {grandTotalHours.toFixed(1)}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-primary">
                  {formatCurrency(grandTotalRevenue)}
                </td>
                <td className="px-4 py-3 text-right text-muted-foreground">
                  {formatCurrency(grandEffectiveRate)}/hr
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
