'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ReportCard } from './ReportCard';
import { ExportButton } from './ExportButton';
import { formatCurrency } from '@/lib/utils';
import { Target, Clock, TrendingUp, Zap } from 'lucide-react';

interface FunnelStage {
  stage: string;
  count: number;
  value: number;
  weightedValue: number;
}

interface ConversionRate {
  from: string;
  to: string;
  rate: number;
}

interface WinLossReason {
  reason: string;
  count: number;
  type: 'win' | 'loss';
}

interface StageVelocity {
  stage: string;
  avgDays: number;
}

interface PipelineData {
  funnel: FunnelStage[];
  weightedPipelineValue: number;
  avgDealSize: number;
  avgCycleTime: number;
  winRateCount: number;
  winRateValue: number;
  conversionRates: ConversionRate[];
  winLossReasons: WinLossReason[];
  stageVelocity: StageVelocity[];
}

const FUNNEL_COLORS = ['#6366f1', '#818cf8', '#a78bfa', '#c4b5fd', '#8b5cf6'];

export function PipelineReport() {
  const [data, setData] = useState<PipelineData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/reports/pipeline');
        if (!res.ok) throw new Error('Failed to fetch');
        const json = await res.json();
        setData(json.data ?? json);
      } catch {
        setData({
          funnel: [],
          weightedPipelineValue: 0,
          avgDealSize: 0,
          avgCycleTime: 0,
          winRateCount: 0,
          winRateValue: 0,
          conversionRates: [],
          winLossReasons: [],
          stageVelocity: [],
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
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl bg-[#1e1e3a]" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-xl bg-[#1e1e3a]" />
      </div>
    );
  }

  if (!data) return null;

  const exportData = data.funnel.map((s) => ({
    stage: s.stage,
    count: s.count,
    value: s.value,
    weighted_value: s.weightedValue,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-400">Pipeline Analytics</h3>
        <ExportButton data={exportData} filename="pipeline-report" />
      </div>

      {/* Metric cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ReportCard
          title="Weighted Pipeline"
          value={formatCurrency(data.weightedPipelineValue)}
          subtitle="Probability-adjusted total"
          icon={<Target className="h-4 w-4" />}
        />
        <ReportCard
          title="Avg Deal Size"
          value={formatCurrency(data.avgDealSize)}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <ReportCard
          title="Avg Cycle Time"
          value={`${data.avgCycleTime} days`}
          subtitle="Lead to Close"
          icon={<Clock className="h-4 w-4" />}
        />
        <ReportCard
          title="Pipeline Velocity"
          value={`${data.stageVelocity.length > 0 ? (data.stageVelocity.reduce((s, v) => s + v.avgDays, 0) / data.stageVelocity.length).toFixed(1) : 0} avg days/stage`}
          icon={<Zap className="h-4 w-4" />}
        />
      </div>

      {/* Win rates side by side */}
      <div className="grid gap-4 md:grid-cols-2">
        <ReportCard
          title="Win Rate (Count)"
          value={`${data.winRateCount.toFixed(1)}%`}
          subtitle="Based on number of deals"
        />
        <ReportCard
          title="Win Rate (Value)"
          value={`${data.winRateValue.toFixed(1)}%`}
          subtitle="Based on deal value"
        />
      </div>

      {/* Funnel chart */}
      <Card className="border-[#1e1e3a] bg-[#12122a]">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-white">Pipeline Funnel</CardTitle>
          <p className="text-xs text-slate-500">Deal count and value at each stage</p>
        </CardHeader>
        <CardContent>
          {data.funnel.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-sm text-slate-500">
              No pipeline data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={data.funnel}
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
                  dataKey="stage"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  axisLine={{ stroke: '#1e1e3a' }}
                  tickLine={false}
                  width={90}
                />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: '#12122a',
                    border: '1px solid #1e1e3a',
                    borderRadius: 8,
                  }}
                  formatter={(value: unknown, name: unknown) => [
                    name === 'value' ? formatCurrency(value as number) : (value as number),
                    name === 'value' ? 'Total Value' : 'Deals',
                  ]}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                  {data.funnel.map((_, idx) => (
                    <Cell key={idx} fill={FUNNEL_COLORS[idx % FUNNEL_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Conversion rates + velocity tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-[#1e1e3a] bg-[#12122a]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-white">Stage Conversion Rates</CardTitle>
          </CardHeader>
          <CardContent>
            {data.conversionRates.length === 0 ? (
              <p className="text-sm text-slate-500">No conversion data available</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#1e1e3a]">
                      <th className="pb-2 text-left font-medium text-slate-400">From</th>
                      <th className="pb-2 text-left font-medium text-slate-400">To</th>
                      <th className="pb-2 text-right font-medium text-slate-400">Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.conversionRates.map((cr, idx) => (
                      <tr key={idx} className="border-b border-[#1e1e3a]/50">
                        <td className="py-2 text-slate-300">{cr.from}</td>
                        <td className="py-2 text-slate-300">{cr.to}</td>
                        <td className="py-2 text-right font-medium text-white">
                          {cr.rate.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-[#1e1e3a] bg-[#12122a]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-white">Pipeline Velocity</CardTitle>
            <p className="text-xs text-slate-500">Average days per stage</p>
          </CardHeader>
          <CardContent>
            {data.stageVelocity.length === 0 ? (
              <p className="text-sm text-slate-500">No velocity data available</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#1e1e3a]">
                      <th className="pb-2 text-left font-medium text-slate-400">Stage</th>
                      <th className="pb-2 text-right font-medium text-slate-400">Avg Days</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.stageVelocity.map((sv, idx) => (
                      <tr key={idx} className="border-b border-[#1e1e3a]/50">
                        <td className="py-2 text-slate-300">{sv.stage}</td>
                        <td className="py-2 text-right font-medium text-white">
                          {sv.avgDays.toFixed(1)}
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

      {/* Win/loss reasons */}
      {data.winLossReasons.length > 0 && (
        <Card className="border-[#1e1e3a] bg-[#12122a]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-white">Win/Loss Reasons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="mb-2 text-sm font-medium text-emerald-400">Win Reasons</h4>
                {data.winLossReasons
                  .filter((r) => r.type === 'win')
                  .map((r, idx) => (
                    <div key={idx} className="flex items-center justify-between border-b border-[#1e1e3a]/50 py-1.5">
                      <span className="text-sm text-slate-300">{r.reason}</span>
                      <span className="text-sm font-medium text-white">{r.count}</span>
                    </div>
                  ))}
                {data.winLossReasons.filter((r) => r.type === 'win').length === 0 && (
                  <p className="text-xs text-slate-500">No win reasons recorded</p>
                )}
              </div>
              <div>
                <h4 className="mb-2 text-sm font-medium text-red-400">Loss Reasons</h4>
                {data.winLossReasons
                  .filter((r) => r.type === 'loss')
                  .map((r, idx) => (
                    <div key={idx} className="flex items-center justify-between border-b border-[#1e1e3a]/50 py-1.5">
                      <span className="text-sm text-slate-300">{r.reason}</span>
                      <span className="text-sm font-medium text-white">{r.count}</span>
                    </div>
                  ))}
                {data.winLossReasons.filter((r) => r.type === 'loss').length === 0 && (
                  <p className="text-xs text-slate-500">No loss reasons recorded</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
