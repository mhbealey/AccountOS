'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  Users,
  DollarSign,
  Target,
  Clock,
  FileText,
  Gauge,
  HeartPulse,
  LayoutDashboard,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { PriorityList, type PriorityItem } from '@/components/dashboard/PriorityList';
import { ActivityFeed, type ActivityItem } from '@/components/dashboard/ActivityFeed';
import { RevenueChart, type RevenueDataPoint } from '@/components/dashboard/RevenueChart';
import { PipelineFunnel, type PipelineStage } from '@/components/dashboard/PipelineFunnel';
import { AIInsightsPanel } from '@/components/dashboard/AIInsightsPanel';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Client {
  id: string;
  name: string;
  status: string;
  healthScore: number;
  lastContactedAt: string;
}

interface Deal {
  id: string;
  title: string;
  value: number;
  probability: number;
  stage: string;
  expectedCloseDate: string;
  clientId: string;
  clientName?: string;
}

interface Task {
  id: string;
  title: string;
  dueDate: string;
  status: string;
  clientId?: string;
}

interface Invoice {
  id: string;
  status: string;
  total: number;
  dueDate: string;
  clientId: string;
  clientName?: string;
}

interface Contract {
  id: string;
  clientId: string;
  clientName?: string;
  endDate: string;
  status: string;
}

interface TimeEntry {
  id: string;
  hours: number;
  billable: boolean;
  date: string;
}

interface DashboardData {
  clients: Client[];
  deals: Deal[];
  tasks: Task[];
  invoices: Invoice[];
  activities: ActivityItem[];
  contracts: Contract[];
  timeEntries: TimeEntry[];
  revenueData: RevenueDataPoint[];
  pipelineData: PipelineStage[];
}

// ---------------------------------------------------------------------------
// Data fetching helper
// ---------------------------------------------------------------------------

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  const json = await res.json();
  return (json.data ?? json) as T;
}

