'use client';

import * as React from 'react';
import { Filter, Star, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  ActivityType,
  Sentiment,
  type ActivityTypeLiteral,
  type SentimentLiteral,
  type Client,
} from '@/types';
import { activityTypeLabels } from './QuickLogBar';

export interface ActivityFilterValues {
  clientId: string;
  type: string;
  sentiment: string;
  dateFrom: string;
  dateTo: string;
  keyMomentsOnly: boolean;
}

interface ActivityFiltersProps {
  clients: Client[];
  filters: ActivityFilterValues;
  onChange: (filters: ActivityFilterValues) => void;
}

export function ActivityFilters({ clients, filters, onChange }: ActivityFiltersProps) {
  const hasActiveFilters =
    filters.clientId ||
    filters.type ||
    filters.sentiment ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.keyMomentsOnly;

  const clearFilters = () => {
    onChange({
      clientId: '',
      type: '',
      sentiment: '',
      dateFrom: '',
      dateTo: '',
      keyMomentsOnly: false,
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card/50 px-4 py-3">
      <Filter className="h-4 w-4 text-muted-foreground" />

      <Select
        value={filters.clientId}
        onChange={(e) => onChange({ ...filters, clientId: e.target.value })}
        className="w-40"
      >
        <option value="">All Clients</option>
        {clients.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </Select>

      <Select
        value={filters.type}
        onChange={(e) => onChange({ ...filters, type: e.target.value })}
        className="w-40"
      >
        <option value="">All Types</option>
        {Object.values(ActivityType).map((t) => (
          <option key={t} value={t}>
            {activityTypeLabels[t as ActivityTypeLiteral]}
          </option>
        ))}
      </Select>

      <Select
        value={filters.sentiment}
        onChange={(e) => onChange({ ...filters, sentiment: e.target.value })}
        className="w-32"
      >
        <option value="">All Sentiment</option>
        {Object.values(Sentiment).map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </Select>

      <div className="flex items-center gap-1.5">
        <span className="text-xs text-muted-foreground">From</span>
        <Input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })}
          className="w-36 h-9 text-xs"
        />
      </div>

      <div className="flex items-center gap-1.5">
        <span className="text-xs text-muted-foreground">To</span>
        <Input
          type="date"
          value={filters.dateTo}
          onChange={(e) => onChange({ ...filters, dateTo: e.target.value })}
          className="w-36 h-9 text-xs"
        />
      </div>

      <Button
        variant={filters.keyMomentsOnly ? 'default' : 'outline'}
        size="sm"
        onClick={() =>
          onChange({ ...filters, keyMomentsOnly: !filters.keyMomentsOnly })
        }
        className="gap-1"
      >
        <Star className="h-3 w-3" />
        Key Moments
      </Button>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-muted-foreground">
          <X className="h-3 w-3" />
          Clear
        </Button>
      )}
    </div>
  );
}
