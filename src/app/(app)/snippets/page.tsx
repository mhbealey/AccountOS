'use client';

import { useEffect, useState } from 'react';
import {
  BookOpen,
  Plus,
  X,
  Loader2,
  AlertCircle,
  Search,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Tag,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Snippet {
  id: string;
  title: string;
  category: string;
  content: string;
  tags: string | null;
  createdAt: string;
}

const categoryColors: Record<string, string> = {
  'Sales': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'Technical': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Legal': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Finance': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'Marketing': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  'Onboarding': 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  'Process': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  'Other': 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

const snippetCategories = ['Sales', 'Technical', 'Legal', 'Finance', 'Marketing', 'Onboarding', 'Process', 'Other'];

const emptyForm = {
  title: '',
  category: 'Other',
  content: '',
  tags: '',
};

export default function SnippetsPage() {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSnippets() {
      try {
        setLoading(true);
        const res = await fetch('/api/v1/snippets');
        if (!res.ok) throw new Error(`Failed to load snippets (${res.status})`);
        const json = await res.json();
        setSnippets(Array.isArray(json) ? json : json.snippets ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    }
    fetchSnippets();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        tags: form.tags || undefined,
      };
      const res = await fetch('/api/v1/snippets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to create snippet');
      const created = await res.json();
      setSnippets((prev) => [created, ...prev]);
      setShowModal(false);
      setForm(emptyForm);
    } catch {
      // silently handle
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/snippets/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete snippet');
      setSnippets((prev) => prev.filter((s) => s.id !== id));
      if (expandedId === id) setExpandedId(null);
    } catch {
      // silently handle
    }
  };

  const copyToClipboard = async (snippet: Snippet) => {
    try {
      await navigator.clipboard.writeText(snippet.content);
      setCopiedId(snippet.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // silently handle
    }
  };

  const parseTags = (tags: string | null): string[] => {
    if (!tags) return [];
    return tags.split(',').map((t) => t.trim()).filter(Boolean);
  };

  const filtered = snippets.filter((s) => {
    const matchesSearch =
      !search ||
      s.title?.toLowerCase().includes(search.toLowerCase()) ||
      s.content?.toLowerCase().includes(search.toLowerCase()) ||
      s.tags?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || s.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const allCategories = ['All', ...snippetCategories];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#00D4AA]" />
          <p className="text-[#829AB1] text-sm">Loading snippets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-center px-4">
          <AlertCircle className="h-8 w-8 text-red-400" />
          <p className="text-red-400 font-medium">Failed to load snippets</p>
          <p className="text-[#829AB1] text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F0F4F8]">Knowledge Base</h1>
          <p className="text-[#829AB1] text-sm mt-1">Reusable snippets and reference content</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#00D4AA] text-[#050E1A] rounded-lg font-medium text-sm hover:bg-[#00D4AA]/90 transition-colors"
        >
          <Plus size={16} />
          Add Snippet
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#829AB1]" />
          <input
            type="text"
            placeholder="Search snippets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#0B1B2E] border border-[#1A3550] rounded-lg text-[#F0F4F8] text-sm placeholder:text-[#829AB1]/50 focus:outline-none focus:border-[#00D4AA]/50"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {allCategories.map((c) => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                categoryFilter === c
                  ? 'bg-[#00D4AA]/10 text-[#00D4AA] border border-[#00D4AA]/30'
                  : 'bg-[#0B1B2E] text-[#829AB1] border border-[#1A3550] hover:border-[#829AB1]/30'
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Snippet Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((snippet) => {
          const isExpanded = expandedId === snippet.id;
          const tags = parseTags(snippet.tags);
          return (
            <div
              key={snippet.id}
              className="bg-[#0B1B2E] rounded-xl border border-[#1A3550] p-5 space-y-3 hover:border-[#00D4AA]/30 transition-colors group"
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="text-[#F0F4F8] font-semibold truncate">{snippet.title}</h3>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <button
                    onClick={() => copyToClipboard(snippet)}
                    className="text-[#829AB1] hover:text-[#00D4AA] p-1 rounded transition-colors"
                    title="Copy to clipboard"
                  >
                    {copiedId === snippet.id ? <Check size={16} className="text-[#00D4AA]" /> : <Copy size={16} />}
                  </button>
                  <button
                    onClick={() => handleDelete(snippet.id)}
                    className="text-[#829AB1] hover:text-red-400 p-1 rounded opacity-0 group-hover:opacity-100 transition-all"
                    title="Delete snippet"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div>
                <span
                  className={cn(
                    'px-2 py-0.5 rounded-full text-xs font-medium border',
                    categoryColors[snippet.category] ?? categoryColors.Other
                  )}
                >
                  {snippet.category}
                </span>
              </div>

              <div
                className="bg-[#050E1A] rounded-lg p-3 border border-[#1A3550]/50 cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : snippet.id)}
              >
                <p className={cn(
                  'text-[#829AB1] text-xs whitespace-pre-wrap',
                  !isExpanded && 'line-clamp-4'
                )}>
                  {snippet.content}
                </p>
                {snippet.content.length > 200 && (
                  <div className="flex items-center gap-1 mt-2 text-[#00D4AA] text-xs">
                    {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    <span>{isExpanded ? 'Show less' : 'Show more'}</span>
                  </div>
                )}
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 px-2 py-0.5 bg-[#1A3550]/50 text-[#829AB1] text-xs rounded-full"
                    >
                      <Tag size={10} />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-[#829AB1]/30 mx-auto mb-3" />
          <p className="text-[#829AB1]">No snippets found</p>
        </div>
      )}

      {/* Add Snippet Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[#0B1B2E] border border-[#1A3550] rounded-xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#F0F4F8]">Add Snippet</h2>
              <button onClick={() => setShowModal(false)} className="text-[#829AB1] hover:text-[#F0F4F8]">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
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
                <label className="text-sm text-[#829AB1] block mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 bg-[#050E1A] border border-[#1A3550] rounded-lg text-[#F0F4F8] text-sm focus:outline-none focus:border-[#00D4AA]/50"
                >
                  {snippetCategories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-[#829AB1] block mb-1">Content</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  rows={8}
                  className="w-full px-3 py-2 bg-[#050E1A] border border-[#1A3550] rounded-lg text-[#F0F4F8] text-sm focus:outline-none focus:border-[#00D4AA]/50 resize-none font-mono"
                  placeholder="Write your snippet content here..."
                  required
                />
              </div>
              <div>
                <label className="text-sm text-[#829AB1] block mb-1">Tags (comma-separated)</label>
                <input
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="e.g. pricing, contract, sla"
                  className="w-full px-3 py-2 bg-[#050E1A] border border-[#1A3550] rounded-lg text-[#F0F4F8] text-sm placeholder:text-[#829AB1]/50 focus:outline-none focus:border-[#00D4AA]/50"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-[#829AB1] hover:text-[#F0F4F8] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00D4AA] text-[#050E1A] rounded-lg font-medium text-sm hover:bg-[#00D4AA]/90 transition-colors"
                >
                  Create Snippet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
