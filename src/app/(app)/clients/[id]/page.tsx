'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  HeartPulse,
  TrendingUp,
  CreditCard,
  Brain,
  Building2,
  Users,
  Globe,
  Megaphone,
  Calendar,
  Phone,
  Mail,
  Target,
  Clock,
  Activity,
  FileText,
  MessageSquare,
  Briefcase,
  DollarSign,
  StickyNote,
} from 'lucide-react';
import {
  cn,
  formatCurrency,
  formatDate,
  getHealthColor,
  getHealthBg,
  getHealthLabel,
  getStatusColor,
  getSentimentColor,
} from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Contact {
  id: string;
  name: string;
  title: string | null;
  email: string | null;
  phone: string | null;
  sentiment: string | null;
  isPrimary: boolean;
}

interface ClientGoal {
  id: string;
  title: string;
  description: string | null;
  status: string;
  targetValue: number | null;
  currentValue: number | null;
  unit: string | null;
  dueDate: string | null;
}

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description: string | null;
  date: string;
  sentiment: string | null;
}

interface ClientService {
  id: string;
  serviceName: string;
  category: string;
  status: string;
  revenue: number | null;
}

interface NoteItem {
  id: string;
  content: string;
  createdAt: string;
}

interface ClientDetail {
  id: string;
  name: string;
  status: string;
  industry: string | null;
  website: string | null;
  companySize: string | null;
  tier: string | null;
  source: string | null;
  mrr: number;
  healthScore: number;
  engagementScore: number;
  paymentScore: number;
  csmPulse: number;
  onboardedAt: string | null;
  lastContactAt: string | null;
  nextQbrDate: string | null;
  contacts: Contact[];
  goals: ClientGoal[];
  activities: ActivityItem[];
  services: ClientService[];
  notes: NoteItem[];
}

const TABS = ['Overview', 'Contacts', 'Goals', 'Activity', 'Services'] as const;
type Tab = (typeof TABS)[number];

/* ------------------------------------------------------------------ */
/*  Helper components                                                  */
/* ------------------------------------------------------------------ */

function HealthRing({ score, size = 56 }: { score: number; size?: number }) {
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const strokeColor =
    score <= 30 ? '#ef4444' : score <= 60 ? '#eab308' : score <= 80 ? '#10b981' : '#3b82f6';

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1A3550"
          strokeWidth={3}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={3}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span
        className={cn(
          'absolute inset-0 flex items-center justify-center text-sm font-bold',
          getHealthColor(score),
        )}
      >
        {score}
      </span>
    </div>
  );
}

