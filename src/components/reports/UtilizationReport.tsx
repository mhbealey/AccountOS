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
  ReferenceLine,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ReportCard } from './ReportCard';
import { ExportButton } from './ExportButton';
import { formatCurrency } from '@/lib/utils';
import { Clock, Target, TrendingUp } from 'lucide-react';

interface WeeklyHours {
  week: string;
  totalHours: number;
  billableHours: number;
  nonBillableHours: number;
}

interface CategoryBreakdown {
  category: string;
  hours: number;
}

interface RevenuePerHour {
  week: string;
  revenuePerHour: number;
}

interface UtilizationData {
  weeklyHours: WeeklyHours[];
  utilizationRate: number;
  targetUtilization: number;
  categoryBreakdown: CategoryBreakdown[];
  revenuePerHourTrend: RevenuePerHour[];
  totalBillableHours: number;
  totalNonBillableHours: number;
}

const CATEGORY_COLORS = ['#6366f1', '#22c55e', '#eab308', '#f97316', '#8b5cf6', '#ec4899'];

export function UtilizationReport() {
  const [data, setData] = useState<UtilizationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/reports/utilization');
        if (!res.ok) throw new Error('Failed to fetch');
        const json = await res.json();
        setData(json.data ?? json);
      } catch {
        setData({
          weeklyHours: [],
          utilizationRate: 0,
          targetUtilization: 80,
          categoryBreakdown: [],
          revenuePerHourTrend: [],
          totalBillableHours: 0,
          totalNonBillableHours: 0,
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

  const exportData = data.weeklyHours.map((w) => ({
    week: w.week,
    total_hours: w.totalHours,
    billable_hours: w.billableHours,
    non_billable_hours: w.nonBillableHours,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-400">Utilization Analytics</h3>
        <ExportButton data={exportData} filename="utilization-report" />
      </div>

      {/* Metric cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <ReportCard
          title="Utilization Rate"
          value={`${data.utilizationRate.toFixed(1)}%`}
          subtitle={`Target: ${data.targetUtilization}%`}
          icon={<Target className="h-4 w-4" />}
          warning={
            data.utilizationRate < data.targetUtilization
              ? `${(data.targetUtilization - data.utilizationRate).toFixed(1)}% below target`
              : undefined
          }
        />
        <ReportCard
          title="Total Billable Hours"
          value={data.totalBillableHours.toFixed(1)}
          subtitle="Last 12 weeks"
          icon={<Clock className="h-4 w-4" />}
        />
        <ReportCard
          title="Avg Revenue/Hour"
          value={
            data.revenuePerHourTrend.length > 0
              ? formatCurrency(
                  data.revenuePerHourTrend.reduce((s, r) => s + r.revenuePerHour, 0) /
                    data.revenuePerHourTrend.length
                )
              : '$0'
          }
          subtitle="Average across period"
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </div>

      {/* Weekly hours trend */}
      <Card className="border-[#1e1e3a] bg-[#12122a]">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-white">Weekly Hours Trend</CardTitle>
          <p className="text-xs text-slate-500">Last 12 weeks</p>
        </CardHeader>
        <CardContent>
          {data.weeklyHours.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-sm text-slate-500">
              No time data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.weeklyHours} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
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
                />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: '#12122a',
                    border: '1px solid #1e1e3a',
                    borderRadius: 8,
                  }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 12 }}
                  formatter={(value: string) => (
                    <span className="text-slate-400">{value === 'totalHours' ? 'Total' : value}</span>
                  )}
                />
                <Line
                  type="monotone"
                  dataKey="totalHours"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#6366f1', strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                  name="Total Hours"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Billable vs non-billable + category breakdown */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-[#1e1e3a] bg-[#12122a]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-white">Billable vs Non-Billable</CardTitle>
          </CardHeader>
          <CardContent>
            {data.weeklyHours.length === 0 ? (
              <div className="flex h-64 items-center justify-center text-sm text-slate-500">
                No data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.weeklyHours} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
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
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#12122a',
                      border: '1px solid #1e1e3a',
                      borderRadius: 8,
                    }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 12 }}
                    formatter={(value: string) => <span className="text-slate-400">{value}</span>}
                  />
                  <Bar dataKey="billableHours" stackId="a" fill="#6366f1" name="Billable" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="nonBillableHours" stackId="a" fill="#334155" name="Non-Billable" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-[#1e1e3a] bg-[#12122a]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-white">Hours by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {data.categoryBreakdown.length === 0 ? (
              <div className="flex h-64 items-center justify-center text-sm text-slate-500">
                No category data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={data.categoryBreakdown}
                    dataKey="hours"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={55}
                    strokeWidth={0}
                    label={({ category, hours }) => `${category}: ${hours.toFixed(1)}h`}
                    labelLine={{ stroke: '#475569' }}
                  >
                    {data.categoryBreakdown.map((_, idx) => (
                      <Cell key={idx} fill={CATEGORY_COLORS[idx % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#12122a',
                      border: '1px solid #1e1e3a',
                      borderRadius: 8,
                    }}
                    itemStyle={{ color: '#94a3b8' }}
                    formatter={(value: number) => [`${value.toFixed(1)} hours`, 'Hours']}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Utilization rate with goal line + revenue per hour */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-[#1e1e3a] bg-[#12122a]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-white">Utilization Rate vs Target</CardTitle>
          </CardHeader>
          <CardContent>
            {data.weeklyHours.length === 0 ? (
              <div className="flex h-64 items-center justify-center text-sm text-slate-500">
                No data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart
                  data={data.weeklyHours.map((w) => ({
                    week: w.week,
                    utilization: w.totalHours > 0 ? (w.billableHours / w.totalHours) * 100 : 0,
                  }))}
                  margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                >
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
                    domain={[0, 100]}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#12122a',
                      border: '1px solid #1e1e3a',
                      borderRadius: 8,
                    }}
                    labelStyle={{ color: '#94a3b8' }}
                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'Utilization']}
                  />
                  <ReferenceLine
                    y={data.targetUtilization}
                    stroke="#22c55e"
                    strokeDasharray="6 4"
                    label={{
                      value: `Target ${data.targetUtilization}%`,
                      fill: '#22c55e',
                      fontSize: 11,
                      position: 'insideTopRight',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="utilization"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#6366f1', strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-[#1e1e3a] bg-[#12122a]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-white">Revenue Per Hour Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {data.revenuePerHourTrend.length === 0 ? (
              <div className="flex h-64 items-center justify-center text-sm text-slate-500">
                No revenue data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={data.revenuePerHourTrend} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
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
                    tickFormatter={(v) => `$${v}`}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#12122a',
                      border: '1px solid #1e1e3a',
                      borderRadius: 8,
                    }}
                    labelStyle={{ color: '#94a3b8' }}
                    formatter={(value: number) => [formatCurrency(value), '$/Hour']}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenuePerHour"
                    stroke="#22c55e"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#22c55e', strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: '#22c55e', strokeWidth: 2, stroke: '#fff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
