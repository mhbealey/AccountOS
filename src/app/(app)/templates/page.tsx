'use client';

import { useEffect, useState } from 'react';
import {
  Mail,
  Plus,
  X,
  Loader2,
  AlertCircle,
  Search,
  Edit3,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Template {
  id: string;
  name: string;
  category: string;
  subject: string;
  body: string;
}

const categoryColors: Record<string, string> = {
  Email: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Invoice: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Proposal: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  Contract: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'Follow-up': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  Onboarding: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  Other: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

const emptyForm = {
  name: '',
  category: 'Email',
  subject: '',
  body: '',
};

const variableHints = [
  '{{client_name}}',
  '{{company}}',
  '{{date}}',
  '{{amount}}',
  '{{your_name}}',
  '{{project_name}}',
];

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchTemplates() {
      try {
        setLoading(true);
        const res = await fetch('/api/v1/templates');
        if (!res.ok) throw new Error(`Failed to load templates (${res.status})`);
        const json = await res.json();
        setTemplates(Array.isArray(json) ? json : json.templates ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    }
    fetchTemplates();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (template: Template) => {
    setEditingId(template.id);
    setForm({
      name: template.name,
      category: template.category,
      subject: template.subject,
      body: template.body,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const res = await fetch(`/api/v1/templates/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error('Failed to update template');
        const updated = await res.json();
        setTemplates((prev) => prev.map((t) => (t.id === editingId ? updated : t)));
      } else {
        const res = await fetch('/api/v1/templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error('Failed to create template');
        const created = await res.json();
        setTemplates((prev) => [created, ...prev]);
      }
      setShowModal(false);
      setForm(emptyForm);
      setEditingId(null);
    } catch {
      // silently handle
    }
  };

  const filtered = templates.filter(
    (t) =>
      t.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.category?.toLowerCase().includes(search.toLowerCase()) ||
      t.subject?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#00D4AA]" />
          <p className="text-[#829AB1] text-sm">Loading templates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-center px-4">
          <AlertCircle className="h-8 w-8 text-red-400" />
          <p className="text-red-400 font-medium">Failed to load templates</p>
          <p className="text-[#829AB1] text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F0F4F8]">Templates</h1>
          <p className="text-[#829AB1] text-sm mt-1">Reusable message and document templates</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-[#00D4AA] text-[#050E1A] rounded-lg font-medium text-sm hover:bg-[#00D4AA]/90 transition-colors"
        >
          <Plus size={16} />
          Add Template
        </button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#829AB1]" />
        <input
          type="text"
          placeholder="Search templates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-[#0B1B2E] border border-[#1A3550] rounded-lg text-[#F0F4F8] text-sm placeholder:text-[#829AB1]/50 focus:outline-none focus:border-[#00D4AA]/50"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((template) => (
          <div
            key={template.id}
            className="bg-[#0B1B2E] rounded-xl border border-[#1A3550] p-5 space-y-3 hover:border-[#00D4AA]/30 transition-colors group"
          >
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <h3 className="text-[#F0F4F8] font-semibold truncate">{template.name}</h3>
                {template.subject && (
                  <p className="text-[#829AB1] text-sm mt-0.5 truncate">{template.subject}</p>
                )}
              </div>
              <button
                onClick={() => openEdit(template)}
                className="text-[#829AB1] hover:text-[#00D4AA] shrink-0 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Edit3 size={16} />
              </button>
            </div>
            <div>
              <span
                className={cn(
                  'px-2 py-0.5 rounded-full text-xs font-medium border',
                  categoryColors[template.category] ?? categoryColors.Other
                )}
              >
                {template.category}
              </span>
            </div>
            <div className="bg-[#050E1A] rounded-lg p-3 border border-[#1A3550]/50">
              <p className="text-[#829AB1] text-xs line-clamp-4 whitespace-pre-wrap">
                {template.body}
              </p>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <Mail className="h-12 w-12 text-[#829AB1]/30 mx-auto mb-3" />
          <p className="text-[#829AB1]">No templates found</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[#0B1B2E] border border-[#1A3550] rounded-xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#F0F4F8]">
                {editingId ? 'Edit Template' : 'Add Template'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-[#829AB1] hover:text-[#F0F4F8]">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-sm text-[#829AB1] block mb-1">Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
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
                  {['Email', 'Invoice', 'Proposal', 'Contract', 'Follow-up', 'Onboarding', 'Other'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-[#829AB1] block mb-1">Subject</label>
                <input
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full px-3 py-2 bg-[#050E1A] border border-[#1A3550] rounded-lg text-[#F0F4F8] text-sm focus:outline-none focus:border-[#00D4AA]/50"
                />
              </div>
              <div>
                <label className="text-sm text-[#829AB1] block mb-1">Body</label>
                <textarea
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  rows={8}
                  className="w-full px-3 py-2 bg-[#050E1A] border border-[#1A3550] rounded-lg text-[#F0F4F8] text-sm focus:outline-none focus:border-[#00D4AA]/50 resize-none font-mono"
                  placeholder="Write your template body here..."
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="text-xs text-[#829AB1]">Variables:</span>
                  {variableHints.map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setForm({ ...form, body: form.body + v })}
                      className="px-1.5 py-0.5 bg-[#1A3550]/50 text-[#00D4AA] text-xs rounded font-mono hover:bg-[#1A3550] transition-colors"
                    >
                      {v}
                    </button>
                  ))}
                </div>
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
                  {editingId ? 'Update Template' : 'Create Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
