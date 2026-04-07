'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  DollarSign,
  Target,
  HeartPulse,
  Clock,
  CheckSquare,
  AlertTriangle,
  AlertCircle,
  Info,
  MessageSquare,
  Phone,
  Mail,
  FileText,
  Activity,
  Loader2,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { cn, formatCurrency, getHealthColor, getHealthLabel, getHealthBg, formatRelativeTime, getSentimentColor } from '@/lib/utils';

interface DashboardMetrics {
  activeClients: number;
  mrr: number;
  weightedPipeline: number;
  avgHealth: number;
  utilization: number;
  openTasks: number;
}

interface Alert {
  id: string;
  type: string;
  message: string;
  clientId: string;
  clientName: string;
  urgency: number;
}

interface RecentActivity {
  id: string;
  type: string;
  title: string;
  clientName: string;
  sentiment: string;
  createdAt: string;
}

interface ClientHealth {
  id: string;
  name: string;
  healthScore: number;
  mrr: number;
  lastContactAt: string;
}

interface DashboardData {
  metrics: DashboardMetrics;
  alerts: Alert[];
  recentActivities: RecentActivity[];
  clientHealth: ClientHealth[];
}

const defaultMetrics: DashboardMetrics = {
  activeClients: 0,
  mrr: 0,
  weightedPipeline: 0,
  avgHealth: 0,
  utilization: 0,
  openTasks: 0,
};

function getActivityIcon(type: string) {
  switch (type) {
    case 'meeting':
    case 'call':
      return Phone;
    case 'email':
      return Mail;
    case 'note':
      return FileText;
    case 'message':
      return MessageSquare;
    default:
      return Activity;
  }
}

function getAlertTint(type: string) {
  switch (type) {
    case 'churn_risk':
    case 'health_drop':
      return 'border-red-500/30 bg-red-500/5';
    case 'overdue':
    case 'missed_meeting':
      return 'border-yellow-500/30 bg-yellow-500/5';
    default:
      return 'border-blue-500/30 bg-blue-500/5';
  }
}

function getAlertIconColor(type: string) {
  switch (type) {
    case 'churn_risk':
    case 'health_drop':
      return 'text-red-400';
    case 'overdue':
    case 'missed_meeting':
      return 'text-yellow-400';
    default:
      return 'text-blue-400';
  }
}

function getAlertAction(type: string) {
  switch (type) {
    case 'churn_risk':
      return 'Schedule check-in';
    case 'health_drop':
      return 'Review health factors';
    case 'overdue':
      return 'Follow up now';
    case 'missed_meeting':
      return 'Reschedule meeting';
    default:
      return 'Take action';
  }
}

