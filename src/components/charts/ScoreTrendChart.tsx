'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-[#1A3550] bg-[#0B1B2E] px-3 py-2 text-sm shadow-lg">
      <p className="text-[#829AB1]">{label}</p>
      <p className="font-semibold text-[#00D4AA]">{payload[0].value}</p>
    </div>
  );
}

export default function ScoreTrendChart({ data }: { data: { month: string; score: number }[] }) {
  if (!data || data.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-[#829AB1]">
        No score data available yet.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="tealGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00D4AA" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#00D4AA" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="month"
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#829AB1', fontSize: 12 }}
        />
        <YAxis
          domain={[0, 100]}
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#829AB1', fontSize: 12 }}
          width={32}
        />
        <Tooltip content={<ChartTooltip />} />
        <Area
          type="monotone"
          dataKey="score"
          stroke="#00D4AA"
          strokeWidth={2}
          fill="url(#tealGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
