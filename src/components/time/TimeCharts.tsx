'use client';

import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { startOfWeek, subWeeks, format, parseISO, isWithinInterval, addDays } from 'date-fns';
import type { TimeEntry } from '@/components/time/TimeEntryList';

interface TimeChartsProps {
  entries: TimeEntry[];
}

const CLIENT_COLORS = [
  '#6366f1',
  '#8b5cf6',
  '#a855f7',
  '#3b82f6',
  '#06b6d4',
  '#22c55e',
  '#eab308',
  '#f97316',
  '#ef4444',
  '#ec4899',
];

const PIE_COLORS = ['#6366f1', '#334155'];

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color?: string; payload?: Record<string, unknown> }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-lg border border-[#1e1e3a] bg-[#12122a] px-3 py-2 shadow-xl">
      {label && <p className="mb-1 text-xs font-medium text-slate-400">{label}</p>}
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: entry.color || '#e2e8f0' }}>
          {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}h
        </p>
      ))}
    </div>
  );
}

export function TimeCharts({ entries }: TimeChartsProps) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Hours by client (current month) - bar chart
  const hoursByClient = useMemo(() => {
    const map = new Map<string, { name: string; hours: number }>();

    entries.forEach((entry) => {
      const d = new Date(entry.date);
      if (d.getMonth() !== currentMonth || d.getFullYear() !== currentYear) return;

      const name = entry.client?.name || 'No Client';
      if (!map.has(name)) {
        map.set(name, { name, hours: 0 });
      }
      map.get(name)!.hours += entry.hours;
    });

    return Array.from(map.values()).sort((a, b) => b.hours - a.hours);
  }, [entries, currentMonth, currentYear]);

  // Billable vs non-billable (current month) - pie chart
  const billableData = useMemo(() => {
    let billable = 0;
    let nonBillable = 0;

    entries.forEach((entry) => {
      const d = new Date(entry.date);
      if (d.getMonth() !== currentMonth || d.getFullYear() !== currentYear) return;

      if (entry.billable) {
        billable += entry.hours;
      } else {
        nonBillable += entry.hours;
      }
    });

    return [
      { name: 'Billable', value: billable },
      { name: 'Non-billable', value: nonBillable },
    ];
  }, [entries, currentMonth, currentYear]);

  const totalPieHours = billableData[0].value + billableData[1].value;
  const billablePercent = totalPieHours > 0 ? Math.round((billableData[0].value / totalPieHours) * 100) : 0;

  // Weekly hours trend (last 12 weeks) - line chart
  const weeklyTrend = useMemo(() => {
    const weeks: { week: string; hours: number; start: Date; end: Date }[] = [];

    for (let i = 11; i >= 0; i--) {
      const wStart = startOfWeek(subWeeks(now, i), { weekStartsOn: 1 });
      const wEnd = addDays(wStart, 6);
      weeks.push({
        week: format(wStart, 'MMM d'),
        hours: 0,
        start: wStart,
        end: wEnd,
      });
    }

    entries.forEach((entry) => {
      const entryDate = typeof entry.date === 'string' ? parseISO(entry.date) : entry.date;
      weeks.forEach((w) => {
        if (isWithinInterval(entryDate, { start: w.start, end: w.end })) {
          w.hours += entry.hours;
        }
      });
    });

    return weeks.map(({ week, hours }) => ({ week, hours: Math.round(hours * 10) / 10 }));
  }, [entries, now]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Hours by Client */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Hours by Client</CardTitle>
        </CardHeader>
        <CardContent>
          {hoursByClient.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
              No data this month
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={hoursByClient} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e3a" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  axisLine={{ stroke: '#1e1e3a' }}
                  tickLine={false}
                  interval={0}
                  angle={-30}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={{ stroke: '#1e1e3a' }}
                  tickLine={false}
                  tickFormatter={(v) => `${v}h`}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                  {hoursByClient.map((_, i) => (
                    <Cell key={i} fill={CLIENT_COLORS[i % CLIENT_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Billable vs Non-billable */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Billable Ratio</CardTitle>
        </CardHeader>
        <CardContent>
          {totalPieHours === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
              No data this month
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={billableData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {billableData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 text-center">
                <div className="text-2xl font-bold text-foreground">{billablePercent}%</div>
                <div className="text-xs text-muted-foreground">Billable</div>
              </div>
              <div className="mt-3 flex gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#6366f1]" />
                  <span className="text-muted-foreground">
                    Billable ({billableData[0].value.toFixed(1)}h)
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#334155]" />
                  <span className="text-muted-foreground">
                    Non-billable ({billableData[1].value.toFixed(1)}h)
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly Hours Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Weekly Trend (12 weeks)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weeklyTrend} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e3a" />
              <XAxis
                dataKey="week"
                tick={{ fill: '#64748b', fontSize: 10 }}
                axisLine={{ stroke: '#1e1e3a' }}
                tickLine={false}
                interval={2}
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={{ stroke: '#1e1e3a' }}
                tickLine={false}
                tickFormatter={(v) => `${v}h`}
              />
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone"
                dataKey="hours"
                name="Hours"
                stroke="#6366f1"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#6366f1', strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