// ---------------------------------------------------------------------------
// Dashboard Component
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---------------------------
  // Fetch all data
  // ---------------------------
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        clients,
        deals,
        tasks,
        invoices,
        activities,
        contracts,
        timeEntries,
        revenueData,
        pipelineData,
      ] = await Promise.all([
        fetchJSON<Client[]>('/api/clients'),
        fetchJSON<Deal[]>('/api/deals'),
        fetchJSON<Task[]>('/api/tasks'),
        fetchJSON<Invoice[]>('/api/invoices'),
        fetchJSON<ActivityItem[]>('/api/activities'),
        fetchJSON<Contract[]>('/api/contracts'),
        fetchJSON<TimeEntry[]>('/api/time-entries'),
        fetchJSON<RevenueDataPoint[]>('/api/reports/revenue'),
        fetchJSON<PipelineStage[]>('/api/reports/pipeline'),
      ]);

      setData({
        clients,
        deals,
        tasks,
        invoices,
        activities,
        contracts,
        timeEntries,
        revenueData,
        pipelineData,
      });
    } catch (err) {
      console.error('Dashboard load error:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ---------------------------
  // Computed metrics
  // ---------------------------
  const metrics = useMemo(() => {
    if (!data) return null;

    const activeClients = data.clients.filter((c) => c.status === 'Active');

    const mrr = activeClients.reduce((sum, c) => {
      const clientDeals = data.deals.filter(
        (d) => d.clientId === c.id && d.stage === 'ClosedWon'
      );
      return sum + clientDeals.reduce((s, d) => s + d.value, 0);
    }, 0);

    const weightedPipeline = data.deals
      .filter((d) => d.stage !== 'ClosedWon' && d.stage !== 'ClosedLost')
      .reduce((sum, d) => sum + d.value * (d.probability / 100), 0);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const revenueThisMonth = data.timeEntries
      .filter((te) => te.billable && new Date(te.date) >= startOfMonth)
      .reduce((sum, te) => sum + te.hours, 0);

    const outstandingInvoices = data.invoices
      .filter((inv) => inv.status === 'unpaid' || inv.status === 'overdue')
      .reduce((sum, inv) => sum + inv.total, 0);

    const TARGET_HOURS_PER_MONTH = 160;
    const billableHours = data.timeEntries
      .filter((te) => te.billable && new Date(te.date) >= startOfMonth)
      .reduce((sum, te) => sum + te.hours, 0);
    const utilization = TARGET_HOURS_PER_MONTH > 0
      ? Math.round((billableHours / TARGET_HOURS_PER_MONTH) * 100)
      : 0;

    const healthScores = activeClients
      .map((c) => c.healthScore)
      .filter((s) => s != null);
    const avgHealth =
      healthScores.length > 0
        ? Math.round(healthScores.reduce((a, b) => a + b, 0) / healthScores.length)
        : 0;

    return {
      activeClients: activeClients.length,
      mrr,
      weightedPipeline,
      revenueThisMonth,
      outstandingInvoices,
      utilization,
      avgHealth,
    };
  }, [data]);

  // ---------------------------
  // Priorities
  // ---------------------------
  const priorities = useMemo((): PriorityItem[] => {
    if (!data) return [];

    const items: PriorityItem[] = [];
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Overdue tasks
    data.tasks
      .filter(
        (t) => t.status !== 'done' && t.status !== 'completed' && t.dueDate < todayStr
      )
      .forEach((t) =>
        items.push({
          id: `task-overdue-${t.id}`,
          label: `Overdue: ${t.title}`,
          type: 'task',
          severity: 'critical',
          href: '/tasks',
        })
      );

    // Tasks due today
    data.tasks
      .filter(
        (t) =>
          t.status !== 'done' && t.status !== 'completed' && t.dueDate === todayStr
      )
      .forEach((t) =>
        items.push({
          id: `task-today-${t.id}`,
          label: `Due today: ${t.title}`,
          type: 'task',
          severity: 'warning',
          href: '/tasks',
        })
      );

    // Declining health clients
    data.clients
      .filter((c) => c.status === 'Active' && c.healthScore < 40)
      .forEach((c) =>
        items.push({
          id: `health-${c.id}`,
          label: `${c.name} — health score ${c.healthScore}`,
          type: 'health',
          severity: 'critical',
          href: `/clients/${c.id}`,
        })
      );

    // Contracts expiring within 30 days
    const thirtyDaysOut = new Date(now.getTime() + 30 * 86400000)
      .toISOString()
      .split('T')[0];
    data.contracts
      .filter(
        (c) =>
          c.status === 'active' && c.endDate >= todayStr && c.endDate <= thirtyDaysOut
      )
      .forEach((c) =>
        items.push({
          id: `contract-${c.id}`,
          label: `Contract expiring: ${c.clientName ?? c.clientId}`,
          type: 'contract',
          severity: 'warning',
          href: `/clients/${c.clientId}`,
        })
      );

    // Overdue invoices
    data.invoices
      .filter((inv) => inv.status === 'overdue')
      .forEach((inv) =>
        items.push({
          id: `invoice-${inv.id}`,
          label: `Overdue invoice: ${inv.clientName ?? inv.clientId} — ${formatCurrency(inv.total)}`,
          type: 'invoice',
          severity: 'critical',
          href: `/invoices`,
        })
      );

    // Deals closing this week
    const weekOut = new Date(now.getTime() + 7 * 86400000)
      .toISOString()
      .split('T')[0];
    data.deals
      .filter(
        (d) =>
          d.stage !== 'ClosedWon' &&
          d.stage !== 'ClosedLost' &&
          d.expectedCloseDate >= todayStr &&
          d.expectedCloseDate <= weekOut
      )
      .forEach((d) =>
        items.push({
          id: `deal-${d.id}`,
          label: `Closing soon: ${d.title} — ${formatCurrency(d.value)}`,
          type: 'deal',
          severity: 'info',
          href: '/deals',
        })
      );

    return items;
  }, [data]);

  // ---------------------------
  // AI Insights data
  // ---------------------------
  const staleClients = useMemo(() => {
    if (!data) return [];
    const now = new Date();
    return data.clients
      .filter((c) => c.status === 'Active')
      .map((c) => {
        const daysSince = Math.floor(
          (now.getTime() - new Date(c.lastContactedAt).getTime()) / 86400000
        );
        return { id: c.id, name: c.name, daysSinceContact: daysSince };
      })
      .filter((c) => c.daysSinceContact >= 14)
      .sort((a, b) => b.daysSinceContact - a.daysSinceContact);
  }, [data]);

  const upcomingRenewals = useMemo(() => {
    if (!data) return [];
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const sixtyDaysOut = new Date(now.getTime() + 60 * 86400000)
      .toISOString()
      .split('T')[0];
    return data.contracts
      .filter(
        (c) =>
          c.status === 'active' && c.endDate >= todayStr && c.endDate <= sixtyDaysOut
      )
      .map((c) => ({
        id: c.id,
        clientName: c.clientName ?? c.clientId,
        clientId: c.clientId,
        expiresAt: c.endDate,
        daysUntil: Math.ceil(
          (new Date(c.endDate).getTime() - now.getTime()) / 86400000
        ),
      }))
      .sort((a, b) => a.daysUntil - b.daysUntil);
  }, [data]);

  const handleGenerateDigest = useCallback(async () => {
    await fetch('/api/ai/weekly-digest', { method: 'POST' });
  }, []);

  // ---------------------------
  // Loading skeleton
  // ---------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Header skeleton */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-lg bg-[#1e1e3a]" />
            <Skeleton className="h-8 w-48 bg-[#1e1e3a]" />
          </div>

          {/* Metric cards skeleton */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl bg-[#12122a]" />
            ))}
          </div>

          {/* Action panels skeleton */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Skeleton className="h-80 rounded-xl bg-[#12122a]" />
            <Skeleton className="h-80 rounded-xl bg-[#12122a]" />
          </div>

          {/* Charts skeleton */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Skeleton className="h-80 rounded-xl bg-[#12122a]" />
            <Skeleton className="h-80 rounded-xl bg-[#12122a]" />
          </div>

          {/* AI panel skeleton */}
          <Skeleton className="h-64 rounded-xl bg-[#12122a]" />
        </div>
      </div>
    );
  }

  // ---------------------------
  // Error state
  // ---------------------------
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a1a] p-6">
        <Card className="max-w-md border-[#1e1e3a] bg-[#12122a]">
          <CardContent className="p-8 text-center">
            <p className="mb-4 text-lg font-semibold text-red-400">{error}</p>
            <button
              onClick={loadData}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
            >
              Retry
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ---------------------------
  // Main render
  // ---------------------------
  return (
    <div className="min-h-screen bg-[#0a0a1a] p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* ---- Header ---- */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Dashboard</h1>
            <p className="text-xs text-slate-500">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* ---- Row 1: Key Metrics ---- */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
          <MetricCard
            icon={<Users className="h-4 w-4" />}
            label="Active Clients"
            value={metrics?.activeClients ?? 0}
            trend="up"
            trendLabel="+3"
          />
          <MetricCard
            icon={<DollarSign className="h-4 w-4" />}
            label="MRR"
            value={formatCurrency(metrics?.mrr ?? 0)}
            trend="up"
            trendLabel="+8%"
          />
          <MetricCard
            icon={<Target className="h-4 w-4" />}
            label="Weighted Pipeline"
            value={formatCurrency(metrics?.weightedPipeline ?? 0)}
          />
          <MetricCard
            icon={<Clock className="h-4 w-4" />}
            label="Revenue (This Month)"
            value={`${metrics?.revenueThisMonth ?? 0}h`}
          />
          <MetricCard
            icon={<FileText className="h-4 w-4" />}
            label="Outstanding Invoices"
            value={formatCurrency(metrics?.outstandingInvoices ?? 0)}
            trend={
              (metrics?.outstandingInvoices ?? 0) > 0 ? 'down' : 'neutral'
            }
          />
          <MetricCard
            icon={<Gauge className="h-4 w-4" />}
            label="Utilization Rate"
            value={`${metrics?.utilization ?? 0}%`}
          />
          <MetricCard
            icon={<HeartPulse className="h-4 w-4" />}
            label="Avg. Client Health"
            value={metrics?.avgHealth ?? 0}
          />
        </div>

        {/* ---- Row 2: Action Panels ---- */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Today's Priorities */}
          <Card className="border-[#1e1e3a] bg-[#12122a]">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-white">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-amber-500/10 text-amber-400">
                  <Target className="h-3.5 w-3.5" />
                </div>
                Today&apos;s Priorities
                {priorities.length > 0 && (
                  <span className="ml-auto rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-400">
                    {priorities.length}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto">
              <PriorityList items={priorities} />
            </CardContent>
          </Card>

          {/* Recent Activity Feed */}
          <Card className="border-[#1e1e3a] bg-[#12122a]">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-white">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-500/10 text-blue-400">
                  <Clock className="h-3.5 w-3.5" />
                </div>
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto">
              <ActivityFeed
                activities={(data?.activities ?? []).slice(0, 10)}
              />
            </CardContent>
          </Card>
        </div>

        {/* ---- Row 3: Charts ---- */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Revenue Trend */}
          <Card className="border-[#1e1e3a] bg-[#12122a]">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-white">
                Revenue Trend
              </CardTitle>
              <p className="text-xs text-slate-500">Last 12 months</p>
            </CardHeader>
            <CardContent>
              <RevenueChart data={data?.revenueData ?? []} />
            </CardContent>
          </Card>

          {/* Pipeline Funnel */}
          <Card className="border-[#1e1e3a] bg-[#12122a]">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-white">
                Pipeline Funnel
              </CardTitle>
              <p className="text-xs text-slate-500">
                Deal count &amp; value by stage
              </p>
            </CardHeader>
            <CardContent>
              <PipelineFunnel data={data?.pipelineData ?? []} />
            </CardContent>
          </Card>
        </div>

        {/* ---- Row 4: AI Insights ---- */}
        <AIInsightsPanel
          staleClients={staleClients}
          upcomingRenewals={upcomingRenewals}
          onGenerateDigest={handleGenerateDigest}
        />
      </div>
    </div>
  );
}
