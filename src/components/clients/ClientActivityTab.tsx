'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDate, formatDateTime } from '@/lib/utils';
import type { Activity, ActivityTypeLiteral, SentimentLiteral } from '@/types';
import {
  Plus,
  Phone,
  Mail,
  MailOpen,
  Video,
  StickyNote,
  BarChart3,
  Flag,
  Gift,
  UserPlus,
  Send,
  FileSignature,
  PlayCircle,
  MessageCircle,
  Star,
  Pencil,
  Trash2,
  Activity as ActivityIcon,
  Filter,
} from 'lucide-react';

const ACTIVITY_TYPES: { value: ActivityTypeLiteral; label: string }[] = [
  { value: 'call', label: 'Call' },
  { value: 'email_sent', label: 'Email Sent' },
  { value: 'email_received', label: 'Email Received' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'note', label: 'Note' },
  { value: 'qbr', label: 'QBR' },
  { value: 'milestone', label: 'Milestone' },
  { value: 'gift', label: 'Gift' },
  { value: 'referral_given', label: 'Referral Given' },
  { value: 'referral_received', label: 'Referral Received' },
  { value: 'proposal_sent', label: 'Proposal Sent' },
  { value: 'contract_signed', label: 'Contract Signed' },
  { value: 'onboarding_step', label: 'Onboarding Step' },
  { value: 'check_in', label: 'Check In' },
];

const SENTIMENT_OPTIONS: SentimentLiteral[] = ['Positive', 'Neutral', 'Negative', 'Unknown'];

function getActivityIcon(type: ActivityTypeLiteral) {
  const cls = 'h-4 w-4';
  switch (type) {
    case 'call': return <Phone className={cls} />;
    case 'email_sent': return <Mail className={cls} />;
    case 'email_received': return <MailOpen className={cls} />;
    case 'meeting': return <Video className={cls} />;
    case 'note': return <StickyNote className={cls} />;
    case 'qbr': return <BarChart3 className={cls} />;
    case 'milestone': return <Flag className={cls} />;
    case 'gift': return <Gift className={cls} />;
    case 'referral_given': case 'referral_received': return <UserPlus className={cls} />;
    case 'proposal_sent': return <Send className={cls} />;
    case 'contract_signed': return <FileSignature className={cls} />;
    case 'onboarding_step': return <PlayCircle className={cls} />;
    case 'check_in': return <MessageCircle className={cls} />;
    default: return <ActivityIcon className={cls} />;
  }
}

function getSentimentColor(sentiment: string | null) {
  switch (sentiment) {
    case 'Positive': return 'text-emerald-400';
    case 'Negative': return 'text-red-400';
    case 'Neutral': return 'text-yellow-400';
    default: return 'text-slate-500';
  }
}

interface ClientActivityTabProps {
  activities: Activity[];
  clientId: string;
  onRefresh: () => void;
}

