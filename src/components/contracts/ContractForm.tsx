'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  ContractType,
  ContractStatus,
  type ContractTypeLiteral,
  type ContractStatusLiteral,
  type Contract,
  type Client,
} from '@/types';
import { generateId } from '@/lib/utils';

interface ContractFormProps {
  contract: Contract | null;
  clients: Client[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (contract: Contract) => void;
}

function toDateInputValue(d: Date | string | null): string {
  if (!d) return '';
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toISOString().slice(0, 10);
}

export function ContractForm({
  contract,
  clients,
  open,
  onOpenChange,
  onSave,
}: ContractFormProps) {
  const [title, setTitle] = React.useState('');
  const [clientId, setClientId] = React.useState('');
  const [type, setType] = React.useState<ContractTypeLiteral>('Retainer');
  const [status, setStatus] = React.useState<ContractStatusLiteral>('Draft');
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [value, setValue] = React.useState('');
  const [monthlyValue, setMonthlyValue] = React.useState('');
  const [renewalType, setRenewalType] = React.useState('None');
  const [renewalTerms, setRenewalTerms] = React.useState('');
  const [reminderDays, setReminderDays] = React.useState('30');
  const [terminationClause, setTerminationClause] = React.useState('');
  const [fileUrl, setFileUrl] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (contract) {
      setTitle(contract.title);
      setClientId(contract.clientId);
      setType(contract.type);
      setStatus(contract.status);
      setStartDate(toDateInputValue(contract.startDate));
      setEndDate(toDateInputValue(contract.endDate));
      setValue(contract.value?.toString() ?? '');
      setMonthlyValue(contract.monthlyValue?.toString() ?? '');
      setRenewalType(contract.renewalType ?? 'None');
      setRenewalTerms(contract.renewalTerms ?? '');
      setReminderDays(contract.reminderDays.toString());
      setTerminationClause(contract.terminationClause ?? '');
      setFileUrl(contract.fileUrl ?? '');
      setNotes(contract.notes ?? '');
    } else {
      setTitle('');
      setClientId('');
      setType('Retainer');
      setStatus('Draft');
      setStartDate('');
      setEndDate('');
      setValue('');
      setMonthlyValue('');
      setRenewalType('None');
      setRenewalTerms('');
      setReminderDays('30');
      setTerminationClause('');
      setFileUrl('');
      setNotes('');
    }
    setErrors({});
  }, [contract, open]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Title is required';
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      errs.endDate = 'End date must be after start date';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const saved: Contract = {
      id: contract?.id ?? generateId(),
      clientId,
      title: title.trim(),
      type,
      status,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      value: value ? parseFloat(value) : null,
      monthlyValue: monthlyValue ? parseFloat(monthlyValue) : null,
      renewalType,
      renewalTerms: renewalTerms.trim() || null,
      reminderDays: parseInt(reminderDays, 10) || 30,
      autoRenewDate: null,
      terminationClause: terminationClause.trim() || null,
      fileUrl: fileUrl.trim() || null,
      notes: notes.trim() || null,
      createdAt: contract?.createdAt ?? new Date(),
      updatedAt: new Date(),
    };

    onSave(saved);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {contract ? 'Edit Contract' : 'New Contract'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Title *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contract title"
              />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Client</Label>
              <Select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
              >
                <option value="">Select client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Type</Label>
              <Select
                value={type}
                onChange={(e) => setType(e.target.value as ContractTypeLiteral)}
              >
                {Object.values(ContractType).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Status</Label>
              <Select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as ContractStatusLiteral)
                }
              >
                {Object.values(ContractStatus).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
              {errors.endDate && (
                <p className="text-xs text-destructive">{errors.endDate}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Total Value ($)
              </Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Monthly Value ($)
              </Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={monthlyValue}
                onChange={(e) => setMonthlyValue(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Renewal Type
              </Label>
              <Select
                value={renewalType}
                onChange={(e) => setRenewalType(e.target.value)}
              >
                <option value="None">None</option>
                <option value="Auto">Auto</option>
                <option value="Manual">Manual</option>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Reminder Days
              </Label>
              <Input
                type="number"
                min={0}
                value={reminderDays}
                onChange={(e) => setReminderDays(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">File URL</Label>
              <Input
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Renewal Terms
            </Label>
            <Textarea
              value={renewalTerms}
              onChange={(e) => setRenewalTerms(e.target.value)}
              rows={2}
              placeholder="Renewal terms..."
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Termination Clause
            </Label>
            <Textarea
              value={terminationClause}
              onChange={(e) => setTerminationClause(e.target.value)}
              rows={2}
              placeholder="Termination terms..."
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Additional notes..."
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {contract ? 'Save Changes' : 'Create Contract'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
