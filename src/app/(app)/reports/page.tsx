'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Loader2,
  AlertCircle,
  DollarSign,
  TrendingUp,
  Target,
  Clock,
  Users,
  BarChart3,
  HeartPulse,
  Activity,
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';

const ScoreTrendChart = dynamic(
  () => import('@/components/charts/ScoreTrendChart'),
  { ssr: false }
);

const BarChart = dynamic(() => import('recharts').then((m) => m.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then((m) => m.Bar), { ssr: false });
const LineChart = dynamic(() => import('recharts').then((m) => m.LineChart), { ssr: false });
const Line = dynamic(() => import('recharts').then((m) => m.Line), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((m) => m.YAxis), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((m) => m.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then((m) => m.ResponsiveContainer), { ssr: false });

// --- Types ---

interface RevenueData {
  monthly: Array<{ label: string; value: number }>;
  byClient: Array<{ name: string; revenue: number }>;
  ytdTotal: number;
  annualGoal: number;
  mrr?: number;
  nrr?: number;
  avgEffectiveRate?: number;
}

interface PipelineStage {
  stage: string;
  count: number;
  value: number;
}

interface PipelineData {
  stages: PipelineStage[];
  winRate: number;
  avgDealSize: number;
  avgCycleTime: number;
  won?: number;
  lost?: number;
}

interface HealthData {
  distribution: { critical: number; atRisk: number; healthy: number; thriving: number };
  trend: Array<{ label: string; value: number }>;
  engagementDecay?: Array<{ name: string; daysSinceContact: number }>;
}

interface UtilizationData {
  current: number;
  target: number;
  weeklyTrend: Array<{ label: string; value: number }>;
  billableRatio: number;
  byCategory?: Array<{ category: string; hours: number }>;
}

interface ReportData {
  revenue: RevenueData;
  pipeline: PipelineData;
  health: HealthData;
  utilization: UtilizationData;
}

type TabKey = 'revenue' | 'pipeline' | 'health' | 'utilization';

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: 'revenue', label: 'Revenue', icon: DollarSign },
  { key: 'pipeline', label: 'Pipeline', icon: Target },
  { key: 'health', label: 'Health', icon: HeartPulse },
  { key: 'utilization', label: 'Utilization', icon: Clock },
];

const tooltipStyle = {
  backgroundColor: '#0B1B2E',
  border: '1px solid #1A3550',
  borderRadius: '8px',
  color: '#F0F4F8',
  fontSize: 12,
};

// --- Metric Card ---

function MetricCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: React.ElementType; color?: string }) {
  return (
    <div className="bg-[#0B1B2E] rounded-xl border border-[#1A3550] p-5 flex flex-col gap-2">
      <Icon className={cn('h-5 w-5', color ?? 'text-[#00D4AA]')} />
      <p className="text-2xl font-bold text-[#F0F4F8]">{value}</p>
      <p className="text-xs text-[#829AB1]">{label}</p>
    </div>
  );
}

// --- Revenue Tab ---

