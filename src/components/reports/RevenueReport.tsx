'use client';

import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { ReportCard } from './ReportCard';
import { ExportButton } from './ExportButton';
import { formatCurrency } from '@/lib/utils';
import { DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';

interface MonthlyRevenue {
  month: string;
  revenue: number;
  target: number;
}

interface ClientRevenue {
  clientId: string;
  clientName: string;
  revenue: number;
  percentage: number;
}

interface RevenueData {
  monthly: MonthlyRevenue[];
  byClient: ClientRevenue[];
  avgEffectiveRate: number;
  ytdTotal: number;
  annualGoal: number;
}

const PIE_COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#818cf8', '#4f46e5', '#7c3aed', '#6d28d9'];

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; color: string }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border border-[#1e1e3a] bg-[#12122a] px-3 py-2 shadow-xl">
      <p className="mb-1 text-xs font-medium text-slate-400">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="text-sm font-semibold" style={{ color: entry.color }}>
          {entry.dataKey === 'revenue' ? 'Actual' : 'Target'}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
}

function ClientBarTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: ClientRevenue }>;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-[#1e1e3a] bg-[#12122a] px-3 py-2 shadow-xl">
      <p className="mb-1 text-xs font-medium text-slate-400">{d.clientName}</p>
      <p className="text-sm font-semibold text-indigo-400">{formatCurrency(d.revenue)}</p>
      <p className="text-xs text-slate-500">{d.percentage.toFixed(1)}% of total</p>
    </div>
  );
}

export function RevenueReport() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/reports/revenue');
        if (!res.ok) throw new Error('Failed to fetch');
        const json = await res.json();
        setData(json.data ?? json);
      } catch {
        // Use empty fallback
        setData({
          monthly: [],
          byClient: [],
          avgEffectiveRate: 0,
          ytdTotal: 0,
          annualGoal: 0,
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

  const ytdPct = data.annualGoal > 0 ? Math.round((data.ytdTotal / data.annualGoal) * 100) : 0;
  const concentrationWarnings = data.byClient.filter((c) => c.percentage > 30);
  const exportData = data.monthly.map((m) => ({
    month: m.month,
    actual_revenue: m.revenue,
    target_revenue: m.target,
  }));

  return (
    <div className="space-y-6">
      {/* Metric cards */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-400">Revenue Overview</h3>
        <ExportButton data={exportData} filename="revenue-report" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <ReportCard
          title="Avg Effective Rate"
          value={formatCurrency(data.avgEffectiveRate)}
          subtitle="Per billable hour"
          icon={<DollarSign className="h-4 w-4" />}
        />
        <ReportCard
          title="YTD Revenue"
          value={formatCurrency(data.ytdTotal)}
          subtitle={`${ytdPct}% of annual goal`}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <Card className="border-[#1e1e3a] bg-[#12122a] p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            YTD vs Annual Goal
          </p>
          <div className="mt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">{formatCurrency(data.ytdTotal)}</span>
              <span className="text-slate-500">{formatCurrency(data.annualGoal)}</span>
            </div>
            <Progress value={ytdPct} max={100} />
            <p className="text-xs text-slate-500">{ytdPct}% complete</p>
          </div>
        </Card>
      </div>

      {/* Monthly revenue line chart */}
      <Card className="border-[#1e1e3a] bg-[#12122a]">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-white">Monthly Revenue Trend</CardTitle>
          <p className="text-xs text-slate-500">Last 12 months &mdash; actual vs target</p>
        </CardHeader>
        <CardContent>
          {data.monthly.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-sm text-slate-500">
              No revenue data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.monthly} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e3a" />
                <XAxis
                  dataKey="month"
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
                <RechartsTooltip content={<ChartTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 12, color: '#94a3b8' }}
                  formatter={(value: string) => (
                    <span className="text-slate-400">{value === 'revenue' ? 'Actual' : 'Target'}</span>
                  )}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#6366f1', strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="#334155"
                  strokeWidth={1.5}
                  strokeDasharray="6 4"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Revenue by client */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-[#1e1e3a] bg-[#12122a]">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base text-white">
              Revenue by Client
              {concentrationWarnings.length > 0 && (
                <AlertTriangle className="h-4 w-4 text-amber-400" />
              )}
            </CardTitle>
            <p className="text-xs text-slate-500">Spot concentration risk</p>
          </CardHeader>
          <CardContent>
            {data.byClient.length === 0 ? (
              <div className="flex h-64 items-center justify-center text-sm text-slate-500">
                No client data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={data.byClient}
                  layout="vertical"
                  margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1e3a" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    axisLine={{ stroke: '#1e1e3a' }}
                    tickLine={false}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <YAxis
                    type="category"
                    dataKey="clientName"
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    axisLine={{ stroke: '#1e1e3a' }}
                    tickLine={false}
                    width={100}
                  />
                  <RechartsTooltip content={<ClientBarTooltip />} />
                  <Bar dataKey="revenue" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-[#1e1e3a] bg-[#12122a]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-white">Client Revenue Share</CardTitle>
            <p className="text-xs text-slate-500">
              {concentrationWarnings.length > 0 && (
                <span className="text-amber-400">
                  Warning: {concentrationWarnings.map((c) => c.clientName).join(', ')} &gt;30% of total
                </span>
              )}
              {concentrationWarnings.length === 0 && 'Percentage of total revenue'}
            </p>
          </CardHeader>
          <CardContent>
            {data.byClient.length === 0 ? (
              <div className="flex h-64 items-center justify-center text-sm text-slate-500">
                No client data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.byClient}
                    dataKey="percentage"
                    nameKey="clientName"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={60}
                    strokeWidth={0}
                    label={({ clientName, percentage }) =>
                      `${clientName}: ${percentage.toFixed(1)}%`
                    }
                    labelLine={{ stroke: '#475569' }}
                  >
                    {data.byClient.map((_, idx) => (
                      <Cell
                        key={idx}
                        fill={PIE_COLORS[idx % PIE_COLORS.length]}
                        opacity={
                          data.byClient[idx]?.percentage > 30 ? 1 : 0.75
                        }
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#12122a',
                      border: '1px solid #1e1e3a',
                      borderRadius: 8,
                    }}
                    itemStyle={{ color: '#94a3b8' }}
                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'Share']}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
