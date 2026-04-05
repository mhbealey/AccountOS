'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';

export interface PipelineStage {
  stage: string;
  count: number;
  value: number;
  weightedValue: number;
}

interface PipelineFunnelProps {
  data: PipelineStage[];
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const stage = payload[0];

  return (
    <div className="rounded-lg border border-[#1e1e3a] bg-[#12122a] px-3 py-2 shadow-xl">
      <p className="mb-1 text-xs font-medium text-slate-400">{label}</p>
      <p className="text-sm font-semibold text-indigo-400">
        Deals: {payload.find((p) => p.dataKey === 'count')?.value ?? 0}
      </p>
      <p className="text-sm font-semibold text-emerald-400">
        Value: {formatCurrency(payload.find((p) => p.dataKey === 'value')?.value ?? 0)}
      </p>
    </div>
  );
}

export function PipelineFunnel({ data }: PipelineFunnelProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-500">
        No pipeline data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart
        data={data}
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
        <Tooltip content={<CustomTooltip />} />
        <Bar
          dataKey="value"
          fill="#6366f1"
          radius={[0, 4, 4, 0]}
          barSize={24}
          fillOpacity={0.85}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
