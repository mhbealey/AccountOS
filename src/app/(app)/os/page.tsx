'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { format, parseISO } from 'date-fns';
import { X, Plus, Trash2, Bell, Loader2 } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';

// ── Types ────────────────────────────────────────────────────────────────────

type ClientService = {
  id: string;
  serviceId: string;
  status: string;
  service: { id: string; name: string; category: string };
};

type OsClient = {
  id: string;
  name: string;
  mrr: number;
  contractStart: string | null;
  createdAt: string;
  forecastCallPercent: number | null;
  forecastReason: string | null;
  services: ClientService[];
};

type PlanItem = {
  id: string;
  task: string;
  description: string | null;
  dueDate: string | null;
  roi: string | null;
  comments: string | null;
};

type PingState = Record<string, 'idle' | 'loading' | 'done'>;

// ── Helpers ──────────────────────────────────────────────────────────────────

function forecastColor(pct: number | null) {
  if (pct === null) return 'text-[#829AB1]';
  if (pct >= 80) return 'text-[#00D4AA]';
  if (pct >= 60) return 'text-amber-400';
  if (pct >= 40) return 'text-orange-400';
  return 'text-red-400';
}

function forecastBg(pct: number | null) {
  if (pct === null) return 'bg-transparent';
  if (pct >= 80) return 'bg-[#00D4AA]/10';
  if (pct >= 60) return 'bg-amber-400/10';
  if (pct >= 40) return 'bg-orange-400/10';
  return 'bg-red-400/10';
}

function formatClientSince(contractStart: string | null, createdAt: string) {
  const date = contractStart ? parseISO(contractStart) : parseISO(createdAt);
  return format(date, 'MMM yyyy');
}

function formatArr(mrr: number) {
  const arr = mrr * 12;
  if (arr >= 1_000_000) return `$${(arr / 1_000_000).toFixed(1)}M`;
  if (arr >= 1_000) return `$${(arr / 1_000).toFixed(0)}k`;
  return formatCurrency(arr);
}

// ── Inline-editable cell ─────────────────────────────────────────────────────

function EditableCell({
  value,
  type = 'text',
  placeholder,
  className,
  onSave,
}: {
  value: string;
  type?: 'text' | 'number';
  placeholder?: string;
  className?: string;
  onSave: (val: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  function commit() {
    setEditing(false);
    if (draft !== value) onSave(draft);
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        type={type}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') { setDraft(value); setEditing(false); }
        }}
        className={cn(
          'w-full bg-[#0D2137] border border-[#00D4AA]/50 rounded px-2 py-1 text-sm text-[#F0F4F8] outline-none',
          className
        )}
      />
    );
  }

  return (
    <span
      onClick={() => { setDraft(value); setEditing(true); }}
      className={cn(
        'cursor-pointer rounded px-2 py-1 text-sm hover:bg-[#1A3550]/60 transition-colors select-none block w-full',
        !value && 'text-[#829AB1]/50 italic',
        className
      )}
    >
      {value || placeholder || '—'}
    </span>
  );
}

// ── Plan item row ────────────────────────────────────────────────────────────

function PlanRow({
  item,
  onUpdate,
  onDelete,
}: {
  item: PlanItem;
  onUpdate: (id: string, field: string, val: string) => void;
  onDelete: (id: string) => void;
}) {
  function save(field: string) {
    return (val: string) => onUpdate(item.id, field, val);
  }

  return (
    <tr className="border-b border-[#1A3550]/50 group hover:bg-[#0D2137]/40 transition-colors">
      <td className="px-2 py-1.5 min-w-[140px]">
        <EditableCell value={item.task} placeholder="Task name" onSave={save('task')} />
      </td>
      <td className="px-2 py-1.5 min-w-[200px]">
        <EditableCell value={item.description ?? ''} placeholder="What needs to happen" onSave={save('description')} />
      </td>
      <td className="px-2 py-1.5 min-w-[110px]">
        <EditableCell
          value={item.dueDate ? format(parseISO(item.dueDate), 'yyyy-MM-dd') : ''}
          type="text"
          placeholder="YYYY-MM-DD"
          onSave={save('dueDate')}
        />
      </td>
      <td className="px-2 py-1.5 min-w-[100px]">
        <EditableCell value={item.roi ?? ''} placeholder="e.g. High" onSave={save('roi')} />
      </td>
      <td className="px-2 py-1.5 min-w-[160px]">
        <EditableCell value={item.comments ?? ''} placeholder="Notes" onSave={save('comments')} />
      </td>
      <td className="px-2 py-1.5 w-8">
        <button
          onClick={() => onDelete(item.id)}
          className="opacity-0 group-hover:opacity-100 p-1 rounded text-[#829AB1] hover:text-red-400 hover:bg-red-400/10 transition-all"
        >
          <Trash2 size={13} />
        </button>
      </td>
    </tr>
  );
}

