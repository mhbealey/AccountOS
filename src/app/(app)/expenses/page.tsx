'use client';

import { useEffect, useState } from 'react';
import {
  DollarSign,
  Plus,
  X,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Calendar,
  Trash2,
  Tag,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Expense {
  id: string;
  title: string;
  amount: number;
  frequency: string;
  category: string | null;
  startDate: string | null;
  endDate: string | null;
  notes: string | null;
  createdAt: string;
}

const frequencyColors: Record<string, string> = {
  monthly: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  quarterly: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  annual: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'one-time': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
};

const categoryColors: Record<string, string> = {
  Software: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Office: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Marketing: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  Travel: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  Insurance: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  Utilities: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  Subscriptions: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  Other: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

const frequencies = ['monthly', 'quarterly', 'annual', 'one-time'];
const categories = ['Software', 'Office', 'Marketing', 'Travel', 'Insurance', 'Utilities', 'Subscriptions', 'Other'];

const emptyForm = {
  title: '',
  amount: '',
  frequency: 'monthly',
  category: '',
  notes: '',
  startDate: '',
  endDate: '',
};

function toMonthly(amount: number, frequency: string): number {
  switch (frequency) {
    case 'monthly': return amount;
    case 'quarterly': return amount / 3;
    case 'annual': return amount / 12;
    case 'one-time': return 0;
    default: return amount;
  }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    async function fetchExpenses() {
      try {
        setLoading(true);
        const res = await fetch('/api/v1/expenses');
        if (!res.ok) throw new Error(`Failed to load expenses (${res.status})`);
        const json = await res.json();
        setExpenses(Array.isArray(json) ? json : json.expenses ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    }
    fetchExpenses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        amount: parseFloat(form.amount),
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        category: form.category || undefined,
        notes: form.notes || undefined,
      };
      const res = await fetch('/api/v1/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to create expense');
      const created = await res.json();
      setExpenses((prev) => [created, ...prev]);
      setShowForm(false);
      setForm(emptyForm);
    } catch {
      // silently handle
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/expenses/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete expense');
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    } catch {
      // silently handle
    }
  };

  // Compute summaries
  const totalMonthly = expenses.reduce((sum, exp) => sum + toMonthly(exp.amount, exp.frequency), 0);
  const totalAnnual = totalMonthly * 12;

  const categoryBreakdown: Record<string, number> = {};
  expenses.forEach((exp) => {
    const cat = exp.category || 'Uncategorized';
    categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + toMonthly(exp.amount, exp.frequency);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#00D4AA]" />
          <p className="text-[#829AB1] text-sm">Loading expenses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-center px-4">
          <AlertCircle className="h-8 w-8 text-red-400" />
          <p className="text-red-400 font-medium">Failed to load expenses</p>
          <p className="text-[#829AB1] text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F0F4F8]">Expenses</h1>
          <p className="text-[#829AB1] text-sm mt-1">Track your recurring and one-time expenses</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-[#00D4AA] text-[#050E1A] rounded-lg font-medium text-sm hover:bg-[#00D4AA]/90 transition-colors"
        >
          {showForm ? <ChevronUp size={16} /> : <Plus size={16} />}
          {showForm ? 'Close' : 'Add Expense'}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0B1B2E] rounded-xl border border-[#1A3550] p-5">
          <p className="text-[#829AB1] text-xs uppercase tracking-wider mb-1">Total Monthly</p>
          <p className="text-2xl font-bold text-[#00D4AA]">{formatCurrency(totalMonthly)}</p>
        </div>
        <div className="bg-[#0B1B2E] rounded-xl border border-[#1A3550] p-5">
          <p className="text-[#829AB1] text-xs uppercase tracking-wider mb-1">Total Annual</p>
          <p className="text-2xl font-bold text-[#F0F4F8]">{formatCurrency(totalAnnual)}</p>
        </div>
        {Object.entries(categoryBreakdown)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 2)
          .map(([cat, amount]) => (
            <div key={cat} className="bg-[#0B1B2E] rounded-xl border border-[#1A3550] p-5">
              <p className="text-[#829AB1] text-xs uppercase tracking-wider mb-1">{cat}</p>
              <p className="text-2xl font-bold text-[#F0F4F8]">{formatCurrency(amount)}<span className="text-sm text-[#829AB1] font-normal">/mo</span></p>
            </div>
          ))}
      </div>

      {/* Category Breakdown */}
      {Object.keys(categoryBreakdown).length > 0 && (
        <div className="bg-[#0B1B2E] rounded-xl border border-[#1A3550] p-5">
          <h2 className="text-sm font-semibold text-[#F0F4F8] mb-3">Category Breakdown (Monthly)</h2>
          <div className="space-y-2">
            {Object.entries(categoryBreakdown)
              .sort((a, b) => b[1] - a[1])
              .map(([cat, amount]) => (
                <div key={cat} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-full text-xs font-medium border',
                        categoryColors[cat] ?? categoryColors.Other
                      )}
                    >
                      {cat}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-1.5 bg-[#1A3550] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#00D4AA] rounded-full"
                        style={{ width: `${totalMonthly > 0 ? (amount / totalMonthly) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-sm text-[#F0F4F8] w-24 text-right">{formatCurrency(amount)}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Add Expense Form (collapsible) */}
      {showForm && (
        <div className="bg-[#0B1B2E] rounded-xl border border-[#1A3550] p-6">
          <h2 className="text-lg font-semibold text-[#F0F4F8] mb-4">New Expense</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-[#829AB1] block mb-1">Title</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 bg-[#050E1A] border border-[#1A3550] rounded-lg text-[#F0F4F8] text-sm focus:outline-none focus:border-[#00D4AA]/50"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-[#829AB1] block mb-1">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="w-full px-3 py-2 bg-[#050E1A] border border-[#1A3550] rounded-lg text-[#F0F4F8] text-sm focus:outline-none focus:border-[#00D4AA]/50"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-[#829AB1] block mb-1">Frequency</label>
                <select
                  value={form.frequency}
                  onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                  className="w-full px-3 py-2 bg-[#050E1A] border border-[#1A3550] rounded-lg text-[#F0F4F8] text-sm focus:outline-none focus:border-[#00D4AA]/50"
                >
                  {frequencies.map((f) => (
                    <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-[#829AB1] block mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 bg-[#050E1A] border border-[#1A3550] rounded-lg text-[#F0F4F8] text-sm focus:outline-none focus:border-[#00D4AA]/50"
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-[#829AB1] block mb-1">Start Date</label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="w-full px-3 py-2 bg-[#050E1A] border border-[#1A3550] rounded-lg text-[#F0F4F8] text-sm focus:outline-none focus:border-[#00D4AA]/50"
                />
              </div>
              <div>
                <label className="text-sm text-[#829AB1] block mb-1">End Date</label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className="w-full px-3 py-2 bg-[#050E1A] border border-[#1A3550] rounded-lg text-[#F0F4F8] text-sm focus:outline-none focus:border-[#00D4AA]/50"
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-[#829AB1] block mb-1">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 bg-[#050E1A] border border-[#1A3550] rounded-lg text-[#F0F4F8] text-sm focus:outline-none focus:border-[#00D4AA]/50 resize-none"
                placeholder="Optional notes..."
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm text-[#829AB1] hover:text-[#F0F4F8] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#00D4AA] text-[#050E1A] rounded-lg font-medium text-sm hover:bg-[#00D4AA]/90 transition-colors"
              >
                Add Expense
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Expense Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {expenses.map((expense) => (
          <div
            key={expense.id}
            className="bg-[#0B1B2E] rounded-xl border border-[#1A3550] p-5 space-y-3 hover:border-[#00D4AA]/30 transition-colors group"
          >
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <h3 className="text-[#F0F4F8] font-semibold truncate">{expense.title}</h3>
                <p className="text-xl font-bold text-[#00D4AA] mt-1">{formatCurrency(expense.amount)}</p>
              </div>
              <button
                onClick={() => handleDelete(expense.id)}
                className="text-[#829AB1] hover:text-red-400 shrink-0 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={cn(
                  'px-2 py-0.5 rounded-full text-xs font-medium border',
                  frequencyColors[expense.frequency] ?? frequencyColors.monthly
                )}
              >
                {expense.frequency}
              </span>
              {expense.category && (
                <span
                  className={cn(
                    'px-2 py-0.5 rounded-full text-xs font-medium border',
                    categoryColors[expense.category] ?? categoryColors.Other
                  )}
                >
                  {expense.category}
                </span>
              )}
            </div>

            {(expense.startDate || expense.endDate) && (
              <div className="flex items-center gap-1.5 text-sm text-[#829AB1]">
                <Calendar size={14} />
                <span>
                  {expense.startDate ? formatDate(expense.startDate) : 'N/A'}
                  {' - '}
                  {expense.endDate ? formatDate(expense.endDate) : 'Ongoing'}
                </span>
              </div>
            )}

            {expense.notes && (
              <div className="bg-[#050E1A] rounded-lg p-3 border border-[#1A3550]/50">
                <p className="text-[#829AB1] text-xs line-clamp-2 whitespace-pre-wrap">{expense.notes}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {expenses.length === 0 && (
        <div className="text-center py-12">
          <DollarSign className="h-12 w-12 text-[#829AB1]/30 mx-auto mb-3" />
          <p className="text-[#829AB1]">No expenses found</p>
        </div>
      )}
    </div>
  );
}
