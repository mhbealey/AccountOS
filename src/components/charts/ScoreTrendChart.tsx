'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const AreaChart = dynamic(
  () => import('recharts').then((mod) => mod.AreaChart),
  { ssr: false }
);
const Area = dynamic(
  () => import('recharts').then((mod) => mod.Area),
  { ssr: false }
);
const XAxis = dynamic(
  () => import('recharts').then((mod) => mod.XAxis),
  { ssr: false }
);
const YAxis = dynamic(
  () => import('recharts').then((mod) => mod.YAxis),
  { ssr: false }
);
const Tooltip = dynamic(
  () => import('recharts').then((mod) => mod.Tooltip),
  { ssr: false }
);
const ResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => mod.ResponsiveContainer),
  { ssr: false, loading: () => (
    <div className="flex items-center justify-center" style={{ height: 300 }}>
      <Loader2 className="h-6 w-6 animate-spin text-[#00D4AA]" />
    </div>
  )}
);

interface ScoreTrendChartProps {
  data: Array<{ label: string; value: number }>;
  height?: number;
}

export default function ScoreTrendChart({ data, height = 300 }: ScoreTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center text-[#829AB1] text-sm" style={{ height }}>
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="tealGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00D4AA" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#00D4AA" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="label"
          stroke="#829AB1"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#829AB1"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#0B1B2E',
            border: '1px solid #1A3550',
            borderRadius: '8px',
            color: '#F0F4F8',
            fontSize: 12,
          }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="#00D4AA"
          strokeWidth={2}
          fill="url(#tealGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
