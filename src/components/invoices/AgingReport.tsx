'use client';

import React, { useMemo } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { differenceInDays } from 'date-fns';
import { formatCurrency } from '@/lib/utils';

interface Invoice {
  id: string;
  amount: number;
  status: string;
  dueDate: string;
  paidDate: string | null;
}

interface AgingReportProps {
  invoices: Invoice[];
}

interface AgingBucket {
  label: string;
  count: number;
  total: number;
  color: string;
  bgColor: string;
}

export function AgingReport({ invoices }: AgingReportProps) {
  const buckets = useMemo((): AgingBucket[] => {
    const now = new Date();

    const current = { label: 'Current', count: 0, total: 0, color: 'text-[#22c55e]', bgColor: 'bg-[rgba(34,197,94,0.1)]' };
    const overdue1_30 = { label: '1-30 days', count: 0, total: 0, color: 'text-[#eab308]', bgColor: 'bg-[rgba(234,179,8,0.1)]' };
    const overdue31_60 = { label: '31-60 days', count: 0, total: 0, color: 'text-[#f97316]', bgColor: 'bg-[rgba(249,115,22,0.1)]' };
    const overdue61_90 = { label: '61-90 days', count: 0, total: 0, color: 'text-[#ef4444]', bgColor: 'bg-[rgba(239,68,68,0.1)]' };
    const overdue90plus = { label: '90+ days', count: 0, total: 0, color: 'text-[#dc2626]', bgColor: 'bg-[rgba(220,38,38,0.1)]' };

    invoices
      .filter((inv) => inv.status === 'Sent' || inv.status === 'Overdue' || inv.status === 'Viewed')
      .forEach((inv) => {
        const due = new Date(inv.dueDate);
        const daysOverdue = differenceInDays(now, due);

        if (daysOverdue <= 0) {
          current.count++;
          current.total += inv.amount;
        } else if (daysOverdue <= 30) {
          overdue1_30.count++;
          overdue1_30.total += inv.amount;
        } else if (daysOverdue <= 60) {
          overdue31_60.count++;
          overdue31_60.total += inv.amount;
        } else if (daysOverdue <= 90) {
          overdue61_90.count++;
          overdue61_90.total += inv.amount;
        } else {
          overdue90plus.count++;
          overdue90plus.total += inv.amount;
        }
      });

    return [current, overdue1_30, overdue31_60, overdue61_90, overdue90plus];
  }, [invoices]);

  const totalOutstanding = buckets.reduce((sum, b) => sum + b.total, 0);

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground">Aging Report</h3>
        <div className="text-sm text-muted-foreground">
          Total Outstanding: <span className="font-semibold text-foreground">{formatCurrency(totalOutstanding)}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {buckets.map((bucket) => (
          <div
            key={bucket.label}
            className={`rounded-lg ${bucket.bgColor} border border-border p-4 transition-colors`}
          >
            <div className="flex items-center gap-2">
              {bucket.label === 'Current' ? (
                <Clock className={`h-4 w-4 ${bucket.color}`} />
              ) : (
                <AlertTriangle className={`h-4 w-4 ${bucket.color}`} />
              )}
              <span className="text-xs font-medium text-muted-foreground">{bucket.label}</span>
            </div>
            <div className={`mt-2 text-xl font-bold ${bucket.color}`}>
              {formatCurrency(bucket.total)}
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {bucket.count} invoice{bucket.count !== 1 ? 's' : ''}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
