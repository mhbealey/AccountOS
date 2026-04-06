'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Users,
  TrendingUp,
  DollarSign,
  CheckCircle,
  Activity,
  Shield,
  Mail,
  FileText,
  AlertTriangle,
  Settings,
} from 'lucide-react';
import { cn, formatCurrency, getScoreColor, getScoreLabel } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

const ScoreTrendChart = dynamic(() => import('@/components/charts/ScoreTrendChart'), {
  ssr: false,
  loading: () => <div className="h-[280px] flex items-center justify-center text-[#829AB1] text-sm">Loading chart...</div>,
});

interface DashboardData {
  clientCount: number;
  avgScore: number;
  totalMrr: number;
  openTasks: number;
  scoreHistory: { month: string; score: number }[];
  recentActivity: {
    id: string;
    type: string;
    title: string;
    clientName: string | null;
    createdAt: string;
  }[];
  clientScores: {
    id: string;
    name: string;
    score: number;
  }[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getBarColor(score: number): string {
  if (score <= 25) return 'bg-red-500';
  if (score <= 50) return 'bg-amber-500';
  if (score <= 75) return 'bg-teal-500';
  return 'bg-teal-300';
}

function activityIcon(type: string) {
  const base = 'h-4 w-4 shrink-0';
  switch (type) {
    case 'email':
      return <Mail className={cn(base, 'text-blue-400')} />;
    case 'task':
      return <CheckCircle className={cn(base, 'text-teal-400')} />;
    case 'score_update':
      return <TrendingUp className={cn(base, 'text-amber-400')} />;
    case 'alert':
      return <AlertTriangle className={cn(base, 'text-red-400')} />;
    case 'document':
      return <FileText className={cn(base, 'text-slate-400')} />;
    case 'service':
      return <Settings className={cn(base, 'text-purple-400')} />;
    default:
      return <Activity className={cn(base, 'text-[#829AB1]')} />;
  }
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

// ---------------------------------------------------------------------------
// Dashboard Page
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050E1A]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1A3550] border-t-[#00D4AA]" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050E1A]">
        <p className="text-[#829AB1]">Failed to load dashboard data.</p>
      </div>
    );
  }

  const metrics = {
    totalClients: data.clientCount,
    averageScore: data.avgScore,
    monthlyRevenue: data.totalMrr,
    openTasks: data.openTasks,
  };
  const scoreTrend = data.scoreHistory;
  const recentActivities = data.recentActivity;
  const clientHealth = data.clientScores;

  const scoreColor =
    metrics.averageScore <= 25
      ? 'text-red-500'
      : metrics.averageScore <= 50
        ? 'text-amber-500'
        : metrics.averageScore <= 75
          ? 'text-teal-500'
          : 'text-teal-300';

  return (
    <div className="min-h-screen bg-[#050E1A] p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-[#F0F4F8]">Dashboard</h1>
          <p className="mt-1 text-sm text-[#829AB1]">
            Your cyber account management overview
          </p>
        </div>

        {/* ---- Metric Cards ---- */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {/* Total Clients */}
          <div className="rounded-xl border border-[#1A3550] bg-[#0B1B2E] p-5">
            <div className="flex items-center gap-2 text-[#829AB1]">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">Total Clients</span>
            </div>
            <p className="mt-3 text-3xl font-bold text-[#F0F4F8]">
              {metrics.totalClients}
            </p>
          </div>

          {/* Average Score */}
          <div className="rounded-xl border border-[#1A3550] bg-[#0B1B2E] p-5">
            <div className="flex items-center gap-2 text-[#829AB1]">
              <Shield className="h-4 w-4" />
              <span className="text-sm font-medium">Average Score</span>
            </div>
            <p className={cn('mt-3 text-3xl font-bold', scoreColor)}>
              {metrics.averageScore}
            </p>
            <p className={cn('mt-1 text-xs', scoreColor)}>
              {getScoreLabel(metrics.averageScore)}
            </p>
          </div>

          {/* Monthly Revenue */}
          <div className="rounded-xl border border-[#1A3550] bg-[#0B1B2E] p-5">
            <div className="flex items-center gap-2 text-[#829AB1]">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm font-medium">Monthly Revenue</span>
            </div>
            <p className="mt-3 text-3xl font-bold text-[#F0F4F8]">
              {formatCurrency(metrics.monthlyRevenue)}
            </p>
          </div>

          {/* Open Tasks */}
          <div className="rounded-xl border border-[#1A3550] bg-[#0B1B2E] p-5">
            <div className="flex items-center gap-2 text-[#829AB1]">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Open Tasks</span>
            </div>
            <p className="mt-3 text-3xl font-bold text-[#F0F4F8]">
              {metrics.openTasks}
            </p>
          </div>
        </div>

        {/* ---- Score Trend Chart ---- */}
        <div className="rounded-xl border border-[#1A3550] bg-[#0B1B2E] p-5">
          <h2 className="mb-4 text-lg font-semibold text-[#F0F4F8]">
            Score Trend
          </h2>
          <ScoreTrendChart data={scoreTrend} />
        </div>

        {/* ---- Recent Activity ---- */}
        <div className="rounded-xl border border-[#1A3550] bg-[#0B1B2E] p-5">
          <h2 className="mb-4 text-lg font-semibold text-[#F0F4F8]">
            Recent Activity
          </h2>
          {recentActivities.length > 0 ? (
            <ul className="space-y-3">
              {recentActivities.map((a) => (
                <li key={a.id} className="flex items-start gap-3">
                  <div className="mt-0.5">{activityIcon(a.type)}</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-[#F0F4F8]">{a.title}</p>
                    {a.clientName && (
                      <p className="text-xs text-[#829AB1]">{a.clientName}</p>
                    )}
                  </div>
                  <span className="shrink-0 text-xs text-[#829AB1]">
                    {timeAgo(a.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-8 text-center text-sm text-[#829AB1]">
              No recent activity.
            </p>
          )}
        </div>

        {/* ---- Client Health ---- */}
        <div className="rounded-xl border border-[#1A3550] bg-[#0B1B2E] p-5">
          <h2 className="mb-4 text-lg font-semibold text-[#F0F4F8]">
            Client Health
          </h2>
          {clientHealth.length > 0 ? (
            <ul className="space-y-3">
              {clientHealth
                .sort((a, b) => a.score - b.score)
                .map((c) => (
                  <li key={c.id} className="flex items-center gap-4">
                    <span className="w-36 shrink-0 truncate text-sm text-[#F0F4F8]">
                      {c.name}
                    </span>
                    <div className="flex-1">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-[#1A3550]">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all',
                            getBarColor(c.score)
                          )}
                          style={{ width: `${c.score}%` }}
                        />
                      </div>
                    </div>
                    <span
                      className={cn(
                        'w-10 text-right text-sm font-medium',
                        getScoreColor(c.score)
                      )}
                    >
                      {c.score}
                    </span>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="py-8 text-center text-sm text-[#829AB1]">
              No client data available.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