// ── Add plan item row ────────────────────────────────────────────────────────

function AddPlanRow({ onAdd }: { onAdd: (item: Omit<PlanItem, 'id'>) => void }) {
  const emptyDraft = { task: '', description: '', dueDate: '', roi: '', comments: '' };
  const [draft, setDraft] = useState(emptyDraft);
  const [open, setOpen] = useState(false);

  function set(field: string, val: string) {
    setDraft((d) => ({ ...d, [field]: val }));
  }

  function submit() {
    if (!draft.task.trim()) return;
    onAdd({
      task: draft.task,
      description: draft.description || null,
      dueDate: draft.dueDate || null,
      roi: draft.roi || null,
      comments: draft.comments || null,
    });
    setDraft(emptyDraft);
    setOpen(false);
  }

  if (!open) {
    return (
      <tr>
        <td colSpan={6} className="px-2 py-2">
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-1.5 text-xs text-[#829AB1] hover:text-[#00D4AA] transition-colors"
          >
            <Plus size={13} />
            Add action
          </button>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-[#00D4AA]/20 bg-[#00D4AA]/5">
      <td className="px-2 py-1.5">
        <input
          autoFocus
          placeholder="Task *"
          value={draft.task}
          onChange={(e) => set('task', e.target.value)}
          className="w-full bg-transparent border-b border-[#1A3550] text-sm text-[#F0F4F8] placeholder-[#829AB1]/50 outline-none py-0.5"
        />
      </td>
      <td className="px-2 py-1.5">
        <input
          placeholder="Action description"
          value={draft.description}
          onChange={(e) => set('description', e.target.value)}
          className="w-full bg-transparent border-b border-[#1A3550] text-sm text-[#F0F4F8] placeholder-[#829AB1]/50 outline-none py-0.5"
        />
      </td>
      <td className="px-2 py-1.5">
        <input
          type="date"
          value={draft.dueDate}
          onChange={(e) => set('dueDate', e.target.value)}
          className="w-full bg-transparent border-b border-[#1A3550] text-sm text-[#F0F4F8] outline-none py-0.5 [color-scheme:dark]"
        />
      </td>
      <td className="px-2 py-1.5">
        <input
          placeholder="ROI"
          value={draft.roi}
          onChange={(e) => set('roi', e.target.value)}
          className="w-full bg-transparent border-b border-[#1A3550] text-sm text-[#F0F4F8] placeholder-[#829AB1]/50 outline-none py-0.5"
        />
      </td>
      <td className="px-2 py-1.5">
        <input
          placeholder="Comments"
          value={draft.comments}
          onChange={(e) => set('comments', e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') setOpen(false); }}
          className="w-full bg-transparent border-b border-[#1A3550] text-sm text-[#F0F4F8] placeholder-[#829AB1]/50 outline-none py-0.5"
        />
      </td>
      <td className="px-2 py-1.5">
        <div className="flex gap-1">
          <button
            onClick={submit}
            className="px-2 py-0.5 rounded bg-[#00D4AA] text-[#050E1A] text-xs font-medium hover:bg-[#00D4AA]/90 transition-colors"
          >
            Add
          </button>
          <button
            onClick={() => setOpen(false)}
            className="p-1 rounded text-[#829AB1] hover:text-[#F0F4F8] transition-colors"
          >
            <X size={13} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ── Account plan drawer ──────────────────────────────────────────────────────

function PlanDrawer({
  client,
  onClose,
}: {
  client: OsClient;
  onClose: () => void;
}) {
  const [items, setItems] = useState<PlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pingState, setPingState] = useState<PingState>({});

  useEffect(() => {
    setLoading(true);
    fetch(`/api/clients/${client.id}/plan`)
      .then((r) => r.json())
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [client.id]);

  async function handleAdd(draft: Omit<PlanItem, 'id'>) {
    const res = await fetch(`/api/clients/${client.id}/plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draft),
    });
    if (res.ok) {
      const item = await res.json();
      setItems((prev) => [...prev, item]);
    }
  }

  async function handleUpdate(id: string, field: string, val: string) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: val || null } : item))
    );
    await fetch(`/api/clients/${client.id}/plan/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: val || null }),
    });
  }

  async function handleDelete(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
    await fetch(`/api/clients/${client.id}/plan/${id}`, { method: 'DELETE' });
  }

  async function handlePing(svc: ClientService) {
    setPingState((s) => ({ ...s, [svc.id]: 'loading' }));
    await fetch(`/api/clients/${client.id}/ping`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serviceName: svc.service.name, serviceId: svc.serviceId }),
    });
    setPingState((s) => ({ ...s, [svc.id]: 'done' }));
    setTimeout(() => setPingState((s) => ({ ...s, [svc.id]: 'idle' })), 3000);
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="flex-1 bg-black/50 cursor-pointer"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="w-full max-w-3xl bg-[#0B1B2E] border-l border-[#1A3550] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1A3550]">
          <div>
            <p className="text-xs text-[#829AB1] uppercase tracking-widest font-medium">Account Plan</p>
            <h2 className="text-lg font-semibold text-[#F0F4F8] mt-0.5">{client.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#829AB1] hover:text-[#F0F4F8] hover:bg-[#1A3550] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Plan items table */}
          <div className="px-6 pt-5 pb-4">
            <h3 className="text-xs font-semibold text-[#829AB1] uppercase tracking-widest mb-3">
              Actions
            </h3>

            {loading ? (
              <div className="flex items-center gap-2 text-[#829AB1] text-sm py-4">
                <Loader2 size={14} className="animate-spin" />
                Loading…
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-[#1A3550]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#1A3550] bg-[#050E1A]">
                      {['Task', 'Action Description', 'Due Date', 'ROI', 'Comments', ''].map((h) => (
                        <th
                          key={h}
                          className="px-3 py-2 text-left text-xs font-semibold text-[#829AB1] uppercase tracking-wider whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-3 py-6 text-center text-sm text-[#829AB1]">
                          No actions yet — add one below.
                        </td>
                      </tr>
                    )}
                    {items.map((item) => (
                      <PlanRow
                        key={item.id}
                        item={item}
                        onUpdate={handleUpdate}
                        onDelete={handleDelete}
                      />
                    ))}
                    <AddPlanRow onAdd={handleAdd} />
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Services / Bug section */}
          {client.services.length > 0 && (
            <div className="px-6 pb-6">
              <h3 className="text-xs font-semibold text-[#829AB1] uppercase tracking-widest mb-3">
                Bug Services
              </h3>
              <div className="space-y-2">
                {client.services.map((svc) => {
                  const state = pingState[svc.id] ?? 'idle';
                  return (
                    <div
                      key={svc.id}
                      className="flex items-center justify-between rounded-lg border border-[#1A3550] bg-[#050E1A] px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-[#F0F4F8]">{svc.service.name}</p>
                        <p className="text-xs text-[#829AB1] mt-0.5">{svc.service.category}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            'text-xs px-2 py-0.5 rounded-full',
                            svc.status === 'active'
                              ? 'bg-[#00D4AA]/10 text-[#00D4AA]'
                              : 'bg-[#1A3550] text-[#829AB1]'
                          )}
                        >
                          {svc.status}
                        </span>
                        <button
                          onClick={() => handlePing(svc)}
                          disabled={state === 'loading'}
                          className={cn(
                            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                            state === 'done'
                              ? 'bg-[#00D4AA]/15 text-[#00D4AA] border border-[#00D4AA]/30'
                              : 'bg-[#1A3550] text-[#829AB1] hover:text-[#F0F4F8] hover:bg-[#1A3550]/80 border border-[#1A3550]'
                          )}
                        >
                          {state === 'loading' ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <Bell size={12} />
                          )}
                          {state === 'done' ? 'Pinged!' : 'Bug'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main OS grid ─────────────────────────────────────────────────────────────

export default function OsPage() {
  const [clients, setClients] = useState<OsClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<OsClient | null>(null);

  useEffect(() => {
    fetch('/api/os')
      .then((r) => r.json())
      .then((data) => setClients(Array.isArray(data) ? data : []))
      .catch(() => setClients([]))
      .finally(() => setLoading(false));
  }, []);

  const saveField = useCallback(
    async (clientId: string, field: string, raw: string) => {
      const value = field === 'forecastCallPercent'
        ? raw === '' ? null : parseFloat(raw)
        : raw || null;

      setClients((prev) =>
        prev.map((c) => (c.id === clientId ? { ...c, [field]: value } : c))
      );

      await fetch(`/api/clients/${clientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });
    },
    []
  );

  return (
    <div className="min-h-full bg-[#050E1A] flex flex-col">
      {/* Page header */}
      <div className="px-6 py-5 border-b border-[#1A3550] flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#F0F4F8]">Excel OS</h1>
          <p className="text-xs text-[#829AB1] mt-0.5">
            {clients.length} account{clients.length !== 1 ? 's' : ''} · click any cell to edit
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 size={20} className="animate-spin text-[#829AB1]" />
          </div>
        ) : clients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-[#829AB1]">
            <p className="text-sm">No accounts found. Add clients first.</p>
          </div>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-[#1A3550] bg-[#050E1A]">
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#829AB1] uppercase tracking-wider whitespace-nowrap">
                  Account Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#829AB1] uppercase tracking-wider whitespace-nowrap">
                  ARR
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#829AB1] uppercase tracking-wider whitespace-nowrap">
                  Client Since
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#829AB1] uppercase tracking-wider whitespace-nowrap w-36">
                  Forecast Call %
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#829AB1] uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-4 py-3 w-20" />
              </tr>
            </thead>
            <tbody>
              {clients.map((client, i) => (
                <tr
                  key={client.id}
                  className={cn(
                    'border-b border-[#1A3550]/50 hover:bg-[#0B1B2E]/60 transition-colors group',
                    i % 2 === 0 ? 'bg-transparent' : 'bg-[#0B1B2E]/20'
                  )}
                >
                  {/* Account Name */}
                  <td className="px-4 py-2.5 font-medium text-[#F0F4F8] whitespace-nowrap">
                    <button
                      onClick={() => setSelectedClient(client)}
                      className="text-left hover:text-[#00D4AA] transition-colors"
                    >
                      {client.name}
                    </button>
                  </td>

                  {/* ARR */}
                  <td className="px-4 py-2.5 text-[#F0F4F8] whitespace-nowrap font-mono text-xs">
                    {formatArr(client.mrr)}
                  </td>

                  {/* Client Since */}
                  <td className="px-4 py-2.5 text-[#829AB1] whitespace-nowrap">
                    {formatClientSince(client.contractStart, client.createdAt)}
                  </td>

                  {/* Forecast Call % */}
                  <td className="px-2 py-1.5">
                    <div
                      className={cn(
                        'flex items-center rounded px-1',
                        forecastBg(client.forecastCallPercent)
                      )}
                    >
                      <EditableCell
                        value={client.forecastCallPercent != null ? String(client.forecastCallPercent) : ''}
                        type="number"
                        placeholder="—"
                        className={cn('font-mono', forecastColor(client.forecastCallPercent))}
                        onSave={(val) => saveField(client.id, 'forecastCallPercent', val)}
                      />
                      {client.forecastCallPercent != null && (
                        <span className={cn('text-xs pr-2 shrink-0', forecastColor(client.forecastCallPercent))}>
                          %
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Reason */}
                  <td className="px-2 py-1.5 max-w-xs">
                    <EditableCell
                      value={client.forecastReason ?? ''}
                      placeholder="Add reason…"
                      className="text-[#829AB1]"
                      onSave={(val) => saveField(client.id, 'forecastReason', val)}
                    />
                  </td>

                  {/* Plan button */}
                  <td className="px-4 py-2.5">
                    <button
                      onClick={() => setSelectedClient(client)}
                      className="opacity-0 group-hover:opacity-100 text-xs px-2.5 py-1 rounded border border-[#1A3550] text-[#829AB1] hover:text-[#F0F4F8] hover:border-[#829AB1] transition-all whitespace-nowrap"
                    >
                      Plan →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Account plan drawer */}
      {selectedClient && (
        <PlanDrawer
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
        />
      )}
    </div>
  );
}
