'use client';

import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ReportCard } from './ReportCard';
import { ExportButton } from './ExportButton';
import { formatCurrency } from '@/lib/utils';
import { DollarSign, Clock, AlertTriangle } from 'lucide-react';

interface WeeklyForecast {
  week: string;
  inflows: number;
  outflows: number;
  balance: number;
}

interface AgingBucket {
  bucket: string;
  amount: number;
  count: number;
}

interface ClientPayment {
  clientId: string;
  clientName: string;
  avgDaysToPayment: number;
  onTimePercentage: number;
  outstanding: number;
}

interface CashFlowData {
  forecast: WeeklyForecast[];
  agingBuckets: AgingBucket[];
  avgDaysToPayment: number;
  clientPayments: ClientPayment[];
  totalOutstanding: number;
}

const AGING_COLORS: Record<string, string> = {
  Current: '#22c55e',
  '1-30': '#3b82f6',
  '31-60': '#eab308',
  '61-90': '#f97316',
  '90+': '#ef4444',
};

export function CashFlowReport() {
  const [data, setData] = useState<CashFlowData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/reports/cashflow');
        if (!res.ok) throw new Error('Failed to fetch');
        const json = await res.json();
        setData(json.data ?? json);
      } catch {
        setData({
          forecast: [],
          agingBuckets: [],
          avgDaysToPayment: 0,
          clientPayments: [],
          totalOutstanding: 0,
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl bg-[#1e1e3a]" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-xl bg-[#1e1e3a]" />
      </div>
    );
  }

  if (!data) return null;

  const exportData = data.forecast.map((w) => ({
    week: w.week,
    inflows: w.inflows,
    outflows: w.outflows,
    balance: w.balance,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-400">Cash Flow Analytics</h3>
        <ExportButton data={exportData} filename="cashflow-report" />
      </div>

      {/* Metric cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <ReportCard
          title="Total Outstanding"
          value={formatCurrency(data.totalOutstanding)}
          icon={<DollarSign className="h-4 w-4" />}
        />
        <ReportCard
          title="Avg Days to Payment"
          value={`${data.avgDaysToPayment.toFixed(0)} days`}
          icon={<Clock className="h-4 w-4" />}
          warning={data.avgDaysToPayment > 45 ? 'Above typical terms' : undefined}
        />
        <ReportCard
          title="Overdue Amount"
          value={formatCurrency(
            data.agingBuckets
              .filter((b) => b.bucket !== 'Current')
              .reduce((sum, b) => sum + b.amount, 0)
          )}
          icon={<AlertTriangle className="h-4 w-4" />}
        />
      </div>

      {/* Invoice aging cards */}
      <div className="grid gap-3 md:grid-cols-5">
        {(['Current', '1-30', '31-60', '61-90', '90+'] as const).map((bucket) => {
          const found = data.agingBuckets.find((b) => b.bucket === bucket);
          return (
            <Card key={bucket} className="border-[#1e1e3a] bg-[#12122a] p-4">
              <div className="flex items-center gap-2">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: AGING_COLORS[bucket] }}
                />
                <p className="text-xs font-medium text-slate-400">
                  {bucket === 'Current' ? 'Current' : `${bucket} days`}
                </p>
              </div>
              <p className="mt-2 text-xl font-bold text-white">
                {formatCurrency(found?.amount ?? 0)}
              </p>
              <p className="text-xs text-slate-500">
                {found?.count ?? 0} invoice{(found?.count ?? 0) !== 1 ? 's' : ''}
              </p>
            </Card>
          );
        })}
      </div>

      {/* 13-week forecast chart */}
      <Card className="border-[#1e1e3a] bg-[#12122a]">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-white">13-Week Rolling Cash Flow Forecast</CardTitle>
          <p className="text-xs text-slate-500">Stacked inflows/outflows with running balance</p>
        </CardHeader>
        <CardContent>
          {data.forecast.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-sm text-slate-500">
              No forecast data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={data.forecast} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <defs>
                  <linearGradient id="inflowGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="outflowGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e3a" />
                <XAxis
                  dataKey="week"
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  axisLine={{ stroke: '#1e1e3a' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  axisLine={{ stroke: '#1e1e3a' }}
                  tickLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: '#12122a',
                    border: '1px solid #1e1e3a',
                    borderRadius: 8,
                  }}
                  labelStyle={{ color: '#94a3b8' }}
                  formatter={(value: unknown, name: unknown) => [
                    formatCurrency(value as number),
                    name === 'inflows' ? 'Inflows' : name === 'outflows' ? 'Outflows' : 'Balance',
                  ]}
                />
                <Legend
                  wrapperStyle={{ fontSize: 12 }}
                  formatter={(value: string) => (
                    <span className="text-slate-400">
                      {value === 'inflows' ? 'Inflows' : value === 'outflows' ? 'Outflows' : 'Balance'}
                    </span>
                  )}
                />
                <Area
                  type="monotone"
                  dataKey="inflows"
                  stackId="1"
                  stroke="#22c55e"
                  fill="url(#inflowGradient)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="outflows"
                  stackId="2"
                  stroke="#ef4444"
                  fill="url(#outflowGradient)"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#6366f1', strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Client payment analysis */}
      <Card className="border-[#1e1e3a] bg-[#12122a]">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-white">Per-Client Payment Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          {data.clientPayments.length === 0 ? (
            <p className="text-sm text-slate-500">No payment data available</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1e1e3a]">
                    <th className="pb-2 text-left font-medium text-slate-400">Client</th>
                    <th className="pb-2 text-right font-medium text-slate-400">Avg Days to Payment</th>
                    <th className="pb-2 text-right font-medium text-slate-400">On-Time %</th>
                    <th className="pb-2 text-right font-medium text-slate-400">Outstanding</th>
                  </tr>
                </thead>
                <tbody>
                  {data.clientPayments.map((cp) => (
                    <tr key={cp.clientId} className="border-b border-[#1e1e3a]/50">
                      <td className="py-2.5 text-slate-300">{cp.clientName}</td>
                      <td className={`py-2.5 text-right font-medium ${cp.avgDaysToPayment > 45 ? 'text-red-400' : cp.avgDaysToPayment > 30 ? 'text-amber-400' : 'text-white'}`}>
                        {cp.avgDaysToPayment.toFixed(0)}
                      </td>
                      <td className={`py-2.5 text-right font-medium ${cp.onTimePercentage < 70 ? 'text-red-400' : cp.onTimePercentage < 90 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {cp.onTimePercentage.toFixed(0)}%
                      </td>
                      <td className="py-2.5 text-right font-medium text-white">
                        {formatCurrency(cp.outstanding)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