function RevenueTab({ data }: { data: RevenueData }) {
  const progress = data.annualGoal > 0 ? Math.min((data.ytdTotal / data.annualGoal) * 100, 100) : 0;
  const topClients = [...(data.byClient ?? [])].sort((a, b) => b.revenue - a.revenue).slice(0, 10);

  return (
    <div className="space-y-6">
      {/* YTD Progress */}
      <div className="bg-[#0B1B2E] rounded-xl border border-[#1A3550] p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[#F0F4F8]">YTD Revenue Progress</h3>
          <span className="text-sm text-[#829AB1]">
            {formatCurrency(data.ytdTotal)} / {formatCurrency(data.annualGoal)}
          </span>
        </div>
        <div className="h-3 w-full rounded-full bg-[#1A3550]">
          <div
            className="h-full rounded-full bg-[#00D4AA] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-[#829AB1] mt-2">{progress.toFixed(1)}% of annual goal</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard label="Monthly Recurring Revenue" value={formatCurrency(data.mrr ?? 0)} icon={DollarSign} color="text-emerald-400" />
        <MetricCard label="Net Revenue Retention" value={`${data.nrr ?? 0}%`} icon={TrendingUp} color="text-blue-400" />
        <MetricCard label="Avg Effective Rate" value={formatCurrency(data.avgEffectiveRate ?? 0)} icon={BarChart3} color="text-purple-400" />
      </div>

      {/* Monthly Revenue Chart */}
      <div className="bg-[#0B1B2E] rounded-xl border border-[#1A3550] p-5">
        <h3 className="text-sm font-semibold text-[#F0F4F8] mb-4">Monthly Revenue</h3>
        <ScoreTrendChart data={data.monthly ?? []} height={280} />
      </div>

      {/* Revenue by Client */}
      <div className="bg-[#0B1B2E] rounded-xl border border-[#1A3550] p-5">
        <h3 className="text-sm font-semibold text-[#F0F4F8] mb-4">Revenue by Client (Top 10)</h3>
        {topClients.length === 0 ? (
          <p className="text-[#829AB1] text-sm">No client data available</p>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={topClients} layout="vertical" margin={{ top: 0, right: 10, left: 80, bottom: 0 }}>
              <XAxis type="number" stroke="#829AB1" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v: number) => formatCurrency(v)} />
              <YAxis type="category" dataKey="name" stroke="#829AB1" fontSize={12} tickLine={false} axisLine={false} width={80} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [formatCurrency(Number(v)), 'Revenue']} />
              <Bar dataKey="revenue" fill="#00D4AA" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

// --- Pipeline Tab ---

const FUNNEL_STAGES = ['Lead', 'Discovery', 'Proposal', 'Negotiation'];
const FUNNEL_WIDTHS = [100, 80, 60, 45];

function PipelineTab({ data }: { data: PipelineData }) {
  const stageMap = new Map((data.stages ?? []).map((s) => [s.stage, s]));

  return (
    <div className="space-y-6">
      {/* Funnel */}
      <div className="bg-[#0B1B2E] rounded-xl border border-[#1A3550] p-5">
        <h3 className="text-sm font-semibold text-[#F0F4F8] mb-6">Pipeline Funnel</h3>
        <div className="flex flex-col items-center gap-1">
          {FUNNEL_STAGES.map((stage, i) => {
            const info = stageMap.get(stage);
            return (
              <div
                key={stage}
                className="flex items-center justify-center rounded-md py-3 text-center transition-all"
                style={{
                  width: `${FUNNEL_WIDTHS[i]}%`,
                  backgroundColor: `rgba(0, 212, 170, ${0.15 + i * 0.1})`,
                  borderLeft: '2px solid rgba(0, 212, 170, 0.4)',
                  borderRight: '2px solid rgba(0, 212, 170, 0.4)',
                  ...(i === 0 ? { borderTop: '2px solid rgba(0, 212, 170, 0.4)', borderRadius: '8px 8px 0 0' } : {}),
                  ...(i === FUNNEL_STAGES.length - 1 ? { borderBottom: '2px solid rgba(0, 212, 170, 0.4)', borderRadius: '0 0 8px 8px' } : {}),
                }}
              >
                <div>
                  <p className="text-sm font-semibold text-[#F0F4F8]">{stage}</p>
                  <p className="text-xs text-[#829AB1]">
                    {info?.count ?? 0} deals &middot; {formatCurrency(info?.value ?? 0)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard label="Win Rate" value={`${data.winRate ?? 0}%`} icon={Target} color="text-emerald-400" />
        <MetricCard label="Avg Deal Size" value={formatCurrency(data.avgDealSize ?? 0)} icon={DollarSign} color="text-blue-400" />
        <MetricCard label="Avg Cycle Time" value={`${data.avgCycleTime ?? 0} days`} icon={Clock} color="text-purple-400" />
      </div>

      {/* Win/Loss Summary */}
      <div className="bg-[#0B1B2E] rounded-xl border border-[#1A3550] p-5">
        <h3 className="text-sm font-semibold text-[#F0F4F8] mb-4">Win / Loss Summary</h3>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-emerald-400" />
            <span className="text-sm text-[#F0F4F8]">Won: {data.won ?? 0}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-400" />
            <span className="text-sm text-[#F0F4F8]">Lost: {data.lost ?? 0}</span>
          </div>
        </div>
        {(data.won ?? 0) + (data.lost ?? 0) > 0 && (
          <div className="mt-3 h-3 w-full rounded-full bg-[#1A3550] flex overflow-hidden">
            <div
              className="h-full bg-emerald-400"
              style={{ width: `${((data.won ?? 0) / ((data.won ?? 0) + (data.lost ?? 0))) * 100}%` }}
            />
            <div className="h-full bg-red-400 flex-1" />
          </div>
        )}
      </div>
    </div>
  );
}

// --- Health Tab ---

const HEALTH_BANDS = [
  { key: 'critical' as const, label: 'Critical', color: 'bg-red-500', textColor: 'text-red-400' },
  { key: 'atRisk' as const, label: 'At-Risk', color: 'bg-yellow-500', textColor: 'text-yellow-400' },
  { key: 'healthy' as const, label: 'Healthy', color: 'bg-emerald-500', textColor: 'text-emerald-400' },
  { key: 'thriving' as const, label: 'Thriving', color: 'bg-blue-500', textColor: 'text-blue-400' },
];

function HealthTab({ data }: { data: HealthData }) {
  const dist = data.distribution ?? { critical: 0, atRisk: 0, healthy: 0, thriving: 0 };
  const decay = [...(data.engagementDecay ?? [])].sort((a, b) => b.daysSinceContact - a.daysSinceContact);

  return (
    <div className="space-y-6">
      {/* Distribution */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {HEALTH_BANDS.map((band) => (
          <div key={band.key} className="bg-[#0B1B2E] rounded-xl border border-[#1A3550] p-5 text-center">
            <div className={cn('h-2 w-12 rounded-full mx-auto mb-3', band.color)} />
            <p className="text-3xl font-bold text-[#F0F4F8]">{dist[band.key]}</p>
            <p className={cn('text-xs font-medium mt-1', band.textColor)}>{band.label}</p>
          </div>
        ))}
      </div>

      {/* Health Trend */}
      <div className="bg-[#0B1B2E] rounded-xl border border-[#1A3550] p-5">
        <h3 className="text-sm font-semibold text-[#F0F4F8] mb-4">Health Score Trend</h3>
        <ScoreTrendChart data={data.trend ?? []} height={280} />
      </div>

      {/* Engagement Decay */}
      <div className="bg-[#0B1B2E] rounded-xl border border-[#1A3550] p-5">
        <h3 className="text-sm font-semibold text-[#F0F4F8] mb-4">Engagement Decay</h3>
        {decay.length === 0 ? (
          <p className="text-[#829AB1] text-sm">No engagement data available</p>
        ) : (
          <div className="space-y-2 max-h-[320px] overflow-y-auto">
            {decay.map((client, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-[#1A3550] last:border-0">
                <span className="text-sm text-[#F0F4F8]">{client.name}</span>
                <span className={cn(
                  'text-sm font-medium tabular-nums',
                  client.daysSinceContact > 30 ? 'text-red-400' : client.daysSinceContact > 14 ? 'text-yellow-400' : 'text-[#829AB1]'
                )}>
                  {client.daysSinceContact}d ago
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// --- Utilization Tab ---

function UtilizationTab({ data }: { data: UtilizationData }) {
  const current = data.current ?? 0;
  const target = data.target ?? 0;
  const billable = data.billableRatio ?? 0;
  const categories = data.byCategory ?? [];

  // Gauge angles
  const gaugePercent = Math.min(current, 100);
  const targetPercent = Math.min(target, 100);

  // CSS donut for billable ratio
  const billableDeg = (billable / 100) * 360;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Gauge */}
        <div className="bg-[#0B1B2E] rounded-xl border border-[#1A3550] p-5 flex flex-col items-center">
          <h3 className="text-sm font-semibold text-[#F0F4F8] mb-4 self-start">Current Utilization</h3>
          <div className="relative w-40 h-40">
            <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
              {/* Background arc */}
              <circle cx="60" cy="60" r="50" fill="none" stroke="#1A3550" strokeWidth="10" strokeDasharray={`${Math.PI * 100}`} strokeLinecap="round" />
              {/* Target marker */}
              <circle cx="60" cy="60" r="50" fill="none" stroke="#829AB1" strokeWidth="10" strokeDasharray={`${(targetPercent / 100) * Math.PI * 100} ${Math.PI * 100}`} strokeLinecap="round" opacity="0.3" />
              {/* Current value */}
              <circle cx="60" cy="60" r="50" fill="none" stroke="#00D4AA" strokeWidth="10" strokeDasharray={`${(gaugePercent / 100) * Math.PI * 100} ${Math.PI * 100}`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-[#F0F4F8]">{current}%</span>
              <span className="text-xs text-[#829AB1]">target {target}%</span>
            </div>
          </div>
        </div>

        {/* Billable Ratio Donut */}
        <div className="bg-[#0B1B2E] rounded-xl border border-[#1A3550] p-5 flex flex-col items-center">
          <h3 className="text-sm font-semibold text-[#F0F4F8] mb-4 self-start">Billable Ratio</h3>
          <div
            className="relative w-40 h-40 rounded-full"
            style={{
              background: `conic-gradient(#00D4AA 0deg ${billableDeg}deg, #1A3550 ${billableDeg}deg 360deg)`,
            }}
          >
            <div className="absolute inset-3 rounded-full bg-[#0B1B2E] flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-[#F0F4F8]">{billable}%</span>
              <span className="text-xs text-[#829AB1]">billable</span>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Trend */}
      <div className="bg-[#0B1B2E] rounded-xl border border-[#1A3550] p-5">
        <h3 className="text-sm font-semibold text-[#F0F4F8] mb-4">Weekly Hours Trend</h3>
        <ScoreTrendChart data={data.weeklyTrend ?? []} height={280} />
      </div>

      {/* Hours by Category */}
      {categories.length > 0 && (
        <div className="bg-[#0B1B2E] rounded-xl border border-[#1A3550] p-5">
          <h3 className="text-sm font-semibold text-[#F0F4F8] mb-4">Hours by Category</h3>
          <div className="space-y-3">
            {categories.map((cat, i) => {
              const maxHours = Math.max(...categories.map((c) => c.hours), 1);
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-sm text-[#829AB1] w-28 truncate">{cat.category}</span>
                  <div className="flex-1 h-2 rounded-full bg-[#1A3550]">
                    <div
                      className="h-full rounded-full bg-[#00D4AA]"
                      style={{ width: `${(cat.hours / maxHours) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-[#F0F4F8] tabular-nums w-12 text-right">{cat.hours}h</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Main Reports Page ---

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('revenue');

  useEffect(() => {
    async function fetchReports() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/v1/reports/summary');
        if (!res.ok) {
          throw new Error(`Failed to load reports (${res.status})`);
        }
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#00D4AA]" />
          <p className="text-[#829AB1] text-sm">Loading reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-center px-4">
          <AlertCircle className="h-8 w-8 text-red-400" />
          <p className="text-red-400 font-medium">Failed to load reports</p>
          <p className="text-[#829AB1] text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const revenue = data?.revenue ?? { monthly: [], byClient: [], ytdTotal: 0, annualGoal: 0 };
  const pipeline = data?.pipeline ?? { stages: [], winRate: 0, avgDealSize: 0, avgCycleTime: 0 };
  const health = data?.health ?? { distribution: { critical: 0, atRisk: 0, healthy: 0, thriving: 0 }, trend: [] };
  const utilization = data?.utilization ?? { current: 0, target: 0, weeklyTrend: [], billableRatio: 0 };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#F0F4F8]">Reports</h1>
        <p className="text-[#829AB1] text-sm mt-1">Analytics and insights across your portfolio</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#0B1B2E] rounded-xl border border-[#1A3550] p-1 overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                isActive
                  ? 'bg-[#00D4AA]/10 text-[#00D4AA]'
                  : 'text-[#829AB1] hover:text-[#F0F4F8] hover:bg-[#1A3550]/50'
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'revenue' && <RevenueTab data={revenue} />}
      {activeTab === 'pipeline' && <PipelineTab data={pipeline} />}
      {activeTab === 'health' && <HealthTab data={health} />}
      {activeTab === 'utilization' && <UtilizationTab data={utilization} />}
    </div>
  );
}
