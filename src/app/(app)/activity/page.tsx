'use client';

import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/layout/Header';
import {
  Phone,
  Mail,
  Users,
  FileText,
  BarChart3,
  Award,
  Star,
  ChevronDown,
  ChevronRight,
  Filter,
  Zap,
  Shield,
  Send,
} from 'lucide-react';
import { cn, formatDate, formatRelativeTime, getSentimentColor } from '@/lib/utils';

// ─── Types ───
interface Activity {
  id: string;
  type: string;
  title: string;
  description: string | null;
  clientName: string | null;
  clientId: string | null;
  contactName: string | null;
  sentiment: string | null;
  date: string;
  duration: number | null;
  outcome: string | null;
  isKeyMoment: boolean;
  isProactive: boolean;
  createdAt: string;
}

interface ClientOption {
  id: string;
  name: string;
}

const ACTIVITY_TYPES = ['Call', 'Email', 'Meeting', 'Note', 'QBR', 'Milestone'] as const;
const SENTIMENTS = ['Positive', 'Neutral', 'Negative'] as const;

// ─── Helpers ───
function getTypeIcon(type: string) {
  switch (type) {
    case 'Call': return Phone;
    case 'Email': return Mail;
    case 'Meeting': return Users;
    case 'Note': return FileText;
    case 'QBR': return BarChart3;
    case 'Milestone': return Award;
    default: return FileText;
  }
}

function getSentimentDot(sentiment: string | null) {
  if (!sentiment) return 'bg-slate-500';
  const map: Record<string, string> = {
    Positive: 'bg-emerald-500',
    Neutral: 'bg-slate-400',
    Negative: 'bg-red-500',
  };
  return map[sentiment] ?? 'bg-slate-500';
}

function groupByDate(activities: Activity[]): Record<string, Activity[]> {
  const groups: Record<string, Activity[]> = {};
  for (const a of activities) {
    const key = formatDate(a.date);
    if (!groups[key]) groups[key] = [];
    groups[key].push(a);
  }
  return groups;
}

