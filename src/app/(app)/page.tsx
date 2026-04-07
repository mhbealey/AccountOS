'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Users,
  Shield,
  DollarSign,
  CheckCircle,
  Activity,
} from 'lucide-react';
import { cn, formatCurrency, getScoreColor, getScoreLabel } from '@/lib/utils';

const ScoreTrendChart = dynamic(() => import('@/components/charts/ScoreTrendChart'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[280px] items-center justify-center text-sm" style={{ color: '#829AB1' }}>
      Loading chart...
    </div>
  ),
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

function getBarColor(score: number): string {
  if (score <= 25) return '#FF6B6B';
  if (score <= 50) return '#FFB347';
  if (score <= 75) return '#00D4AA';
  return '#5EEAD4';
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
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((res) => {
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return res.json();
      })
      .then((json) => setData(json))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: '#050E1A' }}>
        <div
          className="h-8 w-8 animate-spin rounded-full"
          style={{ border: '2px solid #1A3550', borderTopColor: '#00D4AA' }}
        />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: '#050E1A' }}>
        <p style={{ color: '#829AB1' }}>{error || 'Failed to load dashboard data.'}</p>
      </div>
    );
  }

  const totalClients = data.clientCount ?? 0;
  const avgScore = data.avgScore ?? 0;
  const totalMrr = data.totalMrr ?? 0;
  const openTasks = data.openTasks ?? 0;
  const scoreTrend = Array.isArray(data.scoreHistory) ? data.scoreHistory : [];
  const activities = Array.isArray(data.recentActivity) ? data.recentActivity : [];
  const clients = Array.isArray(data.clientScores) ? data.clientScores : [];

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: '#050E1A' }}>
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#F0F4F8' }}>Dashboard</h1>
          <p className="mt-1 text-sm" style={{ color: '#829AB1' }}>
            Your cyber account management overview
          </p>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <MetricCard icon={<Users size={16} />} label="Total Clients" value={String(totalClients)} />
          <MetricCard
            icon={<Shield size={16} />}
            label="Average Score"
            value={String(avgScore)}
            valueColor={getScoreColor(avgScore)}
            sub={getScoreLabel(avgScore)}
          />
          <MetricCard icon={<DollarSign size={16} />} label="Monthly Revenue" value={formatCurrency(totalMrr)} />
          <MetricCard icon={<CheckCircle size={16} />} label="Open Tasks" value={String(openTasks)} />
        </div>

        {/* Score Trend */}
        <Card title="Score Trend">
          <ScoreTrendChart data={scoreTrend} />
        </Card>

        {/* Recent Activity */}
        <Card title="Recent Activity">
          {activities.length > 0 ? (
            <ul className="space-y-3">
              {activities.map((a) => (
                <li key={a.id} className="flex items-start gap-3">
                  <Activity size={16} className="mt-0.5 shrink-0" style={{ color: '#829AB1' }} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm" style={{ color: '#F0F4F8' }}>{a.title}</p>
                    {a.clientName && <p className="text-xs" style={{ color: '#829AB1' }}>{a.clientName}</p>}
                  </div>
                  <span className="shrink-0 text-xs" style={{ color: '#829AB1' }}>{timeAgo(a.createdAt)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-8 text-center text-sm" style={{ color: '#829AB1' }}>No recent activity.</p>
          )}
        </Card>

        {/* Client Health */}
        <Card title="Client Health">
          {clients.length > 0 ? (
            <ul className="space-y-3">
              {[...clients].sort((a, b) => a.score - b.score).map((c) => (
                <li key={c.id} className="flex items-center gap-4">
                  <span className="w-36 shrink-0 truncate text-sm" style={{ color: '#F0F4F8' }}>{c.name}</span>
                  <div className="flex-1">
                    <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: '#1A3550' }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${c.score}%`, background: getBarColor(c.score) }}
                      />
                    </div>
                  </div>
                  <span className={cn('w-10 text-right text-sm font-medium', getScoreColor(c.score))}>
                    {c.score}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-8 text-center text-sm" style={{ color: '#829AB1' }}>No client data available.</p>
          )}
        </Card>
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  valueColor,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueColor?: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl p-5" style={{ background: '#0B1B2E', border: '1px solid #1A3550' }}>
      <div className="flex items-center gap-2" style={{ color: '#829AB1' }}>
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <p className={cn('mt-3 text-3xl font-bold', valueColor)} style={valueColor ? undefined : { color: '#F0F4F8' }}>
        {value}
      </p>
      {sub && <p className={cn('mt-1 text-xs', valueColor)} style={valueColor ? undefined : { color: '#829AB1' }}>{sub}</p>}
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-5" style={{ background: '#0B1B2E', border: '1px solid #1A3550' }}>
      <h2 className="mb-4 text-lg font-semibold" style={{ color: '#F0F4F8' }}>{title}</h2>
      {children}
    </div>
  );
}
