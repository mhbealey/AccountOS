'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Mail,
  Phone,
  User,
  FileText,
  CalendarDays,
  CheckCircle2,
  Circle,
  Shield,
  ShieldCheck,
  Activity,
  Lock,
  AlertTriangle,
  Users,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { cn, formatCurrency, formatDate, getScoreColor, getScoreBg } from '@/lib/utils';

const ScoreTrendChart = dynamic(() => import('@/components/charts/ScoreTrendChart'), {
  ssr: false,
  loading: () => <div className="h-[280px] flex items-center justify-center text-[#829AB1] text-sm">Loading chart...</div>,
});

// ── Types ───────────────────────────────────────────────────────────────────

type Client = {
  id: string;
  name: string;
  industry: string | null;
  size: string | null;
  status: string;
  tier: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  notes: string | null;
  mrr: number;
  contractEnd: string | null;
};

type JourneyPhase = {
  id: string;
  phase: string;
  status: string;
  order: number;
  startedAt: string | null;
  completedAt: string | null;
  notes: string | null;
};

type ValueOutcome = {
  id: string;
  category: string;
  score: number;
  notes: string | null;
};

type ScoreSnapshot = {
  overallScore: number;
  riskReduction: number;
  compliance: number;
  resilience: number;
  dataProtection: number;
  incidentResponse: number;
  securityCulture: number;
  capturedAt: string;
};

type ClientService = {
  id: string;
  status: string;
  revenue: number | null;
  notes: string | null;
  service: {
    id: string;
    name: string;
    category: string;
  };
};

type ClientData = {
  client: Client;
  journeyPhases: JourneyPhase[];
  valueOutcomes: ValueOutcome[];
  scoreSnapshots: ScoreSnapshot[];
  services: ClientService[];
};

// ── Constants ───────────────────────────────────────────────────────────────

const TABS = ['Overview', 'Cyber Journey', 'Score', 'Services'] as const;
type Tab = (typeof TABS)[number];

const STATUS_BADGE: Record<string, string> = {
  active: 'bg-[#00D4AA]/15 text-[#00D4AA] border-[#00D4AA]/30',
  onboarding: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  churned: 'bg-red-500/15 text-red-400 border-red-500/30',
};

const TIER_BADGE: Record<string, string> = {
  enterprise: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  professional: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  starter: 'bg-[#1A3550] text-[#829AB1] border-[#1A3550]',
};

const PHASE_LABELS: Record<string, string> = {
  cra: 'Cyber Risk Assessment',
  remediation: 'Remediation',
  implementation: 'Implementation',
  monitoring: 'Monitoring',
  optimization: 'Optimization',
  maturity: 'Maturity',
};

const OUTCOME_ICONS: Record<string, React.ReactNode> = {
  risk_reduction: <Shield className="h-4 w-4" />,
  compliance: <ShieldCheck className="h-4 w-4" />,
  resilience: <Activity className="h-4 w-4" />,
  data_protection: <Lock className="h-4 w-4" />,
  incident_response: <AlertTriangle className="h-4 w-4" />,
  security_culture: <Users className="h-4 w-4" />,
};

const OUTCOME_LABELS: Record<string, string> = {
  risk_reduction: 'Risk Reduction',
  compliance: 'Compliance & Regulatory',
  resilience: 'Operational Resilience',
  data_protection: 'Data Protection',
  incident_response: 'Incident Response',
  security_culture: 'Security Culture',
};

const SERVICE_STATUS_BADGE: Record<string, string> = {
  active: 'bg-[#00D4AA]/15 text-[#00D4AA]',
  planned: 'bg-blue-500/15 text-blue-400',
  opportunity: 'bg-amber-500/15 text-amber-400',
};

// ── Helpers ─────────────────────────────────────────────────────────────────

function getScoreBarColor(score: number): string {
  if (score <= 25) return 'bg-red-500';
  if (score <= 50) return 'bg-amber-500';
  if (score <= 75) return 'bg-teal-500';
  return 'bg-[#00D4AA]';
}

// ── Sub-components ──────────────────────────────────────────────────────────

