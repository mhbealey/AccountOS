'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
  className?: string;
}

export function MetricCard({
  icon,
  label,
  value,
  trend,
  trendLabel,
  className,
}: MetricCardProps) {
  return (
    <Card
      className={cn(
        'relative overflow-hidden border-[#1e1e3a] bg-[#12122a] p-4',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
          {icon}
        </div>
        {trend && trend !== 'neutral' && (
          <div
            className={cn(
              'flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium',
              trend === 'up'
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-red-500/10 text-red-400'
            )}
          >
            {trend === 'up' ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {trendLabel && <span>{trendLabel}</span>}
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold tracking-tight text-white">{value}</p>
        <p className="mt-0.5 text-xs text-slate-400">{label}</p>
      </div>
    </Card>
  );
}