function getSentimentDotColor(sentiment: string | null) {
  if (!sentiment) return 'bg-slate-400';
  switch (sentiment) {
    case 'Positive':
      return 'bg-emerald-400';
    case 'Negative':
      return 'bg-red-400';
    default:
      return 'bg-slate-400';
  }
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/v1/dashboard');
        if (!res.ok) {
          throw new Error(`Failed to load dashboard (${res.status})`);
        }
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#00D4AA]" />
          <p className="text-[#829AB1] text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-center px-4">
          <AlertCircle className="h-8 w-8 text-red-400" />
          <p className="text-red-400 font-medium">Failed to load dashboard</p>
          <p className="text-[#829AB1] text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const metrics = data?.metrics ?? defaultMetrics;
  const alerts = Array.isArray(data?.alerts) ? data.alerts : [];
  const recentActivities = Array.isArray(data?.recentActivities) ? data.recentActivities : [];
  const clientHealth = Array.isArray(data?.clientHealth) ? data.clientHealth : [];

  const sortedAlerts = [...alerts].sort((a, b) => (b.urgency ?? 0) - (a.urgency ?? 0));
  const sortedHealth = [...clientHealth].sort((a, b) => (a.healthScore ?? 0) - (b.healthScore ?? 0));
  const recentTen = recentActivities.slice(0, 10);

  const metricCards = [
    {
      label: 'Active Clients',
      value: String(metrics.activeClients ?? 0),
      icon: Users,
      color: 'text-[#00D4AA]',
    },
    {
      label: 'Monthly Recurring Revenue',
      value: formatCurrency(metrics.mrr ?? 0),
      icon: DollarSign,
      color: 'text-emerald-400',
    },
    {
      label: 'Weighted Pipeline',
      value: formatCurrency(metrics.weightedPipeline ?? 0),
      icon: Target,
      color: 'text-blue-400',
    },
    {
      label: 'Avg Health Score',
      value: String(metrics.avgHealth ?? 0),
      icon: HeartPulse,
      color: getHealthColor(metrics.avgHealth ?? 0),
    },
    {
      label: 'Utilization',
      value: `${metrics.utilization ?? 0}%`,
      icon: Clock,
      color: 'text-purple-400',
    },
    {
      label: 'Open Tasks',
      value: String(metrics.openTasks ?? 0),
      icon: CheckSquare,
      color: 'text-yellow-400',
    },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#F0F4F8]">Dashboard</h1>
        <p className="text-[#829AB1] text-sm mt-1">Overview of your account management portfolio</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-[#0B1B2E] rounded-xl border border-[#1A3550] p-5 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <Icon className={cn('h-5 w-5', card.color)} />
              </div>
              <p className="text-3xl font-bold text-[#F0F4F8]">{card.value}</p>
              <p className="text-xs text-[#829AB1] leading-tight">{card.label}</p>
            </div>
          );
        })}
      </div>

      {/* Needs Attention */}
      {sortedAlerts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-[#F0F4F8] flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            Needs Attention
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {sortedAlerts.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  'rounded-xl border p-4 flex flex-col gap-2',
                  getAlertTint(alert.type ?? '')
                )}
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    className={cn('h-5 w-5 shrink-0 mt-0.5', getAlertIconColor(alert.type ?? ''))}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-[#F0F4F8] leading-snug">
                      {alert.message ?? 'No details available'}
                    </p>
                    {alert.clientName && (
                      <Link
                        href={`/clients/${alert.clientId}`}
                        className="text-[#00D4AA] text-xs hover:underline mt-1 inline-block"
                      >
                        {alert.clientName}
                      </Link>
                    )}
                  </div>
                </div>
                <p className="text-xs text-[#829AB1] italic">{getAlertAction(alert.type ?? '')}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two-column: Recent Activity + Client Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-[#0B1B2E] rounded-xl border border-[#1A3550] p-5">
          <h2 className="text-lg font-semibold text-[#F0F4F8] mb-4">Recent Activity</h2>
          {recentTen.length === 0 ? (
            <p className="text-[#829AB1] text-sm">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {recentTen.map((activity) => {
                const Icon = getActivityIcon(activity.type ?? '');
                return (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">
                      <Icon className="h-4 w-4 text-[#829AB1]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-[#F0F4F8] leading-snug truncate">
                        {activity.title ?? 'Untitled'}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-[#00D4AA]">
                          {activity.clientName ?? 'Unknown'}
                        </span>
                        <span className="text-xs text-[#829AB1]">
                          {activity.createdAt ? formatRelativeTime(activity.createdAt) : ''}
                        </span>
                        {activity.sentiment && (
                          <span
                            className={cn(
                              'inline-block h-2 w-2 rounded-full',
                              getSentimentDotColor(activity.sentiment)
                            )}
                            title={activity.sentiment}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Client Health */}
        <div className="bg-[#0B1B2E] rounded-xl border border-[#1A3550] p-5">
          <h2 className="text-lg font-semibold text-[#F0F4F8] mb-4">Client Health</h2>
          {sortedHealth.length === 0 ? (
            <p className="text-[#829AB1] text-sm">No client data available</p>
          ) : (
            <div className="space-y-3">
              {sortedHealth.map((client) => {
                const score = client.healthScore ?? 0;
                return (
                  <div key={client.id} className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <Link
                          href={`/clients/${client.id}`}
                          className="text-sm text-[#F0F4F8] hover:text-[#00D4AA] transition-colors truncate"
                        >
                          {client.name ?? 'Unknown'}
                        </Link>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <span className="text-xs text-[#829AB1]">
                            {formatCurrency(client.mrr ?? 0)}
                          </span>
                          <span
                            className={cn('text-sm font-semibold tabular-nums', getHealthColor(score))}
                          >
                            {score}
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-[#1A3550]">
                        <div
                          className={cn('h-full rounded-full transition-all', getHealthBg(score))}
                          style={{ width: `${Math.min(Math.max(score, 0), 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