function OverviewTab({ client }: { client: Client }) {
  return (
    <div className="space-y-4">
      {/* Contact Info */}
      <div className="rounded-xl border border-[#1A3550] bg-[#0B1B2E] p-5">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#829AB1]">
          Contact Information
        </h3>
        <div className="space-y-3">
          {client.contactName && (
            <div className="flex items-center gap-3 text-sm">
              <User className="h-4 w-4 shrink-0 text-[#829AB1]" />
              <span className="text-[#F0F4F8]">{client.contactName}</span>
            </div>
          )}
          {client.contactEmail && (
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 shrink-0 text-[#829AB1]" />
              <a
                href={`mailto:${client.contactEmail}`}
                className="text-[#00D4AA] hover:underline"
              >
                {client.contactEmail}
              </a>
            </div>
          )}
          {client.contactPhone && (
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 shrink-0 text-[#829AB1]" />
              <span className="text-[#F0F4F8]">{client.contactPhone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Contract */}
      {client.contractEnd && (
        <div className="rounded-xl border border-[#1A3550] bg-[#0B1B2E] p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#829AB1]">
            Contract
          </h3>
          <div className="flex items-center gap-3 text-sm">
            <CalendarDays className="h-4 w-4 shrink-0 text-[#829AB1]" />
            <span className="text-[#829AB1]">Ends</span>
            <span className="text-[#F0F4F8]">{formatDate(client.contractEnd)}</span>
          </div>
        </div>
      )}

      {/* Notes */}
      {client.notes && (
        <div className="rounded-xl border border-[#1A3550] bg-[#0B1B2E] p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#829AB1]">
            Notes
          </h3>
          <div className="flex items-start gap-3 text-sm">
            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-[#829AB1]" />
            <p className="whitespace-pre-wrap text-[#F0F4F8]/80 leading-relaxed">
              {client.notes}
            </p>
          </div>
        </div>
      )}

      {/* Client Details */}
      <div className="rounded-xl border border-[#1A3550] bg-[#0B1B2E] p-5">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#829AB1]">
          Details
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-[#829AB1]">Industry</span>
            <p className="mt-0.5 text-[#F0F4F8]">{client.industry ?? '—'}</p>
          </div>
          <div>
            <span className="text-[#829AB1]">Size</span>
            <p className="mt-0.5 text-[#F0F4F8] capitalize">{client.size ?? '—'}</p>
          </div>
          <div>
            <span className="text-[#829AB1]">Tier</span>
            <p className="mt-0.5 text-[#F0F4F8] capitalize">{client.tier ?? '—'}</p>
          </div>
          <div>
            <span className="text-[#829AB1]">MRR</span>
            <p className="mt-0.5 text-[#F0F4F8]">{formatCurrency(client.mrr)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CyberJourneyTab({ phases }: { phases: JourneyPhase[] }) {
  const sorted = [...phases].sort((a, b) => a.order - b.order);

  return (
    <div className="relative pl-8">
      {/* Vertical line */}
      <div className="absolute left-[11px] top-2 bottom-2 w-px bg-[#1A3550]" />

      <div className="space-y-6">
        {sorted.map((phase, idx) => {
          const isCompleted = phase.status === 'completed';
          const isInProgress = phase.status === 'in_progress';
          const label = PHASE_LABELS[phase.phase] ?? phase.phase;

          return (
            <div key={phase.id} className="relative">
              {/* Timeline dot */}
              <div className="absolute -left-8 top-1 flex h-6 w-6 items-center justify-center">
                {isCompleted ? (
                  <CheckCircle2 className="h-5 w-5 text-[#00D4AA]" />
                ) : isInProgress ? (
                  <span className="relative flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00D4AA] opacity-50" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-[#00D4AA]" />
                  </span>
                ) : (
                  <Circle className="h-4 w-4 text-[#829AB1]/50" />
                )}
              </div>

              {/* Phase card */}
              <div
                className={cn(
                  'rounded-xl border p-4 transition-colors',
                  isInProgress
                    ? 'border-[#00D4AA]/30 bg-[#00D4AA]/5'
                    : 'border-[#1A3550] bg-[#0B1B2E]'
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-[#829AB1]">
                      Phase {idx + 1}
                    </span>
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-[10px] font-medium capitalize',
                        isCompleted
                          ? 'bg-[#00D4AA]/15 text-[#00D4AA]'
                          : isInProgress
                            ? 'bg-[#00D4AA]/15 text-[#00D4AA]'
                            : 'bg-[#1A3550] text-[#829AB1]'
                      )}
                    >
                      {phase.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <h4
                  className={cn(
                    'mt-1 font-semibold',
                    isCompleted || isInProgress ? 'text-[#F0F4F8]' : 'text-[#829AB1]'
                  )}
                >
                  {label}
                </h4>

                {/* Dates */}
                {(phase.startedAt || phase.completedAt) && (
                  <div className="mt-2 flex flex-wrap gap-4 text-xs text-[#829AB1]">
                    {phase.startedAt && (
                      <span>Started: {formatDate(phase.startedAt)}</span>
                    )}
                    {phase.completedAt && (
                      <span>Completed: {formatDate(phase.completedAt)}</span>
                    )}
                  </div>
                )}

                {/* Notes */}
                {phase.notes && (
                  <p className="mt-2 text-sm text-[#829AB1]/80 leading-relaxed">
                    {phase.notes}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ScoreTab({
  outcomes,
  snapshots,
}: {
  outcomes: ValueOutcome[];
  snapshots: ScoreSnapshot[];
}) {
  const overall =
    outcomes.length > 0
      ? Math.round(outcomes.reduce((sum, o) => sum + o.score, 0) / outcomes.length)
      : 0;

  const chartData = snapshots.map((s) => ({
    date: formatDate(s.capturedAt),
    score: s.overallScore,
  }));

  return (
    <div className="space-y-4">
      {/* Overall Score */}
      <div className="flex flex-col items-center rounded-xl border border-[#1A3550] bg-[#0B1B2E] p-6">
        <span className="text-sm font-semibold uppercase tracking-wider text-[#829AB1]">
          Overall Score
        </span>
        <span className={cn('mt-2 text-5xl font-bold', getScoreColor(overall))}>
          {overall}
        </span>
        <span className="mt-1 text-sm text-[#829AB1]">out of 100</span>
      </div>

      {/* Score Bars */}
      <div className="rounded-xl border border-[#1A3550] bg-[#0B1B2E] p-5">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#829AB1]">
          Value Outcomes
        </h3>
        <div className="space-y-4">
          {outcomes.map((outcome) => {
            const key = outcome.category
              .toLowerCase()
              .replace(/[& ]+/g, '_')
              .replace(/__+/g, '_');
            const label = OUTCOME_LABELS[key] ?? outcome.category;
            const icon = OUTCOME_ICONS[key];

            return (
              <div key={outcome.id}>
                <div className="mb-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <span className={cn('shrink-0', getScoreColor(outcome.score))}>
                      {icon}
                    </span>
                    <span className="text-[#F0F4F8]">{label}</span>
                  </div>
                  <span
                    className={cn('text-sm font-semibold', getScoreColor(outcome.score))}
                  >
                    {outcome.score}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#1A3550]">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      getScoreBarColor(outcome.score)
                    )}
                    style={{ width: `${outcome.score}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Score History Chart */}
      {chartData.length > 1 && (
        <div className="rounded-xl border border-[#1A3550] bg-[#0B1B2E] p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#829AB1]">
            Score History
          </h3>
          <div className="h-56">
            <ScoreTrendChart data={chartData.map(d => ({ month: d.date, score: d.score }))} />
          </div>
        </div>
      )}
    </div>
  );
}

function ServicesTab({ services }: { services: ClientService[] }) {
  const grouped = {
    active: services.filter((s) => s.status === 'active'),
    planned: services.filter((s) => s.status === 'planned'),
    opportunity: services.filter((s) => s.status === 'opportunity'),
  };

  const sections = [
    { key: 'active', label: 'Active Services', items: grouped.active },
    { key: 'planned', label: 'Planned', items: grouped.planned },
    { key: 'opportunity', label: 'Opportunities', items: grouped.opportunity },
  ] as const;

  return (
    <div className="space-y-4">
      {sections.map(
        (section) =>
          section.items.length > 0 && (
            <div
              key={section.key}
              className="rounded-xl border border-[#1A3550] bg-[#0B1B2E] p-5"
            >
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#829AB1]">
                {section.label}
                <span className="ml-2 text-xs font-normal text-[#829AB1]/60">
                  ({section.items.length})
                </span>
              </h3>
              <div className="space-y-3">
                {section.items.map((svc) => (
                  <div
                    key={svc.id}
                    className="flex items-center justify-between rounded-lg border border-[#1A3550]/50 bg-[#050E1A]/50 px-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium text-[#F0F4F8]">
                          {svc.service.name}
                        </span>
                        <span
                          className={cn(
                            'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium capitalize',
                            SERVICE_STATUS_BADGE[svc.status] ?? 'bg-[#1A3550] text-[#829AB1]'
                          )}
                        >
                          {svc.status}
                        </span>
                      </div>
                      <span className="mt-0.5 block text-xs text-[#829AB1]">
                        {svc.service.category}
                      </span>
                    </div>
                    {svc.revenue != null && svc.revenue > 0 && (
                      <span className="shrink-0 text-sm font-semibold text-[#F0F4F8]">
                        {formatCurrency(svc.revenue)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
      )}

      {services.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-[#1A3550] bg-[#0B1B2E] py-16 text-[#829AB1]">
          <p className="text-sm">No services found.</p>
        </div>
      )}
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────

export default function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [data, setData] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('Overview');

  useEffect(() => {
    fetch(`/api/clients/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load client');
        return res.json();
      })
      .then((json) => {
        // The API returns the client object with nested relations
        setData({
          client: json,
          journeyPhases: json.journeyPhases ?? [],
          valueOutcomes: json.valueOutcomes ?? [],
          scoreSnapshots: json.scoreSnapshots ?? [],
          services: json.services ?? [],
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center bg-[#050E1A]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#1A3550] border-t-[#00D4AA]" />
      </div>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center bg-[#050E1A] px-4 text-center">
        <p className="mb-4 text-sm text-red-400">{error ?? 'Client not found'}</p>
        <Link
          href="/clients"
          className="text-sm text-[#00D4AA] hover:underline"
        >
          Back to Clients
        </Link>
      </div>
    );
  }

  const { client, journeyPhases, valueOutcomes, scoreSnapshots, services } = data;

  return (
    <div className="flex min-h-full flex-col bg-[#050E1A]">
      {/* Back button */}
      <div className="px-4 pt-4 md:px-8">
        <Link
          href="/clients"
          className="inline-flex items-center gap-1.5 text-sm text-[#829AB1] hover:text-[#F0F4F8] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Clients
        </Link>
      </div>

      {/* Client Header */}
      <div className="px-4 pt-4 pb-0 md:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[#F0F4F8]">{client.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {client.industry && (
                <span className="rounded-full bg-[#1A3550] px-2.5 py-0.5 text-xs font-medium text-[#829AB1]">
                  {client.industry}
                </span>
              )}
              <span
                className={cn(
                  'rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize',
                  STATUS_BADGE[client.status.toLowerCase()] ??
                    'bg-[#1A3550] text-[#829AB1] border-[#1A3550]'
                )}
              >
                {client.status}
              </span>
              {client.tier && (
                <span
                  className={cn(
                    'rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize',
                    TIER_BADGE[client.tier.toLowerCase()] ??
                      'bg-[#1A3550] text-[#829AB1] border-[#1A3550]'
                  )}
                >
                  {client.tier}
                </span>
              )}
            </div>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-sm text-[#829AB1]">MRR</span>
            <p className="text-2xl font-bold text-[#F0F4F8]">
              {formatCurrency(client.mrr)}
            </p>
          </div>
        </div>
      </div>

      {/* Sticky Tab Navigation */}
      <div className="sticky top-0 z-20 mt-4 border-b border-[#1A3550] bg-[#050E1A]/95 backdrop-blur-sm">
        <div className="flex overflow-x-auto px-4 md:px-8">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'relative shrink-0 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap',
                activeTab === tab
                  ? 'text-[#00D4AA]'
                  : 'text-[#829AB1] hover:text-[#F0F4F8]'
              )}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00D4AA] rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto px-4 py-5 md:px-8">
        {activeTab === 'Overview' && <OverviewTab client={client} />}
        {activeTab === 'Cyber Journey' && <CyberJourneyTab phases={journeyPhases} />}
        {activeTab === 'Score' && (
          <ScoreTab outcomes={valueOutcomes} snapshots={scoreSnapshots} />
        )}
        {activeTab === 'Services' && <ServicesTab services={services} />}
      </div>
    </div>
  );
}