function TierBadge({ tier }: { tier: string }) {
  const colors: Record<string, string> = {
    Enterprise: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    Growth: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Starter: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    Strategic: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };
  return (
    <span
      className={cn(
        'text-[10px] px-2 py-0.5 rounded-full border font-medium',
        colors[tier] ?? colors.Starter,
      )}
    >
      {tier}
    </span>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string; size?: string | number }>;
  color: string;
}) {
  return (
    <div className="bg-[#0B1B2E] rounded-xl border border-[#1A3550] p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Icon className={cn('h-4 w-4', color)} />
        <span className="text-xs text-[#829AB1]">{label}</span>
      </div>
      <p className="text-2xl font-bold text-[#F0F4F8]">{value}</p>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  isLink,
}: {
  icon: React.ComponentType<{ size?: string | number; className?: string }>;
  label: string;
  value: string | null;
  isLink?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon size={14} className="text-[#829AB1] shrink-0" />
      <span className="text-xs text-[#829AB1] w-24 shrink-0">{label}</span>
      {value ? (
        isLink ? (
          <a
            href={value.startsWith('http') ? value : `https://${value}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#00D4AA] hover:underline truncate"
          >
            {value}
          </a>
        ) : (
          <span className="text-xs text-[#F0F4F8] truncate">{value}</span>
        )
      ) : (
        <span className="text-xs text-[#829AB1]/40">--</span>
      )}
    </div>
  );
}

function EmptyState({
  icon: Icon,
  message,
}: {
  icon: React.ComponentType<{ size?: string | number; className?: string }>;
  message: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-[#829AB1]">
      <Icon size={48} className="mb-4 opacity-40" />
      <p className="text-lg font-medium">{message}</p>
    </div>
  );
}

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

function getSentimentDot(sentiment: string | null) {
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

function getGoalStatusColor(status: string) {
  switch (status) {
    case 'Achieved':
      return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    case 'In Progress':
      return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    case 'At Risk':
      return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    case 'Missed':
      return 'text-red-400 bg-red-500/10 border-red-500/20';
    default:
      return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
  }
}

function getServiceStatusColor(status: string) {
  switch (status) {
    case 'Active':
      return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    case 'Paused':
      return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    case 'Cancelled':
      return 'text-red-400 bg-red-500/10 border-red-500/20';
    default:
      return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
  }
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export default function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('Overview');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const { id } = await params;
        const res = await fetch(`/api/v1/clients/${id}`);
        if (!res.ok) throw new Error(`Failed to load client (${res.status})`);
        const data = await res.json();
        setClient(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params]);

  /* Loading */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#00D4AA]" />
          <p className="text-[#829AB1] text-sm">Loading client...</p>
        </div>
      </div>
    );
  }

  /* Error */
  if (error || !client) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-center px-4">
          <AlertCircle className="h-8 w-8 text-red-400" />
          <p className="text-red-400 font-medium">Failed to load client</p>
          <p className="text-[#829AB1] text-sm">{error ?? 'Client not found'}</p>
          <Link
            href="/clients"
            className="mt-2 text-sm text-[#00D4AA] hover:underline flex items-center gap-1"
          >
            <ArrowLeft size={14} />
            Back to clients
          </Link>
        </div>
      </div>
    );
  }

  const contacts = Array.isArray(client.contacts) ? client.contacts : [];
  const goals = Array.isArray(client.goals) ? client.goals : [];
  const activities = Array.isArray(client.activities) ? client.activities : [];
  const services = Array.isArray(client.services) ? client.services : [];
  const notes = Array.isArray(client.notes) ? client.notes : [];

  return (
    <div className="min-h-screen bg-[#050E1A]">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-[#050E1A]/95 backdrop-blur border-b border-[#1A3550]">
        <div className="px-4 md:px-8 py-4">
          {/* Back link */}
          <Link
            href="/clients"
            className="inline-flex items-center gap-1.5 text-sm text-[#829AB1] hover:text-[#F0F4F8] transition-colors mb-3"
          >
            <ArrowLeft size={14} />
            Clients
          </Link>

          {/* Client header row */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <HealthRing score={client.healthScore} />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold text-[#F0F4F8]">{client.name}</h1>
                  <span
                    className={cn(
                      'text-[10px] px-2 py-0.5 rounded-full border font-medium',
                      getStatusColor(client.status),
                    )}
                  >
                    {client.status}
                  </span>
                  {client.tier && <TierBadge tier={client.tier} />}
                </div>
                <p className={cn('text-xs mt-0.5', getHealthColor(client.healthScore))}>
                  {getHealthLabel(client.healthScore)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-[#0B1B2E] rounded-lg border border-[#1A3550] px-4 py-2 text-center">
                <p className="text-xs text-[#829AB1]">MRR</p>
                <p className="text-lg font-bold text-[#00D4AA]">{formatCurrency(client.mrr)}</p>
              </div>
            </div>
          </div>

          {/* Tab navigation */}
          <div className="flex items-center gap-1 mt-4 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors',
                  activeTab === tab
                    ? 'bg-[#00D4AA]/10 text-[#00D4AA]'
                    : 'text-[#829AB1] hover:text-[#F0F4F8] hover:bg-[#0B1B2E]',
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="px-4 md:px-8 py-6 max-w-[1400px] mx-auto">
        {/* ────────────── Overview ────────────── */}
        {activeTab === 'Overview' && (
          <div className="space-y-6">
            {/* Key metrics row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard
                label="Health Score"
                value={client.healthScore}
                icon={HeartPulse}
                color={getHealthColor(client.healthScore)}
              />
              <MetricCard
                label="Engagement"
                value={client.engagementScore}
                icon={TrendingUp}
                color="text-blue-400"
              />
              <MetricCard
                label="Payment Score"
                value={client.paymentScore}
                icon={CreditCard}
                color="text-emerald-400"
              />
              <MetricCard
                label="CSM Pulse"
                value={client.csmPulse}
                icon={Brain}
                color="text-purple-400"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Company info */}
              <div className="bg-[#0B1B2E] rounded-xl border border-[#1A3550] p-5">
                <h3 className="text-sm font-semibold text-[#F0F4F8] mb-4">Company Info</h3>
                <div className="space-y-3">
                  <InfoRow icon={Building2} label="Industry" value={client.industry} />
                  <InfoRow icon={Users} label="Size" value={client.companySize} />
                  <InfoRow icon={Globe} label="Website" value={client.website} isLink />
                  <InfoRow icon={Megaphone} label="Source" value={client.source} />
                </div>
              </div>

              {/* Key dates */}
              <div className="bg-[#0B1B2E] rounded-xl border border-[#1A3550] p-5">
                <h3 className="text-sm font-semibold text-[#F0F4F8] mb-4">Key Dates</h3>
                <div className="space-y-3">
                  <InfoRow
                    icon={Calendar}
                    label="Onboarded"
                    value={client.onboardedAt ? formatDate(client.onboardedAt) : null}
                  />
                  <InfoRow
                    icon={Clock}
                    label="Last Contact"
                    value={client.lastContactAt ? formatDate(client.lastContactAt) : null}
                  />
                  <InfoRow
                    icon={Target}
                    label="Next QBR"
                    value={client.nextQbrDate ? formatDate(client.nextQbrDate) : null}
                  />
                </div>
              </div>
            </div>

            {/* Recent notes */}
            <div className="bg-[#0B1B2E] rounded-xl border border-[#1A3550] p-5">
              <h3 className="text-sm font-semibold text-[#F0F4F8] mb-4 flex items-center gap-2">
                <StickyNote size={14} className="text-[#829AB1]" />
                Recent Notes
              </h3>
              {notes.length === 0 ? (
                <p className="text-sm text-[#829AB1]">No notes yet</p>
              ) : (
                <div className="space-y-3">
                  {notes.slice(0, 5).map((note) => (
                    <div key={note.id} className="border-l-2 border-[#1A3550] pl-3 py-1">
                      <p className="text-sm text-[#F0F4F8] leading-relaxed">{note.content}</p>
                      <p className="text-xs text-[#829AB1] mt-1">{formatDate(note.createdAt)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ────────────── Contacts ────────────── */}
        {activeTab === 'Contacts' && (
          <div>
            {contacts.length === 0 ? (
              <EmptyState icon={Users} message="No contacts found" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="bg-[#0B1B2E] rounded-xl border border-[#1A3550] p-5"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-[#F0F4F8] truncate">
                            {contact.name}
                          </h4>
                          {contact.isPrimary && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#00D4AA]/10 text-[#00D4AA] border border-[#00D4AA]/20 font-medium shrink-0">
                              Primary
                            </span>
                          )}
                        </div>
                        {contact.title && (
                          <p className="text-xs text-[#829AB1] mt-0.5 truncate">{contact.title}</p>
                        )}
                      </div>
                      <span
                        className={cn(
                          'inline-block h-2.5 w-2.5 rounded-full shrink-0 mt-1',
                          getSentimentDot(contact.sentiment),
                        )}
                        title={contact.sentiment ?? 'Unknown'}
                      />
                    </div>
                    <div className="space-y-1.5 mt-3">
                      {contact.email && (
                        <div className="flex items-center gap-2 text-xs text-[#829AB1]">
                          <Mail size={12} className="shrink-0" />
                          <span className="truncate">{contact.email}</span>
                        </div>
                      )}
                      {contact.phone && (
                        <div className="flex items-center gap-2 text-xs text-[#829AB1]">
                          <Phone size={12} className="shrink-0" />
                          <span>{contact.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ────────────── Goals ────────────── */}
        {activeTab === 'Goals' && (
          <div>
            {goals.length === 0 ? (
              <EmptyState icon={Target} message="No goals defined" />
            ) : (
              <div className="space-y-4">
                {goals.map((goal) => {
                  const progress =
                    goal.targetValue && goal.targetValue > 0
                      ? Math.min(
                          Math.round(((goal.currentValue ?? 0) / goal.targetValue) * 100),
                          100,
                        )
                      : 0;

                  return (
                    <div
                      key={goal.id}
                      className="bg-[#0B1B2E] rounded-xl border border-[#1A3550] p-5"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-semibold text-[#F0F4F8]">{goal.title}</h4>
                          {goal.description && (
                            <p className="text-xs text-[#829AB1] mt-0.5">{goal.description}</p>
                          )}
                        </div>
                        <span
                          className={cn(
                            'text-[10px] px-2 py-0.5 rounded-full border font-medium shrink-0 ml-2',
                            getGoalStatusColor(goal.status),
                          )}
                        >
                          {goal.status}
                        </span>
                      </div>

                      {goal.targetValue != null && goal.targetValue > 0 && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs text-[#829AB1] mb-1">
                            <span>
                              {goal.currentValue ?? 0}
                              {goal.unit ? ` ${goal.unit}` : ''} / {goal.targetValue}
                              {goal.unit ? ` ${goal.unit}` : ''}
                            </span>
                            <span className="font-medium text-[#F0F4F8]">{progress}%</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-[#1A3550]">
                            <div
                              className="h-full rounded-full bg-[#00D4AA] transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {goal.dueDate && (
                        <p className="text-xs text-[#829AB1] mt-2 flex items-center gap-1">
                          <Calendar size={10} />
                          Due {formatDate(goal.dueDate)}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ────────────── Activity ────────────── */}
        {activeTab === 'Activity' && (
          <div>
            {activities.length === 0 ? (
              <EmptyState icon={Activity} message="No activity recorded" />
            ) : (
              <div className="space-y-1">
                {activities.map((activity, idx) => {
                  const Icon = getActivityIcon(activity.type);
                  return (
                    <div key={activity.id} className="flex gap-4">
                      {/* Timeline line + icon */}
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-[#0B1B2E] border border-[#1A3550] flex items-center justify-center shrink-0">
                          <Icon size={14} className="text-[#829AB1]" />
                        </div>
                        {idx < activities.length - 1 && (
                          <div className="w-px flex-1 bg-[#1A3550] my-1" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="pb-4 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-[#F0F4F8]">{activity.title}</p>
                          {activity.sentiment && (
                            <span
                              className={cn(
                                'inline-block h-2 w-2 rounded-full',
                                getSentimentDot(activity.sentiment),
                              )}
                              title={activity.sentiment}
                            />
                          )}
                        </div>
                        {activity.description && (
                          <p className="text-xs text-[#829AB1] mt-0.5 line-clamp-2">
                            {activity.description}
                          </p>
                        )}
                        <p className="text-xs text-[#829AB1]/60 mt-1">
                          {formatDate(activity.date)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ────────────── Services ────────────── */}
        {activeTab === 'Services' && (
          <div>
            {services.length === 0 ? (
              <EmptyState icon={Briefcase} message="No services attached" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((svc) => (
                  <div
                    key={svc.id}
                    className="bg-[#0B1B2E] rounded-xl border border-[#1A3550] p-5"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-semibold text-[#F0F4F8]">
                          {svc.serviceName}
                        </h4>
                        <p className="text-xs text-[#829AB1] mt-0.5">{svc.category}</p>
                      </div>
                      <span
                        className={cn(
                          'text-[10px] px-2 py-0.5 rounded-full border font-medium shrink-0 ml-2',
                          getServiceStatusColor(svc.status),
                        )}
                      >
                        {svc.status}
                      </span>
                    </div>
                    {svc.revenue != null && (
                      <div className="flex items-center gap-1.5 mt-3 text-xs">
                        <DollarSign size={12} className="text-[#00D4AA]" />
                        <span className="text-[#F0F4F8] font-medium">
                          {formatCurrency(svc.revenue)}
                        </span>
                        <span className="text-[#829AB1]">/ mo</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
