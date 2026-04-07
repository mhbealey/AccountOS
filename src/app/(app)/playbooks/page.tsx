'use client';

import { useEffect, useState } from 'react';
import {
  BookOpen,
  Plus,
  X,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Zap,
  Clock,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlaybookStep {
  id: string;
  dayOffset: number;
  title: string;
  description: string;
  priority: string;
}

interface Playbook {
  id: string;
  name: string;
  description: string;
  triggerType: string;
  isActive: boolean;
  steps: PlaybookStep[];
}

const triggerColors: Record<string, string> = {
  Onboarding: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Churn Risk': 'bg-red-500/10 text-red-400 border-red-500/20',
  Upsell: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Renewal: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Health Drop': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  Custom: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

const priorityColors: Record<string, string> = {
  High: 'text-red-400',
  Medium: 'text-yellow-400',
  Low: 'text-slate-400',
};

const emptyPlaybookForm = {
  name: '',
  description: '',
  triggerType: 'Onboarding',
};

const emptyStepForm = {
  dayOffset: 0,
  title: '',
  description: '',
  priority: 'Medium',
};

export default function PlaybooksPage() {
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [showPlaybookModal, setShowPlaybookModal] = useState(false);
  const [showStepModal, setShowStepModal] = useState<string | null>(null);
  const [playbookForm, setPlaybookForm] = useState(emptyPlaybookForm);
  const [stepForm, setStepForm] = useState(emptyStepForm);

  useEffect(() => {
    async function fetchPlaybooks() {
      try {
        setLoading(true);
        const res = await fetch('/api/v1/playbooks');
        if (!res.ok) throw new Error(`Failed to load playbooks (${res.status})`);
        const json = await res.json();
        setPlaybooks(Array.isArray(json) ? json : json.playbooks ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    }
    fetchPlaybooks();
  }, []);

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleActive = async (playbook: Playbook) => {
    const newActive = !playbook.isActive;
    setPlaybooks((prev) =>
      prev.map((p) => (p.id === playbook.id ? { ...p, isActive: newActive } : p))
    );
    try {
      await fetch(`/api/v1/playbooks/${playbook.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newActive }),
      });
    } catch {
      setPlaybooks((prev) =>
        prev.map((p) => (p.id === playbook.id ? { ...p, isActive: playbook.isActive } : p))
      );
    }
  };

  const handleCreatePlaybook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/playbooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...playbookForm, isActive: true, steps: [] }),
      });
      if (!res.ok) throw new Error('Failed to create playbook');
      const created = await res.json();
      setPlaybooks((prev) => [created, ...prev]);
      setShowPlaybookModal(false);
      setPlaybookForm(emptyPlaybookForm);
    } catch {
      // silently handle
    }
  };

  const handleAddStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showStepModal) return;
    const newStep: PlaybookStep = {
      id: crypto.randomUUID(),
      ...stepForm,
    };
    setPlaybooks((prev) =>
      prev.map((p) =>
        p.id === showStepModal ? { ...p, steps: [...(p.steps ?? []), newStep] } : p
      )
    );
    try {
      await fetch(`/api/v1/playbooks/${showStepModal}/steps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stepForm),
      });
    } catch {
      // silently handle
    }
    setShowStepModal(null);
    setStepForm(emptyStepForm);
  };

  const removeStep = async (playbookId: string, stepId: string) => {
    setPlaybooks((prev) =>
      prev.map((p) =>
        p.id === playbookId
          ? { ...p, steps: (p.steps ?? []).filter((s) => s.id !== stepId) }
          : p
      )
    );
    try {
      await fetch(`/api/v1/playbooks/${playbookId}/steps/${stepId}`, {
        method: 'DELETE',
      });
    } catch {
      // silently handle
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#00D4AA]" />
          <p className="text-[#829AB1] text-sm">Loading playbooks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-center px-4">
          <AlertCircle className="h-8 w-8 text-red-400" />
          <p className="text-red-400 font-medium">Failed to load playbooks</p>
          <p className="text-[#829AB1] text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F0F4F8]">Playbooks</h1>
          <p className="text-[#829AB1] text-sm mt-1">Automated workflows and step sequences</p>
        </div>
        <button
          onClick={() => setShowPlaybookModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#00D4AA] text-[#050E1A] rounded-lg font-medium text-sm hover:bg-[#00D4AA]/90 transition-colors"
        >
          <Plus size={16} />
          Add Playbook
        </button>
      </div>

      <div className="space-y-4">
        {playbooks.map((playbook) => {
          const isExpanded = expanded.has(playbook.id);
          const steps = playbook.steps ?? [];
          return (
            <div
              key={playbook.id}
              className="bg-[#0B1B2E] rounded-xl border border-[#1A3550] overflow-hidden"
            >
              <div
                className="flex items-center justify-between p-5 cursor-pointer hover:bg-[#1A3550]/20 transition-colors"
                onClick={() => toggleExpanded(playbook.id)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {isExpanded ? (
                    <ChevronDown size={18} className="text-[#829AB1] shrink-0" />
                  ) : (
                    <ChevronRight size={18} className="text-[#829AB1] shrink-0" />
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-[#F0F4F8] font-semibold">{playbook.name}</h3>
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded-full text-xs font-medium border',
                          triggerColors[playbook.triggerType] ?? triggerColors.Custom
                        )}
                      >
                        {playbook.triggerType}
                      </span>
                      <span className="text-xs text-[#829AB1]">
                        {steps.length} step{steps.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <p className="text-[#829AB1] text-sm mt-0.5 truncate">{playbook.description}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleActive(playbook);
                  }}
                  className="shrink-0 ml-3"
                  title={playbook.isActive ? 'Deactivate' : 'Activate'}
                >
                  {playbook.isActive ? (
                    <ToggleRight size={28} className="text-[#00D4AA]" />
                  ) : (
                    <ToggleLeft size={28} className="text-[#829AB1]" />
                  )}
                </button>
              </div>

              {isExpanded && (
                <div className="border-t border-[#1A3550] px-5 pb-5">
                  <div className="flex items-center justify-between py-3">
                    <h4 className="text-sm font-medium text-[#829AB1]">Steps</h4>
                    <button
                      onClick={() => setShowStepModal(playbook.id)}
                      className="flex items-center gap-1 px-2 py-1 text-xs text-[#00D4AA] hover:bg-[#00D4AA]/10 rounded transition-colors"
                    >
                      <Plus size={12} />
                      Add Step
                    </button>
                  </div>
                  {steps.length === 0 ? (
                    <p className="text-[#829AB1] text-sm py-4 text-center">
                      No steps defined. Add a step to get started.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {steps
                        .sort((a, b) => a.dayOffset - b.dayOffset)
                        .map((step) => (
                          <div
                            key={step.id}
                            className="flex items-start gap-3 p-3 bg-[#050E1A] rounded-lg border border-[#1A3550]/50"
                          >
                            <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                              <Clock size={14} className="text-[#829AB1]" />
                              <span className="text-xs font-medium text-[#829AB1]">
                                Day {step.dayOffset}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-[#F0F4F8]">
                                  {step.title}
                                </span>
                                <span
                                  className={cn(
                                    'text-xs font-medium',
                                    priorityColors[step.priority] ?? 'text-slate-400'
                                  )}
                                >
                                  {step.priority}
                                </span>
                              </div>
                              <p className="text-xs text-[#829AB1] mt-0.5">{step.description}</p>
                            </div>
                            <button
                              onClick={() => removeStep(playbook.id, step.id)}
                              className="text-red-400/60 hover:text-red-400 shrink-0 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {playbooks.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-[#829AB1]/30 mx-auto mb-3" />
          <p className="text-[#829AB1]">No playbooks found</p>
        </div>
      )}

      {/* Add Playbook Modal */}
      {showPlaybookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[#0B1B2E] border border-[#1A3550] rounded-xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#F0F4F8]">Add Playbook</h2>
              <button onClick={() => setShowPlaybookModal(false)} className="text-[#829AB1] hover:text-[#F0F4F8]">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreatePlaybook} className="space-y-3">
              <div>
                <label className="text-sm text-[#829AB1] block mb-1">Name</label>
                <input
                  value={playbookForm.name}
                  onChange={(e) => setPlaybookForm({ ...playbookForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#050E1A] border border-[#1A3550] rounded-lg text-[#F0F4F8] text-sm focus:outline-none focus:border-[#00D4AA]/50"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-[#829AB1] block mb-1">Description</label>
                <textarea
                  value={playbookForm.description}
                  onChange={(e) => setPlaybookForm({ ...playbookForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-[#050E1A] border border-[#1A3550] rounded-lg text-[#F0F4F8] text-sm focus:outline-none focus:border-[#00D4AA]/50 resize-none"
                />
              </div>
              <div>
                <label className="text-sm text-[#829AB1] block mb-1">Trigger Type</label>
                <select
                  value={playbookForm.triggerType}
                  onChange={(e) => setPlaybookForm({ ...playbookForm, triggerType: e.target.value })}
                  className="w-full px-3 py-2 bg-[#050E1A] border border-[#1A3550] rounded-lg text-[#F0F4F8] text-sm focus:outline-none focus:border-[#00D4AA]/50"
                >
                  {['Onboarding', 'Churn Risk', 'Upsell', 'Renewal', 'Health Drop', 'Custom'].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPlaybookModal(false)}
                  className="px-4 py-2 text-sm text-[#829AB1] hover:text-[#F0F4F8] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00D4AA] text-[#050E1A] rounded-lg font-medium text-sm hover:bg-[#00D4AA]/90 transition-colors"
                >
                  Create Playbook
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Step Modal */}
      {showStepModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[#0B1B2E] border border-[#1A3550] rounded-xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#F0F4F8]">Add Step</h2>
              <button onClick={() => setShowStepModal(null)} className="text-[#829AB1] hover:text-[#F0F4F8]">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddStep} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-[#829AB1] block mb-1">Day Offset</label>
                  <input
                    type="number"
                    value={stepForm.dayOffset}
                    onChange={(e) => setStepForm({ ...stepForm, dayOffset: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#050E1A] border border-[#1A3550] rounded-lg text-[#F0F4F8] text-sm focus:outline-none focus:border-[#00D4AA]/50"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-[#829AB1] block mb-1">Priority</label>
                  <select
                    value={stepForm.priority}
                    onChange={(e) => setStepForm({ ...stepForm, priority: e.target.value })}
                    className="w-full px-3 py-2 bg-[#050E1A] border border-[#1A3550] rounded-lg text-[#F0F4F8] text-sm focus:outline-none focus:border-[#00D4AA]/50"
                  >
                    {['High', 'Medium', 'Low'].map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm text-[#829AB1] block mb-1">Title</label>
                <input
                  value={stepForm.title}
                  onChange={(e) => setStepForm({ ...stepForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-[#050E1A] border border-[#1A3550] rounded-lg text-[#F0F4F8] text-sm focus:outline-none focus:border-[#00D4AA]/50"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-[#829AB1] block mb-1">Description</label>
                <textarea
                  value={stepForm.description}
                  onChange={(e) => setStepForm({ ...stepForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-[#050E1A] border border-[#1A3550] rounded-lg text-[#F0F4F8] text-sm focus:outline-none focus:border-[#00D4AA]/50 resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowStepModal(null)}
                  className="px-4 py-2 text-sm text-[#829AB1] hover:text-[#F0F4F8] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00D4AA] text-[#050E1A] rounded-lg font-medium text-sm hover:bg-[#00D4AA]/90 transition-colors"
                >
                  Add Step
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
