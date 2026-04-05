'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  CheckCircle2,
  HeartPulse,
  FileText,
  DollarSign,
  Handshake,
  ChevronRight,
} from 'lucide-react';

export interface PriorityItem {
  id: string;
  label: string;
  type: 'task' | 'health' | 'contract' | 'invoice' | 'deal';
  severity: 'critical' | 'warning' | 'info';
  href: string;
}

interface PriorityListProps {
  items: PriorityItem[];
}

const typeIcons: Record<PriorityItem['type'], React.ReactNode> = {
  task: <CheckCircle2 className="h-4 w-4" />,
  health: <HeartPulse className="h-4 w-4" />,
  contract: <FileText className="h-4 w-4" />,
  invoice: <DollarSign className="h-4 w-4" />,
  deal: <Handshake className="h-4 w-4" />,
};

const severityStyles: Record<PriorityItem['severity'], string> = {
  critical: 'text-red-400 bg-red-500/10 border-red-500/20',
  warning: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  info: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
};

const severityTextStyles: Record<PriorityItem['severity'], string> = {
  critical: 'text-red-300',
  warning: 'text-amber-300',
  info: 'text-slate-300',
};

export function PriorityList({ items }: PriorityListProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <p className="mt-2 text-sm text-slate-400">All clear! No urgent items.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-1.5">
      {items.map((item) => (
        <li key={item.id}>
          <Link
            href={item.href}
            className={cn(
              'group flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-all hover:brightness-125',
              severityStyles[item.severity]
            )}
          >
            <div className="flex-shrink-0">{typeIcons[item.type]}</div>
            <span
              className={cn(
                'flex-1 truncate text-sm font-medium',
                severityTextStyles[item.severity]
              )}
            >
              {item.label}
            </span>
            {item.severity === 'critical' && (
              <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 text-red-400" />
            )}
            <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-slate-500 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
