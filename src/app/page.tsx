'use client';

import React, { useMemo, useCallback } from 'react';
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
import { formatCurrency } from '@/lib/utils';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { PriorityList, type PriorityItem } from '@/components/dashboard/PriorityList';
import { ActivityFeed, type ActivityItem } from '@/components/dashboard/ActivityFeed';
import { RevenueChart, type RevenueDataPoint } from '@/components/dashboard/RevenueChart';
import { PipelineFunnel, type PipelineStage } from '@/components/dashboard/PipelineFunnel';
import { AIInsightsPanel } from '@/components/dashboard/AIInsightsPanel';
import { useClientStore } from '@/stores/client-store';
import { useDealStore } from '@/stores/deal-store';
import { useTaskStore } from '@/stores/task-store';
import { useInvoiceStore } from '@/stores/invoice-store';
import { useActivityStore } from '@/stores/activity-store';
import { useContractStore } from '@/stores/contract-store';
import { useTimeStore } from '@/stores/time-store';

// ---------------------------------------------------------------------------
// Dashboard Component
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const clients = useClientStore((s) => s.clients);
  const deals = useDealStore((s) => s.deals);
  const tasks = useTaskStore((s) => s.tasks);
  const invoices = useInvoiceStore((s) => s.invoices);
  const activities = useActivityStore((s) => s.activities);
  const contracts = useContractStore((s) => s.contracts);
  const timeEntries = useTimeStore((s) => s.timeEntries);

  // ---------------------------
  // Computed metrics
  // ---------------------------
  const metrics = useMemo(() => {
    const activeClients = clients.filter((c) => c.status === 'Active');

    const mrr = activeClients.reduce((sum, c) => {
      const clientDeals = deals.filter(
        (d) => d.clientId === c.id && d.stage === 'ClosedWon'
      );
      return sum + clientDeals.reduce((s, d) => s + d.value, 0);
    }, 0);

    const weightedPipeline = deals
      .filter((d) => d.stage !== 'ClosedWon' && d.stage !== 'ClosedLost')
      .reduce((sum, d) => sum + d.value * (d.probability / 100), 0);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const revenueThisMonth = timeEntries
      .filter((te) => te.billable && new Date(te.date) >= startOfMonth)
      .reduce((sum, te) => sum + te.hours, 0);

    const outstandingInvoices = invoices
      .filter((inv) => inv.status === 'Sent' || inv.status === 'Viewed' || inv.status === 'Overdue')
      .reduce((sum, inv) => sum + inv.amount + inv.tax, 0);

    const TARGET_HOURS_PER_MONTH = 160;
    const billableHours = timeEntries
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
  }, [clients, deals, timeEntries, invoices]);

  // ---------------------------
  // Priorities
  // ---------------------------
  const priorities = useMemo((): PriorityItem[] => {
    const items: PriorityItem[] = [];
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Overdue tasks
    tasks
      .filter(
        (t) => t.status !== 'done' && t.dueDate && new Date(t.dueDate).toISOString().split('T')[0] < todayStr
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
    tasks
      .filter(
        (t) =>
          t.status !== 'done' && t.dueDate && new Date(t.dueDate).toISOString().split('T')[0] === todayStr
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
    clients
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
    contracts
      .filter(
        (c) =>
          c.status === 'Active' && c.endDate &&
          new Date(c.endDate).toISOString().split('T')[0] >= todayStr &&
          new Date(c.endDate).toISOString().split('T')[0] <= thirtyDaysOut
      )
      .forEach((c) =>
        items.push({
          id: `contract-${c.id}`,
          label: `Contract expiring: ${c.clientId}`,
          type: 'contract',
          severity: 'warning',
          href: `/clients/${c.clientId}`,
        })
      );

    // Overdue invoices
    invoices
      .filter((inv) => inv.status === 'Overdue')
      .forEach((inv) =>
        items.push({
          id: `invoice-${inv.id}`,
          label: `Overdue invoice: ${inv.clientId} — ${formatCurrency(inv.amount + inv.tax)}`,
          type: 'invoice',
          severity: 'critical',
          href: `/invoices`,
        })
      );

    // Deals closing this week
    const weekOut = new Date(now.getTime() + 7 * 86400000)
      .toISOString()
      .split('T')[0];
    deals
      .filter(
        (d) =>
          d.stage !== 'ClosedWon' &&
          d.stage !== 'ClosedLost' &&
          d.closeDate &&
          new Date(d.closeDate).toISOString().split('T')[0] >= todayStr &&
          new Date(d.closeDate).toISOString().split('T')[0] <= weekOut
      )
      .forEach((d) =>
        items.push({
          id: `deal-${d.id}`,
          label: `Closing soon: ${d.title} — ${formatCurrency(d.value)}`,
          type: 'deal',
          severity: 'info',
          href: '/pipeline',
        })
      );

    return items;
  }, [tasks, clients, contracts, invoices, deals]);

  // ---------------------------
  // Activity feed items
  // ---------------------------
  const activityItems = useMemo((): ActivityItem[] => {
    return [...activities]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10)
      .map((a) => {
        const client = clients.find((c) => c.id === a.clientId);
        return {
          id: a.id,
          type: a.type,
          title: a.title,
          clientName: client?.name ?? 'Unknown',
          clientId: a.clientId ?? '',
          createdAt: typeof a.date === 'string' ? a.date : a.date.toISOString(),
        } satisfies ActivityItem;
      });
  }, [activities]);

  // ---------------------------
  // Revenue chart data (computed from time entries)
  // ---------------------------
  const revenueData = useMemo((): RevenueDataPoint[] => {
    const now = new Date();
    const months: RevenueDataPoint[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      const revenue = timeEntries
        .filter((te) => {
          const teDate = new Date(te.date);
          return te.billable && teDate >= d && teDate <= monthEnd;
        })
        .reduce((sum, te) => sum + te.hours * te.rate, 0);
      months.push({ month: label, revenue } as RevenueDataPoint);
    }
    return months;
  }, [timeEntries]);

  // ---------------------------
  // Pipeline funnel data
  // ---------------------------
  const pipelineData = useMemo((): PipelineStage[] => {
    const stages = ['Lead', 'Discovery', 'Proposal', 'Negotiation', 'ClosedWon', 'ClosedLost'] as const;
    return stages.map((stage) => {
      const stageDeals = deals.filter((d) => d.stage === stage);
      return {
        stage,
        count: stageDeals.length,
        value: stageDeals.reduce((sum, d) => sum + d.value, 0),
      } as PipelineStage;
    });
  }, [deals]);

  // ---------------------------
  // AI Insights data
  // ---------------------------
  const staleClients = useMemo(() => {
    const now = new Date();
    return clients
      .filter((c) => c.status === 'Active')
      .map((c) => {
        const daysSince = c.lastContactAt
          ? Math.floor(
            (now.getTime() - new Date(c.lastContactAt).getTime()) / 86400000
          )
          : 999;
        return { id: c.id, name: c.name, daysSinceContact: daysSince };
      })
      .filter((c) => c.daysSinceContact >= 14)
      .sort((a, b) => b.daysSinceContact - a.daysSinceContact);
  }, [clients]);

  const upcomingRenewals = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const sixtyDaysOut = new Date(now.getTime() + 60 * 86400000)
      .toISOString()
      .split('T')[0];
    return contracts
      .filter(
        (c) =>
          c.status === 'Active' && c.endDate &&
          new Date(c.endDate).toISOString().split('T')[0] >= todayStr &&
          new Date(c.endDate).toISOString().split('T')[0] <= sixtyDaysOut
      )
      .map((c) => ({
        id: c.id,
        clientName: c.clientId,
        clientId: c.clientId,
        expiresAt: typeof c.endDate === 'string' ? c.endDate : new Date(c.endDate!).toISOString(),
        daysUntil: Math.ceil(
          (new Date(c.endDate!).getTime() - now.getTime()) / 86400000
        ),
      }))
      .sort((a, b) => a.daysUntil - b.daysUntil);
  }, [contracts]);

  const handleGenerateDigest = useCallback(async () => {
    try {
      await fetch('/api/ai/weekly-digest', { method: 'POST' });
    } catch {
      // AI calls are optional in static mode
    }
  }, []);

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
            value={metrics.activeClients}
            trend="up"
            trendLabel="+3"
          />
          <MetricCard
            icon={<DollarSign className="h-4 w-4" />}
            label="MRR"
            value={formatCurrency(metrics.mrr)}
            trend="up"
            trendLabel="+8%"
          />
          <MetricCard
            icon={<Target className="h-4 w-4" />}
            label="Weighted Pipeline"
            value={formatCurrency(metrics.weightedPipeline)}
          />
          <MetricCard
            icon={<Clock className="h-4 w-4" />}
            label="Revenue (This Month)"
            value={`${metrics.revenueThisMonth}h`}
          />
          <MetricCard
            icon={<FileText className="h-4 w-4" />}
            label="Outstanding Invoices"
            value={formatCurrency(metrics.outstandingInvoices)}
            trend={
              metrics.outstandingInvoices > 0 ? 'down' : 'neutral'
            }
          />
          <MetricCard
            icon={<Gauge className="h-4 w-4" />}
            label="Utilization Rate"
            value={`${metrics.utilization}%`}
          />
          <MetricCard
            icon={<HeartPulse className="h-4 w-4" />}
            label="Avg. Client Health"
            value={metrics.avgHealth}
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
                activities={activityItems}
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
              <RevenueChart data={revenueData} />
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
              <PipelineFunnel data={pipelineData} />
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
