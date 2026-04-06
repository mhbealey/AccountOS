'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Shield, ChevronDown } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ServiceItem {
  id: string;
  name: string;
  category: string;
  description: string | null;
}

interface ClientServiceEntry {
  status: string;
  revenue: number | null;
  clientServiceId: string;
}

/** API returns services as a map keyed by serviceId */
interface MatrixRow {
  clientId: string;
  clientName: string;
  services: Record<string, ClientServiceEntry>;
}

type Status = 'active' | 'planned' | 'opportunity';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CATEGORY_ORDER = [
  'Assessment',
  'Managed',
  'Advisory',
  'Training',
  'Compliance',
  'Incident',
];

const STATUS_DOT: Record<Status, string> = {
  active: 'bg-teal-500',
  planned: 'bg-blue-400',
  opportunity: 'bg-amber-500',
};

const STATUS_LABEL: Record<Status, string> = {
  active: 'Active',
  planned: 'Planned',
  opportunity: 'Opportunity',
};

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function ServicesMatrixPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [matrix, setMatrix] = useState<MatrixRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/services');
        const data = await res.json();
        setServices(data.services ?? []);
        setMatrix(data.matrix ?? []);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // ---- Derived data ----
  const sortedServices = useMemo(() => {
    return [...services].sort((a, b) => {
      const ai = CATEGORY_ORDER.indexOf(a.category);
      const bi = CATEGORY_ORDER.indexOf(b.category);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });
  }, [services]);

  const categorizedServices = useMemo(() => {
    const map = new Map<string, ServiceItem[]>();
    for (const svc of sortedServices) {
      const list = map.get(svc.category) ?? [];
      list.push(svc);
      map.set(svc.category, list);
    }
    return map;
  }, [sortedServices]);

  const stats = useMemo(() => {
    let activeCount = 0;
    let opportunityCount = 0;
    let totalRevenue = 0;

    for (const row of matrix) {
      for (const s of Object.values(row.services)) {
        if (s.status === 'active') {
          activeCount++;
          totalRevenue += s.revenue ?? 0;
        }
        if (s.status === 'opportunity') opportunityCount++;
      }
    }

    return { activeCount, opportunityCount, totalRevenue };
  }, [matrix]);

  // Helper to look up status for a client + service pair
  function getStatus(clientId: string, serviceId: string): Status | null {
    const row = matrix.find((r) => r.clientId === clientId);
    if (!row) return null;
    const entry = row.services[serviceId];
    if (!entry) return null;
    return entry.status as Status;
  }

  // ---- Loading state ----
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050E1A]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1A3550] border-t-[#00D4AA]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050E1A] p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* ---- Header ---- */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#00D4AA]/10 text-[#00D4AA]">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#F0F4F8]">
              Services &amp; Opportunities
            </h1>
            <p className="text-xs text-[#829AB1]">
              Matrix view of all services across clients
            </p>
          </div>
        </div>

        {/* ---- Summary Stats ---- */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Active Services" value={String(stats.activeCount)} accent="teal" />
          <StatCard label="Opportunities" value={String(stats.opportunityCount)} accent="amber" />
          <StatCard label="Service Revenue" value={formatCurrency(stats.totalRevenue)} accent="blue" />
        </div>

        {/* ---- Legend ---- */}
        <div className="flex flex-wrap items-center gap-4 rounded-xl border border-[#1A3550] bg-[#0B1B2E] px-4 py-3">
          <span className="text-xs font-medium text-[#829AB1]">Legend:</span>
          {(['active', 'planned', 'opportunity'] as Status[]).map((s) => (
            <span key={s} className="flex items-center gap-1.5 text-xs text-[#F0F4F8]">
              <span className={cn('inline-block h-2.5 w-2.5 rounded-full', STATUS_DOT[s])} />
              {STATUS_LABEL[s]}
            </span>
          ))}
          <span className="flex items-center gap-1.5 text-xs text-[#829AB1]">
            <span className="inline-block h-2.5 w-2.5 rounded-full border border-[#1A3550]" />
            None
          </span>
        </div>

        {/* ---- Mobile: Card View ---- */}
        <div className="space-y-4 lg:hidden">
          {CATEGORY_ORDER.map((cat) => {
            const svcs = categorizedServices.get(cat);
            if (!svcs || svcs.length === 0) return null;
            return (
              <MobileCategoryCard
                key={cat}
                category={cat}
                services={svcs}
                matrix={matrix}
              />
            );
          })}
        </div>

        {/* ---- Desktop: Matrix Table ---- */}
        <div className="hidden lg:block overflow-x-auto rounded-xl border border-[#1A3550] bg-[#0B1B2E]">
          <table className="w-full text-sm">
            <thead>
              {/* Category grouping row */}
              <tr className="border-b border-[#1A3550]">
                <th className="sticky left-0 z-10 bg-[#0B1B2E] px-4 py-2 text-left text-xs font-medium text-[#829AB1]">
                  Client
                </th>
                {CATEGORY_ORDER.map((cat) => {
                  const svcs = categorizedServices.get(cat);
                  if (!svcs || svcs.length === 0) return null;
                  return (
                    <th
                      key={cat}
                      colSpan={svcs.length}
                      className="border-l border-[#1A3550] px-2 py-2 text-center text-xs font-semibold text-[#00D4AA]"
                    >
                      {cat}
                    </th>
                  );
                })}
              </tr>
              {/* Service name row */}
              <tr className="border-b border-[#1A3550]">
                <th className="sticky left-0 z-10 bg-[#0B1B2E] px-4 py-2" />
                {sortedServices.map((svc) => (
                  <th
                    key={svc.id}
                    className="border-l border-[#1A3550] px-2 py-2 text-center text-[10px] font-medium text-[#829AB1] max-w-[80px] truncate"
                    title={svc.name}
                  >
                    {svc.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.map((row) => (
                <tr
                  key={row.clientId}
                  className="border-b border-[#1A3550] transition-colors hover:bg-[#0D2137]"
                >
                  <td className="sticky left-0 z-10 bg-[#0B1B2E] px-4 py-2.5 text-sm font-medium text-[#F0F4F8] whitespace-nowrap">
                    {row.clientName}
                  </td>
                  {sortedServices.map((svc) => {
                    const status = getStatus(row.clientId, svc.id);
                    return (
                      <td
                        key={svc.id}
                        className="border-l border-[#1A3550] px-2 py-2.5 text-center"
                      >
                        {status ? (
                          <span
                            className={cn(
                              'mx-auto block h-3 w-3 rounded-full',
                              STATUS_DOT[status],
                            )}
                            title={`${row.clientName} - ${svc.name}: ${STATUS_LABEL[status]}`}
                          />
                        ) : (
                          <span className="mx-auto block h-3 w-3 rounded-full border border-[#1A3550]" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: 'teal' | 'amber' | 'blue';
}) {
  const colors = {
    teal: 'text-teal-500',
    amber: 'text-amber-500',
    blue: 'text-blue-400',
  };

  return (
    <div className="rounded-xl border border-[#1A3550] bg-[#0B1B2E] p-4">
      <p className="text-xs font-medium text-[#829AB1]">{label}</p>
      <p className={cn('mt-1 text-2xl font-bold', colors[accent])}>{value}</p>
    </div>
  );
}

function MobileCategoryCard({
  category,
  services,
  matrix,
}: {
  category: string;
  services: ServiceItem[];
  matrix: MatrixRow[];
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="rounded-xl border border-[#1A3550] bg-[#0B1B2E] overflow-hidden">
      {/* Category Header */}
      <div className="flex items-center gap-2 border-b border-[#1A3550] px-4 py-3">
        <Shield className="h-4 w-4 text-[#00D4AA]" />
        <h3 className="text-sm font-semibold text-[#F0F4F8]">{category}</h3>
      </div>

      {/* Services list */}
      <div className="divide-y divide-[#1A3550]">
        {services.map((svc) => {
          const isExpanded = expanded === svc.id;
          const clientsActive = matrix.filter((r) =>
            r.services[svc.id]?.status === 'active',
          );
          const clientsOpportunity = matrix.filter((r) =>
            r.services[svc.id]?.status === 'opportunity',
          );
          const clientsAll = matrix.filter((r) =>
            svc.id in r.services,
          );

          return (
            <div key={svc.id}>
              <button
                onClick={() => setExpanded(isExpanded ? null : svc.id)}
                className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-[#0D2137]"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[#F0F4F8]">{svc.name}</p>
                  <div className="mt-1 flex items-center gap-3">
                    <span className="flex items-center gap-1 text-xs text-[#829AB1]">
                      <span className="inline-block h-2 w-2 rounded-full bg-teal-500" />
                      {clientsActive.length} active
                    </span>
                    <span className="flex items-center gap-1 text-xs text-[#829AB1]">
                      <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
                      {clientsOpportunity.length} opportunities
                    </span>
                  </div>
                </div>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 shrink-0 text-[#829AB1] transition-transform',
                    isExpanded && 'rotate-180',
                  )}
                />
              </button>

              {/* Expanded client list */}
              {isExpanded && clientsAll.length > 0 && (
                <div className="border-t border-[#1A3550] bg-[#050E1A] px-4 py-2">
                  <div className="space-y-1.5">
                    {clientsAll.map((row) => {
                      const entry = row.services[svc.id];
                      const status = (entry?.status ?? 'opportunity') as Status;
                      return (
                        <div
                          key={row.clientId}
                          className="flex items-center justify-between py-1"
                        >
                          <span className="text-xs text-[#F0F4F8]">{row.clientName}</span>
                          <span className="flex items-center gap-1.5 text-xs text-[#829AB1]">
                            <span
                              className={cn(
                                'inline-block h-2 w-2 rounded-full',
                                STATUS_DOT[status],
                              )}
                            />
                            {STATUS_LABEL[status]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {isExpanded && clientsAll.length === 0 && (
                <div className="border-t border-[#1A3550] bg-[#050E1A] px-4 py-3">
                  <p className="text-xs text-[#829AB1]">No clients for this service yet.</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
