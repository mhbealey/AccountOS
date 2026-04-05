'use client';

import React from 'react';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import type { Client } from '@/types';

interface TaskFiltersProps {
  clients: Pick<Client, 'id' | 'name'>[];
  filterClient: string;
  filterPriority: string;
  filterCategory: string;
  onFilterClientChange: (value: string) => void;
  onFilterPriorityChange: (value: string) => void;
  onFilterCategoryChange: (value: string) => void;
  onClear: () => void;
  hasFilters: boolean;
}

const CATEGORIES = [
  'Follow-up',
  'Deliverable',
  'Admin',
  'Renewal',
  'QBR',
  'Onboarding',
];

export function TaskFilters({
  clients,
  filterClient,
  filterPriority,
  filterCategory,
  onFilterClientChange,
  onFilterPriorityChange,
  onFilterCategoryChange,
  onClear,
  hasFilters,
}: TaskFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        value={filterClient}
        onChange={(e) => onFilterClientChange(e.target.value)}
        className="w-44"
      >
        <option value="">All Clients</option>
        {clients.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </Select>

      <Select
        value={filterPriority}
        onChange={(e) => onFilterPriorityChange(e.target.value)}
        className="w-36"
      >
        <option value="">All Priorities</option>
        <option value="High">High</option>
        <option value="Medium">Medium</option>
        <option value="Low">Low</option>
      </Select>

      <Select
        value={filterCategory}
        onChange={(e) => onFilterCategoryChange(e.target.value)}
        className="w-40"
      >
        <option value="">All Categories</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={onClear}>
          <X className="h-3.5 w-3.5" />
          Clear
        </Button>
      )}
    </div>
  );
}