export default function ActivityPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [filterType, setFilterType] = useState('');
  const [filterSentiment, setFilterSentiment] = useState('');
  const [filterClient, setFilterClient] = useState('');
  const [filterKeyMoments, setFilterKeyMoments] = useState(false);
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  // Quick-log form
  const [formType, setFormType] = useState('Call');
  const [formTitle, setFormTitle] = useState('');
  const [formClientId, setFormClientId] = useState('');
  const [formSentiment, setFormSentiment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch
  const fetchActivities = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/activities');
      if (res.ok) setActivities(await res.json());
    } catch (e) {
      console.error('Failed to fetch activities', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchClients = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/clients');
      if (res.ok) setClients(await res.json());
    } catch (e) {
      console.error('Failed to fetch clients', e);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
    fetchClients();
  }, [fetchActivities, fetchClients]);

  // Quick-log submit
  const handleQuickLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formType) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: formType,
          title: formTitle,
          clientId: formClientId || null,
          sentiment: formSentiment || null,
        }),
      });
      if (res.ok) {
        const newActivity = await res.json();
        setActivities((prev) => [newActivity, ...prev]);
        setFormTitle('');
        setFormClientId('');
        setFormSentiment('');
      }
    } catch (err) {
      console.error('Failed to log activity', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Filter logic
  const filtered = activities.filter((a) => {
    if (filterType && a.type !== filterType) return false;
    if (filterSentiment && a.sentiment !== filterSentiment) return false;
    if (filterClient && a.clientId !== filterClient) return false;
    if (filterKeyMoments && !a.isKeyMoment) return false;
    if (filterDateFrom && new Date(a.date) < new Date(filterDateFrom)) return false;
    if (filterDateTo && new Date(a.date) > new Date(filterDateTo + 'T23:59:59')) return false;
    return true;
  });

  const grouped = groupByDate(filtered);

  // Metrics
  const now = new Date();
  const thisMonth = activities.filter((a) => {
    const d = new Date(a.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const proactiveCount = thisMonth.filter((a) => a.isProactive).length;
  const reactiveCount = thisMonth.filter((a) => !a.isProactive).length;

  return (
    <div className="min-h-screen bg-[#050E1A]">
      <Header title="Activity" />

      <div className="p-4 md:p-6 space-y-6">
        {/* Metrics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#0B1B2E] rounded-xl border border-[#1A3550] p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#00D4AA]/10">
              <Zap size={20} className="text-[#00D4AA]" />
            </div>
            <div>
              <p className="text-xs text-[#829AB1]">This Month</p>
              <p className="text-lg font-semibold text-[#F0F4F8]">{thisMonth.length}</p>
            </div>
          </div>
          <div className="bg-[#0B1B2E] rounded-xl border border-[#1A3550] p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <Shield size={20} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-[#829AB1]">Proactive</p>
              <p className="text-lg font-semibold text-[#F0F4F8]">{proactiveCount}</p>
            </div>
          </div>
          <div className="bg-[#0B1B2E] rounded-xl border border-[#1A3550] p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/10">
              <BarChart3 size={20} className="text-yellow-400" />
            </div>
            <div>
              <p className="text-xs text-[#829AB1]">Pro/Re Ratio</p>
              <p className="text-lg font-semibold text-[#F0F4F8]">
                {reactiveCount === 0
                  ? proactiveCount > 0
                    ? `${proactiveCount}:0`
                    : '0:0'
                  : `${(proactiveCount / reactiveCount).toFixed(1)}:1`}
              </p>
            </div>
          </div>
        </div>

        {/* Quick-Log Bar */}
        <form
          onSubmit={handleQuickLog}
          className="bg-[#0B1B2E] rounded-xl border border-[#1A3550] p-4 flex flex-wrap items-end gap-3"
        >
          <div className="flex-shrink-0">
            <label className="block text-xs text-[#829AB1] mb-1">Type</label>
            <select
              value={formType}
              onChange={(e) => setFormType(e.target.value)}
              className="bg-[#050E1A] border border-[#1A3550] rounded-lg px-3 py-2 text-sm text-[#F0F4F8] focus:outline-none focus:border-[#00D4AA]/50"
            >
              {ACTIVITY_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs text-[#829AB1] mb-1">Title</label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              required
              placeholder="Activity title..."
              className="w-full bg-[#050E1A] border border-[#1A3550] rounded-lg px-3 py-2 text-sm text-[#F0F4F8] placeholder-[#829AB1]/50 focus:outline-none focus:border-[#00D4AA]/50"
            />
          </div>
          <div className="flex-shrink-0">
            <label className="block text-xs text-[#829AB1] mb-1">Client</label>
            <select
              value={formClientId}
              onChange={(e) => setFormClientId(e.target.value)}
              className="bg-[#050E1A] border border-[#1A3550] rounded-lg px-3 py-2 text-sm text-[#F0F4F8] focus:outline-none focus:border-[#00D4AA]/50"
            >
              <option value="">None</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-shrink-0">
            <label className="block text-xs text-[#829AB1] mb-1">Sentiment</label>
            <select
              value={formSentiment}
              onChange={(e) => setFormSentiment(e.target.value)}
              className="bg-[#050E1A] border border-[#1A3550] rounded-lg px-3 py-2 text-sm text-[#F0F4F8] focus:outline-none focus:border-[#00D4AA]/50"
            >
              <option value="">None</option>
              {SENTIMENTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#00D4AA] text-[#050E1A] text-sm font-medium rounded-lg hover:bg-[#00D4AA]/90 transition-colors disabled:opacity-50"
          >
            <Send size={14} />
            {submitting ? 'Logging...' : 'Log'}
          </button>
        </form>

        {/* Filters */}
        <div className="bg-[#0B1B2E] rounded-xl border border-[#1A3550]">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full flex items-center justify-between p-4 text-sm text-[#829AB1] hover:text-[#F0F4F8] transition-colors"
          >
            <div className="flex items-center gap-2">
              <Filter size={16} />
              <span>Filters</span>
              {(filterType || filterSentiment || filterClient || filterKeyMoments || filterDateFrom || filterDateTo) && (
                <span className="text-xs bg-[#00D4AA]/10 text-[#00D4AA] px-2 py-0.5 rounded-full">Active</span>
              )}
            </div>
            {showFilters ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          {showFilters && (
            <div className="px-4 pb-4 flex flex-wrap gap-3 border-t border-[#1A3550] pt-4">
              <div>
                <label className="block text-xs text-[#829AB1] mb-1">Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-[#050E1A] border border-[#1A3550] rounded-lg px-3 py-1.5 text-sm text-[#F0F4F8] focus:outline-none focus:border-[#00D4AA]/50"
                >
                  <option value="">All</option>
                  {ACTIVITY_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-[#829AB1] mb-1">Sentiment</label>
                <select
                  value={filterSentiment}
                  onChange={(e) => setFilterSentiment(e.target.value)}
                  className="bg-[#050E1A] border border-[#1A3550] rounded-lg px-3 py-1.5 text-sm text-[#F0F4F8] focus:outline-none focus:border-[#00D4AA]/50"
                >
                  <option value="">All</option>
                  {SENTIMENTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-[#829AB1] mb-1">Client</label>
                <select
                  value={filterClient}
                  onChange={(e) => setFilterClient(e.target.value)}
                  className="bg-[#050E1A] border border-[#1A3550] rounded-lg px-3 py-1.5 text-sm text-[#F0F4F8] focus:outline-none focus:border-[#00D4AA]/50"
                >
                  <option value="">All</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-[#829AB1] mb-1">From</label>
                <input
                  type="date"
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                  className="bg-[#050E1A] border border-[#1A3550] rounded-lg px-3 py-1.5 text-sm text-[#F0F4F8] focus:outline-none focus:border-[#00D4AA]/50"
                />
              </div>
              <div>
                <label className="block text-xs text-[#829AB1] mb-1">To</label>
                <input
                  type="date"
                  value={filterDateTo}
                  onChange={(e) => setFilterDateTo(e.target.value)}
                  className="bg-[#050E1A] border border-[#1A3550] rounded-lg px-3 py-1.5 text-sm text-[#F0F4F8] focus:outline-none focus:border-[#00D4AA]/50"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer pb-1.5">
                  <input
                    type="checkbox"
                    checked={filterKeyMoments}
                    onChange={(e) => setFilterKeyMoments(e.target.checked)}
                    className="accent-[#00D4AA]"
                  />
                  <span className="text-sm text-[#829AB1]">Key Moments Only</span>
                </label>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilterType('');
                    setFilterSentiment('');
                    setFilterClient('');
                    setFilterKeyMoments(false);
                    setFilterDateFrom('');
                    setFilterDateTo('');
                  }}
                  className="text-xs text-[#829AB1] hover:text-[#00D4AA] transition-colors pb-1.5"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Timeline */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-[#00D4AA] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-[#0B1B2E] rounded-xl border border-[#1A3550] p-12 text-center text-[#829AB1]">
            No activities found. Use the quick-log bar above to record one.
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([dateLabel, items]) => (
              <div key={dateLabel}>
                <h3 className="text-xs font-medium text-[#829AB1] uppercase tracking-wider mb-3 px-1">
                  {dateLabel}
                </h3>
                <div className="space-y-2">
                  {items.map((activity) => {
                    const Icon = getTypeIcon(activity.type);
                    const expanded = expandedId === activity.id;
                    return (
                      <div
                        key={activity.id}
                        className="bg-[#0B1B2E] rounded-xl border border-[#1A3550] transition-colors hover:border-[#1A3550]/80"
                      >
                        <button
                          onClick={() => setExpandedId(expanded ? null : activity.id)}
                          className="w-full p-4 flex items-start gap-3 text-left"
                        >
                          {/* Type icon */}
                          <div className="p-2 rounded-lg bg-[#1A3550]/50 shrink-0 mt-0.5">
                            <Icon size={16} className="text-[#829AB1]" />
                          </div>

                          {/* Sentiment dot */}
                          <div className={cn('w-2 h-2 rounded-full mt-2.5 shrink-0', getSentimentDot(activity.sentiment))} />

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium text-[#F0F4F8]">{activity.title}</span>
                              {activity.isKeyMoment && (
                                <Star size={14} className="text-yellow-400 fill-yellow-400 shrink-0" />
                              )}
                              <span
                                className={cn(
                                  'text-xs px-2 py-0.5 rounded-full',
                                  activity.isProactive
                                    ? 'bg-emerald-500/10 text-emerald-400'
                                    : 'bg-orange-500/10 text-orange-400'
                                )}
                              >
                                {activity.isProactive ? 'Proactive' : 'Reactive'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-xs text-[#829AB1]">
                              {activity.clientName && (
                                <span className="text-[#00D4AA] hover:underline">{activity.clientName}</span>
                              )}
                              <span>{formatRelativeTime(activity.date)}</span>
                              {activity.sentiment && (
                                <span className={getSentimentColor(activity.sentiment)}>
                                  {activity.sentiment}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Expand icon */}
                          <div className="shrink-0 mt-1">
                            {expanded ? (
                              <ChevronDown size={16} className="text-[#829AB1]" />
                            ) : (
                              <ChevronRight size={16} className="text-[#829AB1]" />
                            )}
                          </div>
                        </button>

                        {/* Expanded detail */}
                        {expanded && (
                          <div className="px-4 pb-4 ml-[52px] border-t border-[#1A3550] pt-3 space-y-2 text-sm">
                            {activity.description && (
                              <div>
                                <span className="text-xs text-[#829AB1]">Description:</span>
                                <p className="text-[#F0F4F8] mt-0.5">{activity.description}</p>
                              </div>
                            )}
                            {activity.outcome && (
                              <div>
                                <span className="text-xs text-[#829AB1]">Outcome:</span>
                                <p className="text-[#F0F4F8] mt-0.5">{activity.outcome}</p>
                              </div>
                            )}
                            {activity.duration != null && (
                              <div>
                                <span className="text-xs text-[#829AB1]">Duration:</span>
                                <span className="text-[#F0F4F8] ml-2">{activity.duration} min</span>
                              </div>
                            )}
                            {activity.contactName && (
                              <div>
                                <span className="text-xs text-[#829AB1]">Contact:</span>
                                <span className="text-[#F0F4F8] ml-2">{activity.contactName}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
