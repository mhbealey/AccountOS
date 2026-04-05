'use client';

import React, { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { ArrowUpDown } from 'lucide-react';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { getDaysInStage, getDaysInStageBadgeVariant } from './DealCard';
import type { Deal, DealStageLiteral } from '@/types';

interface PipelineListViewProps {
  deals: Deal[];
  onDealClick: (deal: Deal) => void;
}

const STAGE_BADGE: Record<
  DealStageLiteral,
  'default' | 'info' | 'warning' | 'success' | 'danger'
> = {
  Lead: 'default',
  Discovery: 'info',
  Proposal: 'info',
  Negotiation: 'warning',
  ClosedWon: 'success',
  ClosedLost: 'danger',
};

const STAGE_LABELS: Record<DealStageLiteral, string> = {
  Lead: 'Lead',
  Discovery: 'Discovery',
  Proposal: 'Proposal',
  Negotiation: 'Negotiation',
  ClosedWon: 'Closed Won',
  ClosedLost: 'Closed Lost',
};

type SortKey =
  | 'title'
  | 'client'
  | 'value'
  | 'stage'
  | 'probability'
  | 'closeDate'
  | 'daysInStage';

export function PipelineListView({
  deals,
  onDealClick,
}: PipelineListViewProps) {
  const [sortKey, setSortKey] = useState<SortKey>('value');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [filterStage, setFilterStage] = useState<string>('');
  const [filterClient, setFilterClient] = useState('');
  const [filterValueMin, setFilterValueMin] = useState('');
  const [filterValueMax, setFilterValueMax] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const filteredDeals = useMemo(() => {
    let result = [...deals];

    if (filterStage) {
      result = result.filter((d) => d.stage === filterStage);
    }
    if (filterClient.trim()) {
      const q = filterClient.toLowerCase();
      result = result.filter((d) =>
        d.client?.name?.toLowerCase().includes(q)
      );
    }
    if (filterValueMin) {
      result = result.filter((d) => d.value >= parseFloat(filterValueMin));
    }
    if (filterValueMax) {
      result = result.filter((d) => d.value <= parseFloat(filterValueMax));
    }
    if (filterDateFrom) {
      const from = new Date(filterDateFrom).getTime();
      result = result.filter(
        (d) => d.closeDate && new Date(d.closeDate).getTime() >= from
      );
    }
    if (filterDateTo) {
      const to = new Date(filterDateTo).getTime();
      result = result.filter(
        (d) => d.closeDate && new Date(d.closeDate).getTime() <= to
      );
    }

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'title':
          cmp = a.title.localeCompare(b.title);
          break;
        case 'client':
          cmp = (a.client?.name || '').localeCompare(b.client?.name || '');
          break;
        case 'value':
          cmp = a.value - b.value;
          break;
        case 'stage':
          cmp = a.stage.localeCompare(b.stage);
          break;
        case 'probability':
          cmp = a.probability - b.probability;
          break;
        case 'closeDate':
          cmp =
            (a.closeDate ? new Date(a.closeDate).getTime() : 0) -
            (b.closeDate ? new Date(b.closeDate).getTime() : 0);
          break;
        case 'daysInStage':
          cmp = getDaysInStage(a) - getDaysInStage(b);
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [
    deals,
    filterStage,
    filterClient,
    filterValueMin,
    filterValueMax,
    filterDateFrom,
    filterDateTo,
    sortKey,
    sortDir,
  ]);

  const SortHeader = ({
    label,
    field,
  }: {
    label: string;
    field: SortKey;
  }) => (
    <button
      onClick={() => toggleSort(field)}
      className="flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground"
    >
      {label}
      <ArrowUpDown
        className={cn(
          'h-3 w-3',
          sortKey === field ? 'text-primary' : 'text-muted-foreground/40'
        )}
      />
    </button>
  );

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-[#0a0f1e]/60 p-4">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Stage</label>
          <Select
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value)}
            className="w-36"
          >
            <option value="">All Stages</option>
            <option value="Lead">Lead</option>
            <option value="Discovery">Discovery</option>
            <option value="Proposal">Proposal</option>
            <option value="Negotiation">Negotiation</option>
            <option value="ClosedWon">Closed Won</option>
            <option value="ClosedLost">Closed Lost</option>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Client</label>
          <Input
            value={filterClient}
            onChange={(e) => setFilterClient(e.target.value)}
            placeholder="Filter by client..."
            className="w-40"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Value Min</label>
          <Input
            type="number"
            value={filterValueMin}
            onChange={(e) => setFilterValueMin(e.target.value)}
            placeholder="0"
            className="w-28"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Value Max</label>
          <Input
            type="number"
            value={filterValueMax}
            onChange={(e) => setFilterValueMax(e.target.value)}
            placeholder="999999"
            className="w-28"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Close From</label>
          <Input
            type="date"
            value={filterDateFrom}
            onChange={(e) => setFilterDateFrom(e.target.value)}
            className="w-36"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Close To</label>
          <Input
            type="date"
            value={filterDateTo}
            onChange={(e) => setFilterDateTo(e.target.value)}
            className="w-36"
          />
        </div>
        {(filterStage ||
          filterClient ||
          filterValueMin ||
          filterValueMax ||
          filterDateFrom ||
          filterDateTo) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setFilterStage('');
              setFilterClient('');
              setFilterValueMin('');
              setFilterValueMax('');
              setFilterDateFrom('');
              setFilterDateTo('');
            }}
          >
            Clear
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-[#0a0f1e]/80">
              <th className="px-4 py-3 text-left">
                <SortHeader label="Title" field="title" />
              </th>
              <th className="px-4 py-3 text-left">
                <SortHeader label="Client" field="client" />
              </th>
              <th className="px-4 py-3 text-right">
                <SortHeader label="Value" field="value" />
              </th>
              <th className="px-4 py-3 text-left">
                <SortHeader label="Stage" field="stage" />
              </th>
              <th className="px-4 py-3 text-right">
                <SortHeader label="Prob." field="probability" />
              </th>
              <th className="px-4 py-3 text-left">
                <SortHeader label="Close Date" field="closeDate" />
              </th>
              <th className="hidden px-4 py-3 text-left lg:table-cell">
                Next Step
              </th>
              <th className="px-4 py-3 text-right">
                <SortHeader label="Days" field="daysInStage" />
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredDeals.map((deal) => {
              const days = getDaysInStage(deal);
              return (
                <tr
                  key={deal.id}
                  onClick={() => onDealClick(deal)}
                  className="cursor-pointer border-b border-border/50 transition-colors hover:bg-secondary/30"
                >
                  <td className="px-4 py-3 text-sm font-medium text-foreground">
                    {deal.title}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {deal.client?.name || '-'}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-foreground">
                    {formatCurrency(deal.value)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={STAGE_BADGE[deal.stage]}>
                      {STAGE_LABELS[deal.stage]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                    {deal.probability}%
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {deal.closeDate ? formatDate(deal.closeDate) : '-'}
                  </td>
                  <td className="hidden px-4 py-3 text-sm text-muted-foreground lg:table-cell">
                    <span className="line-clamp-1">
                      {deal.nextStep || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Badge variant={getDaysInStageBadgeVariant(days)}>
                      {days}d
                    </Badge>
                  </td>
                </tr>
              );
            })}
            {filteredDeals.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-12 text-center text-sm text-muted-foreground"
                >
                  No deals found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
