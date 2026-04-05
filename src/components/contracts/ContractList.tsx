'use client';

import * as React from 'react';
import { Filter, ArrowUpDown, X, AlertTriangle } from 'lucide-react';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ContractCard } from './ContractCard';
import { EmptyState } from '@/components/ui/empty-state';
import { ContractStatus, ContractType, type Contract, type Client } from '@/types';

interface ContractListProps {
  contracts: Contract[];
  clients: Client[];
  onEdit: (contract: Contract) => void;
  onDelete: (id: string) => void;
}

type SortKey = 'endDate' | 'value';
type SortDir = 'asc' | 'desc';

export function ContractList({
  contracts,
  clients,
  onEdit,
  onDelete,
}: ContractListProps) {
  const [statusFilter, setStatusFilter] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState('');
  const [clientFilter, setClientFilter] = React.useState('');
  const [sortKey, setSortKey] = React.useState<SortKey>('endDate');
  const [sortDir, setSortDir] = React.useState<SortDir>('asc');

  const expiringContracts = React.useMemo(() => {
    const now = new Date();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    return contracts.filter((c) => {
      if (c.status !== 'Active' || !c.endDate) return false;
      const end = new Date(c.endDate);
      const diff = end.getTime() - now.getTime();
      return diff > 0 && diff <= thirtyDays;
    });
  }, [contracts]);

  const filtered = React.useMemo(() => {
    let result = [...contracts];

    if (statusFilter) result = result.filter((c) => c.status === statusFilter);
    if (typeFilter) result = result.filter((c) => c.type === typeFilter);
    if (clientFilter) result = result.filter((c) => c.clientId === clientFilter);

    result.sort((a, b) => {
      if (sortKey === 'endDate') {
        const aDate = a.endDate ? new Date(a.endDate).getTime() : Infinity;
        const bDate = b.endDate ? new Date(b.endDate).getTime() : Infinity;
        return sortDir === 'asc' ? aDate - bDate : bDate - aDate;
      }
      const aVal = a.value ?? 0;
      const bVal = b.value ?? 0;
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return result;
  }, [contracts, statusFilter, typeFilter, clientFilter, sortKey, sortDir]);

  const hasFilters = statusFilter || typeFilter || clientFilter;

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  return (
    <div className="space-y-4">
      {expiringContracts.length > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3">
          <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-400">
              {expiringContracts.length} contract{expiringContracts.length > 1 ? 's' : ''} expiring within 30 days
            </p>
            <p className="text-xs text-yellow-400/70 mt-0.5">
              {expiringContracts.map((c) => c.title).join(', ')}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card/50 px-4 py-3">
        <Filter className="h-4 w-4 text-muted-foreground" />

        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-32"
        >
          <option value="">All Status</option>
          {Object.values(ContractStatus).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>

        <Select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="w-36"
        >
          <option value="">All Types</option>
          {Object.values(ContractType).map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Select>

        <Select
          value={clientFilter}
          onChange={(e) => setClientFilter(e.target.value)}
          className="w-40"
        >
          <option value="">All Clients</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>

        <div className="flex items-center gap-1 ml-auto">
          <Button
            variant={sortKey === 'endDate' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => toggleSort('endDate')}
            className="gap-1 text-xs"
          >
            <ArrowUpDown className="h-3 w-3" />
            End Date
          </Button>
          <Button
            variant={sortKey === 'value' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => toggleSort('value')}
            className="gap-1 text-xs"
          >
            <ArrowUpDown className="h-3 w-3" />
            Value
          </Button>
        </div>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setStatusFilter('');
              setTypeFilter('');
              setClientFilter('');
            }}
            className="gap-1 text-muted-foreground"
          >
            <X className="h-3 w-3" />
            Clear
          </Button>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<AlertTriangle className="h-8 w-8" />}
          title="No contracts found"
          description={
            hasFilters
              ? 'Try adjusting your filters.'
              : 'Create your first contract to get started.'
          }
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((contract) => (
            <ContractCard
              key={contract.id}
              contract={contract}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