export function ClientActivityTab({ activities, clientId, onRefresh }: ClientActivityTabProps) {
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  const [form, setForm] = useState({
    type: 'note' as ActivityTypeLiteral,
    title: '',
    description: '',
    sentiment: 'Neutral' as SentimentLiteral,
    isKeyMoment: false,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const filtered = useMemo(() => {
    let list = [...activities];
    if (typeFilter) {
      list = list.filter((a) => a.type === typeFilter);
    }
    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return list;
  }, [activities, typeFilter]);

  const grouped = useMemo(() => {
    const groups: Record<string, Activity[]> = {};
    for (const a of filtered) {
      const day = formatDate(a.date);
      if (!groups[day]) groups[day] = [];
      groups[day].push(a);
    }
    return Object.entries(groups);
  }, [filtered]);

  const resetForm = () => {
    setForm({ type: 'note', title: '', description: '', sentiment: 'Neutral', isKeyMoment: false });
    setFormErrors({});
    setEditingActivity(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      const payload = {
        type: form.type,
        title: form.title.trim(),
        description: form.description || null,
        sentiment: form.sentiment,
        isKeyMoment: form.isKeyMoment,
        clientId,
        date: new Date().toISOString(),
      };

      if (editingActivity) {
        const res = await fetch(`/api/activities/${editingActivity.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to update activity');
      } else {
        const res = await fetch('/api/activities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to create activity');
      }
      resetForm();
      setShowForm(false);
      onRefresh();
    } catch {
      setFormErrors({ _form: 'Failed to save activity.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this activity?')) return;
    try {
      await fetch(`/api/activities/${id}`, { method: 'DELETE' });
      onRefresh();
    } catch {
      // silent fail
    }
  };

  const startEdit = (activity: Activity) => {
    setEditingActivity(activity);
    setForm({
      type: activity.type,
      title: activity.title,
      description: activity.description ?? '',
      sentiment: activity.sentiment ?? 'Neutral',
      isKeyMoment: activity.isKeyMoment,
    });
    setShowForm(true);
  };

  return (
    <div className="space-y-4">
      {/* Quick-log form toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-44"
          >
            <option value="">All types</option>
            {ACTIVITY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </Select>
        </div>
        <Button
          size="sm"
          onClick={() => { resetForm(); setShowForm(!showForm); }}
        >
          <Plus className="h-3.5 w-3.5" />
          Log Activity
        </Button>
      </div>

      {/* Quick-log form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-border bg-[#12122a] p-4 space-y-3"
        >
          {formErrors._form && <p className="text-sm text-red-400">{formErrors._form}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="act-type">Type</Label>
              <Select
                id="act-type"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as ActivityTypeLiteral })}
              >
                {ACTIVITY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="act-title">Title *</Label>
              <Input
                id="act-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Quick summary..."
              />
              {formErrors.title && <p className="text-xs text-red-400">{formErrors.title}</p>}
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="act-desc">Description</Label>
            <Textarea
              id="act-desc"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
            />
          </div>
          <div className="flex items-end gap-4">
            <div className="space-y-1">
              <Label htmlFor="act-sentiment">Sentiment</Label>
              <Select
                id="act-sentiment"
                value={form.sentiment}
                onChange={(e) => setForm({ ...form, sentiment: e.target.value as SentimentLiteral })}
                className="w-32"
              >
                {SENTIMENT_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Select>
            </div>
            <div className="flex items-center gap-2 pb-2">
              <Checkbox
                checked={form.isKeyMoment}
                onCheckedChange={(checked) => setForm({ ...form, isKeyMoment: checked })}
              />
              <Label className="cursor-pointer text-xs">Key Moment</Label>
            </div>
            <div className="flex gap-2 ml-auto pb-0.5">
              <Button type="button" variant="outline" size="sm" onClick={() => { resetForm(); setShowForm(false); }}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={submitting}>
                {submitting ? 'Saving...' : editingActivity ? 'Update' : 'Log'}
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* Timeline */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<ActivityIcon className="h-7 w-7" />}
          title="No activity recorded"
          description="Log your first interaction with this client."
        />
      ) : (
        <div className="space-y-6">
          {grouped.map(([dateLabel, items]) => (
            <div key={dateLabel}>
              <div className="sticky top-0 z-10 mb-2">
                <span className="text-xs font-semibold text-muted-foreground bg-background px-2 py-0.5 rounded">
                  {dateLabel}
                </span>
              </div>
              <div className="space-y-2 ml-2 border-l border-border pl-4">
                {items.map((activity) => (
                  <div
                    key={activity.id}
                    className={`relative rounded-lg border p-3 ${
                      activity.isKeyMoment
                        ? 'border-yellow-500/40 bg-yellow-500/5'
                        : 'border-border bg-[#12122a]'
                    }`}
                  >
                    <div className="absolute -left-[1.35rem] top-3.5 h-2.5 w-2.5 rounded-full border-2 border-border bg-secondary" />
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="text-muted-foreground">
                          {getActivityIcon(activity.type)}
                        </div>
                        <span className="font-medium text-sm text-foreground">
                          {activity.title}
                        </span>
                        {activity.isKeyMoment && (
                          <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                        )}
                        {activity.sentiment && (
                          <span className={`text-xs ${getSentimentColor(activity.sentiment)}`}>
                            {activity.sentiment}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground mr-1">
                          {formatDateTime(activity.date)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => startEdit(activity)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-red-400 hover:text-red-300"
                          onClick={() => handleDelete(activity.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    {activity.description && (
                      <p className="mt-1 text-xs text-muted-foreground ml-6">
                        {activity.description}
                      </p>
                    )}
                    <div className="mt-1 ml-6">
                      <Badge variant="default" className="text-[10px]">
                        {ACTIVITY_TYPES.find((t) => t.value === activity.type)?.label ?? activity.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
