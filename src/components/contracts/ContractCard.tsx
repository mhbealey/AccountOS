'use client';

import * as React from 'react';
import {
  ChevronDown,
  ChevronUp,
  Pencil,
  Trash2,
  Calendar,
  DollarSign,
  RefreshCw,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type Contract } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

function getDaysRemaining(endDate: Date | string | null): number | null {
  if (!endDate) return null;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  const now = new Date();
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function getDaysRemainingColor(days: number | null): string {
  if (days === null) return 'text-muted-foreground';
  if (days < 0) return 'text-red-500 font-bold';
  if (days <= 30) return 'text-red-400';
  if (days <= 60) return 'text-yellow-400';
  return 'text-emerald-400';
}

function getDaysRemainingLabel(days: number | null): string {
  if (days === null) return 'No end date';
  if (days < 0) return `Expired ${Math.abs(days)}d ago`;
  if (days === 0) return 'Expires today';
  return `${days}d remaining`;
}

function getStatusBadgeVariant(
  status: string
): 'default' | 'success' | 'warning' | 'danger' | 'info' {
  switch (status) {
    case 'Draft':
      return 'default';
    case 'Sent':
      return 'info';
    case 'Active':
      return 'success';
    case 'Expired':
      return 'warning';
    case 'Terminated':
      return 'danger';
    default:
      return 'default';
  }
}

function getTypeBadgeVariant(
  type: string
): 'default' | 'success' | 'warning' | 'danger' | 'info' {
  switch (type) {
    case 'Retainer':
      return 'info';
    case 'SOW':
      return 'success';
    case 'MSA':
      return 'warning';
    case 'NDA':
      return 'default';
    case 'Amendment':
      return 'danger';
    case 'Subcontractor':
      return 'info';
    default:
      return 'default';
  }
}

interface ContractCardProps {
  contract: Contract;
  onEdit: (contract: Contract) => void;
  onDelete: (id: string) => void;
}

export function ContractCard({ contract, onEdit, onDelete }: ContractCardProps) {
  const [expanded, setExpanded] = React.useState(false);
  const daysRemaining = getDaysRemaining(contract.endDate);
  const daysColor = getDaysRemainingColor(daysRemaining);
  const daysLabel = getDaysRemainingLabel(daysRemaining);

  return (
    <div className="group rounded-lg border border-border bg-card/50 transition-colors hover:bg-card">
      <div
        className="flex items-center gap-4 px-4 py-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground truncate">
              {contract.title}
            </span>
            <Badge variant={getTypeBadgeVariant(contract.type)}>
              {contract.type}
            </Badge>
            <Badge variant={getStatusBadgeVariant(contract.status)}>
              {contract.status}
            </Badge>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {contract.client?.name ?? 'No client'}
          </div>
        </div>

        <div className="hidden items-center gap-6 text-sm md:flex">
          {contract.startDate && (
            <div className="text-xs text-muted-foreground">
              {formatDate(contract.startDate)}
            </div>
          )}
          <span className="text-muted-foreground/30">-</span>
          {contract.endDate && (
            <div className="text-xs text-muted-foreground">
              {formatDate(contract.endDate)}
            </div>
          )}

          {contract.value != null && (
            <div className="text-sm font-medium text-foreground min-w-[80px] text-right">
              {formatCurrency(contract.value)}
            </div>
          )}

          {contract.monthlyValue != null && (
            <div className="text-xs text-muted-foreground min-w-[80px] text-right">
              {formatCurrency(contract.monthlyValue)}/mo
            </div>
          )}

          <div className={`text-xs min-w-[100px] text-right ${daysColor}`}>
            {daysLabel}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(contract);
            }}
            className="rounded p-1.5 text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-secondary hover:text-foreground transition-all"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(contract.id);
            }}
            className="rounded p-1.5 text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-destructive/20 hover:text-destructive transition-all"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border px-4 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                Start Date
              </div>
              <p className="text-sm text-foreground">
                {contract.startDate ? formatDate(contract.startDate) : 'Not set'}
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                End Date
              </div>
              <p className="text-sm text-foreground">
                {contract.endDate ? formatDate(contract.endDate) : 'Not set'}
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <DollarSign className="h-3 w-3" />
                Total Value
              </div>
              <p className="text-sm text-foreground">
                {contract.value != null ? formatCurrency(contract.value) : 'Not set'}
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <DollarSign className="h-3 w-3" />
                Monthly Value
              </div>
              <p className="text-sm text-foreground">
                {contract.monthlyValue != null
                  ? formatCurrency(contract.monthlyValue)
                  : 'Not set'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <RefreshCw className="h-3 w-3" />
                Renewal Type
              </div>
              <p className="text-sm text-foreground">
                {contract.renewalType ?? 'None'}
              </p>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Reminder</div>
              <p className="text-sm text-foreground">
                {contract.reminderDays} days before expiry
              </p>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Days Remaining</div>
              <p className={`text-sm font-medium ${daysColor}`}>{daysLabel}</p>
            </div>
          </div>

          {contract.renewalTerms && (
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Renewal Terms</div>
              <p className="text-sm text-foreground/80 whitespace-pre-wrap">
                {contract.renewalTerms}
              </p>
            </div>
          )}

          {contract.terminationClause && (
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">
                Termination Clause
              </div>
              <p className="text-sm text-foreground/80 whitespace-pre-wrap">
                {contract.terminationClause}
              </p>
            </div>
          )}

          {contract.notes && (
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <FileText className="h-3 w-3" />
                Notes
              </div>
              <p className="text-sm text-foreground/80 whitespace-pre-wrap">
                {contract.notes}
              </p>
            </div>
          )}

          {contract.fileUrl && (
            <a
              href={contract.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              View Document
            </a>
          )}

          <div className="flex gap-2 pt-2 border-t border-border">
            <Button size="sm" variant="outline" onClick={() => onEdit(contract)}>
              <Pencil className="h-3 w-3" />
              Edit
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(contract.id)}
            >
              <Trash2 className="h-3 w-3" />
              Delete
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
