'use client';

import { useState, useEffect, useMemo, FormEvent } from 'react';
import {
  Clock,
  Plus,
  DollarSign,
  TrendingUp,
  BarChart3,
  Filter,
  X,
} from 'lucide-react';
import { cn, formatCurrency, formatDate } from '@/lib/utils';

interface TimeEntry {
  id: string;
  description: string;
  hours: number;
  rate: number;
  date: string;
  category: string;
  clientId: string;
  clientName: string;
  billable: boolean;
  invoiceId: string | null;
}

const categories = ['Strategy', 'Delivery', 'Admin', 'Meeting', 'QBR', 'Business Dev'];

export default function TimePage() {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Filters
  const [filterClient, setFilterClient] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterBillable, setFilterBillable] = useState<'' | 'true' | 'false'>('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  // Form state
  const [formClient, setFormClient] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formHours, setFormHours] = useState('1.00');
  const [formRate, setFormRate] = useState('150');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formCategory, setFormCategory] = useState('Strategy');
  const [formBillable, setFormBillable] = useState(true);

  useEffect(() => {
    fetch('/api/v1/time-entries')
      .then((r) => r.json())
      .then((data) => {
        setEntries(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const clients = useMemo(() => {
    const map = new Map<string, string>();
    entries.forEach((e) => {
      if (e.clientId && e.clientName) map.set(e.clientId, e.clientName);
    });
    return Array.from(map, ([id, name]) => ({ id, name }));
  }, [entries]);

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (filterClient && e.clientId !== filterClient) return false;
      if (filterCategory && e.category !== filterCategory) return false;
      if (filterBillable === 'true' && !e.billable) return false;
      if (filterBillable === 'false' && e.billable) return false;
      if (filterDateFrom && e.date < filterDateFrom) return false;
      if (filterDateTo && e.date > filterDateTo) return false;
      return true;
    });
  }, [entries, filterClient, filterCategory, filterBillable, filterDateFrom, filterDateTo]);

  // Group by date
  const grouped = useMemo(() => {
    const map = new Map<string, TimeEntry[]>();
    const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date));
    sorted.forEach((e) => {
      const key = e.date;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    });
    return Array.from(map);
  }, [filtered]);

  // Summary stats (this week)
  const stats = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const weekEntries = entries.filter((e) => new Date(e.date) >= startOfWeek);

    const totalHours = weekEntries.reduce((s, e) => s + e.hours, 0);
    const totalRevenue = weekEntries.reduce((s, e) => s + e.hours * e.rate, 0);
    const billableHours = weekEntries.filter((e) => e.billable).reduce((s, e) => s + e.hours, 0);
    const billableRatio = totalHours > 0 ? Math.round((billableHours / totalHours) * 100) : 0;
    const avgRate =
      billableHours > 0
        ? Math.round(
            weekEntries.filter((e) => e.billable).reduce((s, e) => s + e.hours * e.rate, 0) /
              billableHours
          )
        : 0;

    return { totalHours, totalRevenue, billableRatio, avgRate };
  }, [entries]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const payload = {
      clientId: formClient || undefined,
      description: formDescription,
      hours: parseFloat(formHours),
      rate: parseFloat(formRate),
      date: formDate,
      category: formCategory,
      billable: formBillable,
    };
    try {
      const res = await fetch('/api/v1/time-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const entry = await res.json();
      setEntries((prev) => [entry, ...prev]);
      setShowForm(false);
      setFormDescription('');
      setFormHours('1.00');
    } catch {
      // handle error silently
    }
  }

  const statCards = [
    { label: 'Hours This Week', value: stats.totalHours.toFixed(1), icon: Clock },
    { label: 'Revenue This Week', value: formatCurrency(stats.totalRevenue), icon: DollarSign },
    { label: 'Billable Ratio', value: `${stats.billableRatio}%`, icon: TrendingUp },
    { label: 'Average Rate', value: formatCurrency(stats.avgRate), icon: BarChart3 },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="text-[#00D4AA]" size={24} />
          <h1 className="text-2xl font-semibold text-[#F0F4F8]">Time Tracking</h1>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-[#00D4AA] text-[#050E1A] rounded-lg text-sm font-medium hover:bg-[#00D4AA]/90 transition-colors"
        >
          <Plus size={16} />
          Log Time
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-[#0B1B2E] rounded-xl border border-[#1A3550] p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon size={16} className="text-[#829AB1]" />
                <span className="text-xs text-[#829AB1]">{stat.label}</span>
              </div>
              <p className="text-xl font-semibold text-[#F0F4F8]">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Add Entry Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-[#0B1B2E] rounded-xl border border-[#1A3550] p-6 space-y-4"
        >
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-medium text-[#F0F4F8]">Log Time Entry</h2>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-[#829AB1] hover:text-[#F0F4F8]"
            >
              <X size={16} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <select
              value={formClient}
              onChange={(e) => setFormClient(e.target.value)}
              className="bg-[#050E1A] border border-[#1A3550] rounded-lg px-3 py-2 text-sm text-[#F0F4F8] outline-none"
            >
              <option value="">Select client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Description"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="bg-[#050E1A] border border-[#1A3550] rounded-lg px-3 py-2 text-sm text-[#F0F4F8] placeholder-[#829AB1]/50 outline-none"
              required
            />
            <input
              type="number"
              step="0.25"
              min="0.25"
              value={formHours}
              onChange={(e) => setFormHours(e.target.value)}
              className="bg-[#050E1A] border border-[#1A3550] rounded-lg px-3 py-2 text-sm text-[#F0F4F8] outline-none"
              required
            />
            <input
              type="number"
              step="1"
              min="0"
              value={formRate}
              onChange={(e) => setFormRate(e.target.value)}
              className="bg-[#050E1A] border border-[#1A3550] rounded-lg px-3 py-2 text-sm text-[#F0F4F8] outline-none"
              required
            />
            <input
              type="date"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              className="bg-[#050E1A] border border-[#1A3550] rounded-lg px-3 py-2 text-sm text-[#F0F4F8] outline-none"
              required
            />
            <select
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value)}
              className="bg-[#050E1A] border border-[#1A3550] rounded-lg px-3 py-2 text-sm text-[#F0F4F8] outline-none"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <button
                type="button"
                onClick={() => setFormBillable(!formBillable)}
                className={cn(
                  'w-10 h-5 rounded-full transition-colors relative',
                  formBillable ? 'bg-[#00D4AA]' : 'bg-[#1A3550]'
                )}
              >
                <span
                  className={cn(
                    'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform',
                    formBillable ? 'left-5' : 'left-0.5'
                  )}
                />
              </button>
              <span className="text-sm text-[#829AB1]">Billable</span>
            </label>
            <button
              type="submit"
              className="px-6 py-2 bg-[#00D4AA] text-[#050E1A] rounded-lg text-sm font-medium hover:bg-[#00D4AA]/90 transition-colors"
            >
              Save Entry
            </button>
          </div>
        </form>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <Filter size={16} className="text-[#829AB1]" />
        <select
          value={filterClient}
          onChange={(e) => setFilterClient(e.target.value)}
          className="bg-[#0B1B2E] border border-[#1A3550] rounded-md px-2 py-1.5 text-sm text-[#F0F4F8] outline-none"
        >
          <option value="">All Clients</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="bg-[#0B1B2E] border border-[#1A3550] rounded-md px-2 py-1.5 text-sm text-[#F0F4F8] outline-none"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={filterBillable}
          onChange={(e) => setFilterBillable(e.target.value as '' | 'true' | 'false')}
          className="bg-[#0B1B2E] border border-[#1A3550] rounded-md px-2 py-1.5 text-sm text-[#F0F4F8] outline-none"
        >
          <option value="">All</option>
          <option value="true">Billable</option>
          <option value="false">Non-billable</option>
        </select>
        <input
          type="date"
          value={filterDateFrom}
          onChange={(e) => setFilterDateFrom(e.target.value)}
          placeholder="From"
          className="bg-[#0B1B2E] border border-[#1A3550] rounded-md px-2 py-1.5 text-sm text-[#F0F4F8] outline-none"
        />
        <input
          type="date"
          value={filterDateTo}
          onChange={(e) => setFilterDateTo(e.target.value)}
          placeholder="To"
          className="bg-[#0B1B2E] border border-[#1A3550] rounded-md px-2 py-1.5 text-sm text-[#F0F4F8] outline-none"
        />
      </div>

      {/* Entries grouped by date */}
      {loading ? (
        <div className="bg-[#0B1B2E] rounded-xl border border-[#1A3550] p-8 text-center text-[#829AB1]">
          Loading time entries...
        </div>
      ) : grouped.length === 0 ? (
        <div className="bg-[#0B1B2E] rounded-xl border border-[#1A3550] p-8 text-center text-[#829AB1]">
          No time entries found.
        </div>
      ) : (
        grouped.map(([date, dayEntries]) => {
          const dayTotal = dayEntries.reduce((s, e) => s + e.hours, 0);
          const dayRevenue = dayEntries.reduce((s, e) => s + e.hours * e.rate, 0);
          return (
            <div key={date} className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-medium text-[#829AB1]">
                  {formatDate(date)}
                </h3>
                <div className="flex items-center gap-4 text-xs text-[#829AB1]">
                  <span>{dayTotal.toFixed(1)}h</span>
                  <span>{formatCurrency(dayRevenue)}</span>
                </div>
              </div>
              <div className="bg-[#0B1B2E] rounded-xl border border-[#1A3550] divide-y divide-[#1A3550]">
                {dayEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center gap-4 px-4 py-3 hover:bg-[#1A3550]/30 transition-colors"
                  >
                    <span className="flex-1 text-sm text-[#F0F4F8] truncate">
                      {entry.description}
                    </span>
                    <span className="text-xs text-[#829AB1] shrink-0">
                      {entry.clientName}
                    </span>
                    <span className="text-sm font-medium text-[#F0F4F8] shrink-0 w-12 text-right">
                      {entry.hours.toFixed(2)}h
                    </span>
                    <span className="text-xs text-[#829AB1] shrink-0 w-16 text-right">
                      @{formatCurrency(entry.rate)}
                    </span>
                    <span className="text-sm font-medium text-[#00D4AA] shrink-0 w-20 text-right">
                      {formatCurrency(entry.hours * entry.rate)}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#1A3550]/50 text-[#829AB1] border border-[#1A3550] shrink-0">
                      {entry.category}
                    </span>
                    {entry.billable ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#00D4AA]/10 text-[#00D4AA] border border-[#00D4AA]/20 shrink-0">
                        Billable
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20 shrink-0">
                        Non-billable
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
