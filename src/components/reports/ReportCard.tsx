'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ReportCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
  warning?: string;
  className?: string;
  children?: React.ReactNode;
}

export function ReportCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendLabel,
  warning,
  className,
  children,
}: ReportCardProps) {
  return (
    <Card
      className={cn(
        'relative overflow-hidden border-[#1e1e3a] bg-[#12122a] p-5',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
          {title}
        </p>
        {icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
            {icon}
          </div>
        )}
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight text-white">{value}</p>
      {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
      {trend && trendLabel && (
        <div
          className={cn(
            'mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
            trend === 'up'
              ? 'bg-emerald-500/10 text-emerald-400'
              : trend === 'down'
                ? 'bg-red-500/10 text-red-400'
                : 'bg-slate-500/10 text-slate-400'
          )}
        >
          {trendLabel}
        </div>
      )}
      {warning && (
        <p className="mt-2 text-xs font-medium text-amber-400">{warning}</p>
      )}
      {children}
    </Card>
  );
}
