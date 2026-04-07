'use client';

import { use, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Send,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  Plus,
  Trash2,
  GripVertical,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';

interface Deliverable {
  id: string;
  title: string;
  description: string;
}

interface ProposalSection {
  key: string;
  label: string;
  content: string;
}

interface Proposal {
  id: string;
  title: string;
  clientName: string;
  status: string;
  type: string;
  investmentAmount: number;
  validUntil: string;
  sections: ProposalSection[];
  deliverables: Deliverable[];
}

const defaultSections: ProposalSection[] = [
  { key: 'executive_summary', label: 'Executive Summary', content: '' },
  { key: 'problem_statement', label: 'Problem Statement', content: '' },
  { key: 'scope_of_work', label: 'Scope of Work', content: '' },
  { key: 'deliverables', label: 'Deliverables', content: '' },
  { key: 'timeline', label: 'Timeline', content: '' },
  { key: 'investment', label: 'Investment', content: '' },
  { key: 'payment_terms', label: 'Payment Terms', content: '' },
];

const statusColors: Record<string, string> = {
  Draft: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  Sent: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Accepted: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Declined: 'bg-red-500/10 text-red-400 border-red-500/20',
  Expired: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
};

export default function ProposalEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('executive_summary');
  const [sections, setSections] = useState<ProposalSection[]>(defaultSections);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [title, setTitle] = useState('');
  const [investmentAmount, setInvestmentAmount] = useState(0);

  useEffect(() => {
    async function fetchProposal() {
      try {
        setLoading(true);
        const res = await fetch(`/api/v1/proposals/${id}`);
        if (!res.ok) throw new Error(`Failed to load proposal (${res.status})`);
        const json = await res.json();
        setProposal(json);
        setTitle(json.title ?? '');
        setInvestmentAmount(json.investmentAmount ?? 0);
        if (json.sections?.length) {
          setSections(json.sections);
        }
        if (json.deliverables?.length) {
          setDeliverables(json.deliverables);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    }
    fetchProposal();
  }, [id]);

  const handleSave = useCallback(async () => {
    try {
      setSaving(true);
      await fetch(`/api/v1/proposals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, investmentAmount, sections, deliverables }),
      });
    } finally {
      setSaving(false);
    }
  }, [id, title, investmentAmount, sections, deliverables]);

  const handleStatusChange = async (newStatus: string) => {
    try {
      const res = await fetch(`/api/v1/proposals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setProposal((prev) => (prev ? { ...prev, status: newStatus } : prev));
      }
    } catch {
      // silently handle
    }
  };

  const updateSectionContent = (key: string, content: string) => {
    setSections((prev) => prev.map((s) => (s.key === key ? { ...s, content } : s)));
  };

  const addDeliverable = () => {
    setDeliverables((prev) => [
      ...prev,
      { id: crypto.randomUUID(), title: '', description: '' },
    ]);
  };

  const removeDeliverable = (delId: string) => {
    setDeliverables((prev) => prev.filter((d) => d.id !== delId));
  };

  const updateDeliverable = (delId: string, field: 'title' | 'description', value: string) => {
    setDeliverables((prev) =>
      prev.map((d) => (d.id === delId ? { ...d, [field]: value } : d))
    );
  };

  const moveDeliverable = (index: number, direction: 'up' | 'down') => {
    const newList = [...deliverables];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= newList.length) return;
    [newList[index], newList[target]] = [newList[target]!, newList[index]!];
    setDeliverables(newList);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#00D4AA]" />
          <p className="text-[#829AB1] text-sm">Loading proposal...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-center px-4">
          <AlertCircle className="h-8 w-8 text-red-400" />
          <p className="text-red-400 font-medium">Failed to load proposal</p>
          <p className="text-[#829AB1] text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const currentSection = sections.find((s) => s.key === activeSection);
  const status = proposal?.status ?? 'Draft';

  return (
    <div className="flex flex-col h-screen">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-[#1A3550] bg-[#0B1B2E]">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => router.push('/proposals')}
            className="text-[#829AB1] hover:text-[#F0F4F8] transition-colors shrink-0"
          >
            <ArrowLeft size={20} />
          </button>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-semibold text-[#F0F4F8] bg-transparent border-none focus:outline-none min-w-0"
            placeholder="Proposal title..."
          />
          <span
            className={cn(
              'px-2 py-0.5 rounded-full text-xs font-medium border shrink-0',
              statusColors[status] ?? statusColors.Draft
            )}
          >
            {status}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {status === 'Draft' && (
            <button
              onClick={() => handleStatusChange('Sent')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg text-sm hover:bg-blue-500/20 transition-colors"
            >
              <Send size={14} />
              Send
            </button>
          )}
          {status === 'Sent' && (
            <>
              <button
                onClick={() => handleStatusChange('Accepted')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-sm hover:bg-emerald-500/20 transition-colors"
              >
                <CheckCircle size={14} />
                Accept
              </button>
              <button
                onClick={() => handleStatusChange('Declined')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-sm hover:bg-red-500/20 transition-colors"
              >
                <XCircle size={14} />
                Decline
              </button>
            </>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-[#00D4AA] text-[#050E1A] rounded-lg font-medium text-sm hover:bg-[#00D4AA]/90 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save
          </button>
        </div>
      </div>

      {/* Editor area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar - section nav */}
        <div className="w-56 border-r border-[#1A3550] bg-[#050E1A] overflow-y-auto shrink-0 hidden md:block">
          <div className="p-4 space-y-1">
            <h3 className="text-xs font-medium text-[#829AB1]/60 uppercase tracking-wider mb-3">
              Sections
            </h3>
            {sections.map((section) => (
              <button
                key={section.key}
                onClick={() => setActiveSection(section.key)}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                  activeSection === section.key
                    ? 'bg-[#00D4AA]/10 text-[#00D4AA]'
                    : 'text-[#829AB1] hover:text-[#F0F4F8] hover:bg-[#1A3550]/50'
                )}
              >
                {section.label}
              </button>
            ))}
          </div>

          <div className="border-t border-[#1A3550] p-4">
            <h3 className="text-xs font-medium text-[#829AB1]/60 uppercase tracking-wider mb-3">
              Details
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[#829AB1] block mb-1">Investment</label>
                <div className="flex items-center gap-1">
                  <span className="text-[#829AB1] text-sm">$</span>
                  <input
                    type="number"
                    value={investmentAmount}
                    onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                    className="w-full px-2 py-1 bg-[#0B1B2E] border border-[#1A3550] rounded text-[#F0F4F8] text-sm focus:outline-none focus:border-[#00D4AA]/50"
                  />
                </div>
                <p className="text-xs text-[#829AB1] mt-1">{formatCurrency(investmentAmount)}</p>
              </div>
              <div>
                <label className="text-xs text-[#829AB1] block mb-1">Client</label>
                <p className="text-sm text-[#F0F4F8]">{proposal?.clientName ?? 'N/A'}</p>
              </div>
              <div>
                <label className="text-xs text-[#829AB1] block mb-1">Type</label>
                <p className="text-sm text-[#F0F4F8]">{proposal?.type ?? 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {activeSection === 'deliverables' ? (
            <div className="max-w-3xl mx-auto space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-[#F0F4F8]">Deliverables</h2>
                <button
                  onClick={addDeliverable}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00D4AA]/10 text-[#00D4AA] border border-[#00D4AA]/20 rounded-lg text-sm hover:bg-[#00D4AA]/20 transition-colors"
                >
                  <Plus size={14} />
                  Add Deliverable
                </button>
              </div>

              {deliverables.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-[#829AB1]">No deliverables yet. Add one to get started.</p>
                </div>
              )}

              {deliverables.map((del, index) => (
                <div
                  key={del.id}
                  className="bg-[#0B1B2E] rounded-xl border border-[#1A3550] p-4 space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <GripVertical size={16} className="text-[#829AB1]/40 shrink-0" />
                    <span className="text-xs text-[#829AB1] font-medium shrink-0">#{index + 1}</span>
                    <input
                      value={del.title}
                      onChange={(e) => updateDeliverable(del.id, 'title', e.target.value)}
                      placeholder="Deliverable title..."
                      className="flex-1 px-2 py-1 bg-transparent text-[#F0F4F8] text-sm font-medium focus:outline-none border-b border-transparent focus:border-[#00D4AA]/30"
                    />
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => moveDeliverable(index, 'up')}
                        disabled={index === 0}
                        className="p-1 text-[#829AB1] hover:text-[#F0F4F8] disabled:opacity-30 transition-colors"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        onClick={() => moveDeliverable(index, 'down')}
                        disabled={index === deliverables.length - 1}
                        className="p-1 text-[#829AB1] hover:text-[#F0F4F8] disabled:opacity-30 transition-colors"
                      >
                        <ChevronDown size={14} />
                      </button>
                      <button
                        onClick={() => removeDeliverable(del.id)}
                        className="p-1 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={del.description}
                    onChange={(e) => updateDeliverable(del.id, 'description', e.target.value)}
                    placeholder="Describe this deliverable..."
                    rows={3}
                    className="w-full px-3 py-2 bg-[#050E1A] border border-[#1A3550] rounded-lg text-[#F0F4F8] text-sm placeholder:text-[#829AB1]/50 focus:outline-none focus:border-[#00D4AA]/50 resize-none"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-4">
              <h2 className="text-xl font-semibold text-[#F0F4F8]">
                {currentSection?.label}
              </h2>
              <textarea
                value={currentSection?.content ?? ''}
                onChange={(e) => updateSectionContent(activeSection, e.target.value)}
                placeholder={`Write your ${currentSection?.label?.toLowerCase()} here... (Markdown supported)`}
                rows={20}
                className="w-full px-4 py-3 bg-[#0B1B2E] border border-[#1A3550] rounded-xl text-[#F0F4F8] text-sm leading-relaxed placeholder:text-[#829AB1]/50 focus:outline-none focus:border-[#00D4AA]/50 resize-none"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
