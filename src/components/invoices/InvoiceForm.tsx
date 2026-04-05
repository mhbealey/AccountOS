'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { FileText, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { InvoiceLineItems, type LineItem } from '@/components/invoices/InvoiceLineItems';
import { formatCurrency } from '@/lib/utils';
import { toast } from '@/components/layout/Toast';

interface Client {
  id: string;
  name: string;
}

interface TimeEntry {
  id: string;
  description: string;
  hours: number;
  rate: number;
  date: string;
  client: { id: string; name: string } | null;
}

interface InvoiceFormProps {
  clients: Client[];
  onSave: (data: {
    clientId: string;
    lineItems: Omit<LineItem, 'id'>[];
    tax: number;
    issuedDate: string;
    dueDate: string;
    notes: string;
    terms: string;
    timeEntryIds: string[];
  }) => Promise<void>;
  onCancel: () => void;
}

const PAYMENT_TERMS: Record<string, number> = {
  'Net 15': 15,
  'Net 30': 30,
  'Net 45': 45,
  Custom: 0,
};

export function InvoiceForm({ clients, onSave, onCancel }: InvoiceFormProps) {
  const today = new Date().toISOString().split('T')[0];

  const [clientId, setClientId] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [tax, setTax] = useState(0);
  const [issuedDate, setIssuedDate] = useState(today);
  const [paymentTerms, setPaymentTerms] = useState('Net 30');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('Payment is due within the terms specified above.');
  const [submitting, setSubmitting] = useState(false);

  // Time entries for selected client
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [selectedTimeEntries, setSelectedTimeEntries] = useState<Set<string>>(new Set());
  const [loadingEntries, setLoadingEntries] = useState(false);

  // Calculate due date from payment terms
  useEffect(() => {
    if (paymentTerms !== 'Custom' && issuedDate) {
      const days = PAYMENT_TERMS[paymentTerms] || 30;
      const issued = new Date(issuedDate);
      const due = new Date(issued.getTime() + days * 86400000);
      setDueDate(due.toISOString().split('T')[0]);
    }
  }, [paymentTerms, issuedDate]);

  // Fetch uninvoiced time entries for client
  useEffect(() => {
    if (!clientId) {
      setTimeEntries([]);
      setSelectedTimeEntries(new Set());
      return;
    }

    setLoadingEntries(true);
    fetch(`/api/time-entries?clientId=${clientId}&uninvoiced=true`)
      .then((res) => res.json())
      .then((data) => {
        setTimeEntries(data);
        setSelectedTimeEntries(new Set(data.map((e: TimeEntry) => e.id)));
      })
      .catch(() => {
        setTimeEntries([]);
      })
      .finally(() => setLoadingEntries(false));
  }, [clientId]);

  // Auto-generate line items from selected time entries
  useEffect(() => {
    if (selectedTimeEntries.size === 0) return;

    const selected = timeEntries.filter((e) => selectedTimeEntries.has(e.id));
    const items: LineItem[] = selected.map((e) => ({
      id: e.id,
      description: `${e.description} (${new Date(e.date).toLocaleDateString()})`,
      quantity: e.hours,
      unitPrice: e.rate,
      amount: e.hours * e.rate,
    }));

    setLineItems((prev) => {
      // Keep custom items (those without matching time entry id)
      const customItems = prev.filter(
        (item) => !timeEntries.some((te) => te.id === item.id)
      );
      return [...items, ...customItems];
    });
  }, [selectedTimeEntries, timeEntries]);

  const toggleTimeEntry = (id: string) => {
    setSelectedTimeEntries((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const subtotal = useMemo(() => lineItems.reduce((sum, item) => sum + item.amount, 0), [lineItems]);
  const taxAmount = subtotal * (tax / 100);
  const total = subtotal + taxAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientId) {
      toast({ type: 'error', title: 'Please select a client' });
      return;
    }

    if (lineItems.length === 0) {
      toast({ type: 'error', title: 'Add at least one line item' });
      return;
    }

    if (!issuedDate || !dueDate) {
      toast({ type: 'error', title: 'Issue date and due date are required' });
      return;
    }

    setSubmitting(true);
    try {
      await onSave({
        clientId,
        lineItems: lineItems.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.amount,
        })),
        tax,
        issuedDate,
        dueDate,
        notes,
        terms,
        timeEntryIds: Array.from(selectedTimeEntries),
      });
    } catch {
      toast({ type: 'error', title: 'Failed to create invoice' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-3">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back
        </Button>
        <h2 className="text-lg font-semibold text-foreground">New Invoice</h2>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column: main form */}
        <div className="space-y-6 lg:col-span-2">
          {/* Client selection */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="mb-4 text-sm font-semibold text-foreground">Client</h3>
            <Select value={clientId} onChange={(e) => setClientId(e.target.value)}>
              <option value="">Select a client...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>

          {/* Uninvoiced time entries */}
          {clientId && (
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mb-4 text-sm font-semibold text-foreground">Uninvoiced Time Entries</h3>
              {loadingEntries ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-8 rounded bg-secondary" />
                  <div className="h-8 rounded bg-secondary" />
                </div>
              ) : timeEntries.length === 0 ? (
                <p className="text-sm text-muted-foreground">No uninvoiced time entries for this client.</p>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{selectedTimeEntries.size} of {timeEntries.length} selected</span>
                    <button
                      type="button"
                      className="text-primary hover:underline"
                      onClick={() => {
                        if (selectedTimeEntries.size === timeEntries.length) {
                          setSelectedTimeEntries(new Set());
                        } else {
                          setSelectedTimeEntries(new Set(timeEntries.map((e) => e.id)));
                        }
                      }}
                    >
                      {selectedTimeEntries.size === timeEntries.length ? 'Deselect all' : 'Select all'}
                    </button>
                  </div>
                  <div className="max-h-48 space-y-1 overflow-y-auto">
                    {timeEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-secondary/50"
                      >
                        <Checkbox
                          checked={selectedTimeEntries.has(entry.id)}
                          onCheckedChange={() => toggleTimeEntry(entry.id)}
                        />
                        <div className="flex-1 text-sm">
                          <span className="text-foreground">{entry.description}</span>
                          <span className="ml-2 text-xs text-muted-foreground">
                            {new Date(entry.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-sm font-mono text-muted-foreground">
                          {entry.hours}h x {formatCurrency(entry.rate)}
                        </div>
                        <div className="text-sm font-medium text-foreground">
                          {formatCurrency(entry.hours * entry.rate)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Line Items */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="mb-4 text-sm font-semibold text-foreground">Line Items</h3>
            <InvoiceLineItems items={lineItems} onChange={setLineItems} />
          </div>

          {/* Notes and Terms */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-6">
              <Label>Notes</Label>
              <Textarea
                className="mt-2"
                placeholder="Notes visible on the invoice..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </div>
            <div className="rounded-xl border border-border bg-card p-6">
              <Label>Terms & Conditions</Label>
              <Textarea
                className="mt-2"
                placeholder="Payment terms and conditions..."
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                rows={4}
              />
            </div>
          </div>
        </div>

        {/* Right column: summary + dates */}
        <div className="space-y-6">
          {/* Dates */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Invoice Details</h3>

            <div className="space-y-1.5">
              <Label>Issue Date</Label>
              <Input type="date" value={issuedDate} onChange={(e) => setIssuedDate(e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <Label>Payment Terms</Label>
              <Select value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)}>
                {Object.keys(PAYMENT_TERMS).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Due Date</Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                readOnly={paymentTerms !== 'Custom'}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Tax (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={tax}
                onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Totals */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="mb-4 text-sm font-semibold text-foreground">Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-medium text-foreground">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Tax ({tax}%)</span>
                <span className="font-medium text-foreground">{formatCurrency(taxAmount)}</span>
              </div>
              <div className="border-t border-border pt-2">
                <div className="flex justify-between">
                  <span className="text-base font-semibold text-foreground">Total</span>
                  <span className="text-base font-bold text-primary">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button type="submit" disabled={submitting} className="w-full">
              <FileText className="mr-2 h-4 w-4" />
              {submitting ? 'Saving...' : 'Save as Draft'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="w-full">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
