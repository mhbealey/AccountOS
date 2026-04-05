'use client';

import React from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface InvoiceLineItemsProps {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
  readOnly?: boolean;
}

export function InvoiceLineItems({ items, onChange, readOnly = false }: InvoiceLineItemsProps) {
  const addItem = () => {
    onChange([
      ...items,
      {
        id: crypto.randomUUID(),
        description: '',
        quantity: 1,
        unitPrice: 0,
        amount: 0,
      },
    ]);
  };

  const updateItem = (index: number, field: keyof LineItem, value: string | number) => {
    const updated = [...items];
    const item = { ...updated[index] };

    if (field === 'description') {
      item.description = value as string;
    } else if (field === 'quantity') {
      item.quantity = parseFloat(value as string) || 0;
      item.amount = item.quantity * item.unitPrice;
    } else if (field === 'unitPrice') {
      item.unitPrice = parseFloat(value as string) || 0;
      item.amount = item.quantity * item.unitPrice;
    }

    updated[index] = item;
    onChange(updated);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  if (readOnly) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3 text-right">Qty</th>
              <th className="px-4 py-3 text-right">Unit Price</th>
              <th className="px-4 py-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-border/50">
                <td className="px-4 py-3 text-foreground">{item.description}</td>
                <td className="px-4 py-3 text-right font-mono text-foreground">{item.quantity}</td>
                <td className="px-4 py-3 text-right text-foreground">{formatCurrency(item.unitPrice)}</td>
                <td className="px-4 py-3 text-right font-medium text-foreground">
                  {formatCurrency(item.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/30 text-left text-xs font-medium text-muted-foreground">
              <th className="w-8 px-2 py-2" />
              <th className="px-3 py-2">Description</th>
              <th className="w-24 px-3 py-2 text-right">Qty</th>
              <th className="w-32 px-3 py-2 text-right">Unit Price</th>
              <th className="w-32 px-3 py-2 text-right">Amount</th>
              <th className="w-10 px-2 py-2" />
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id} className="border-b border-border/50">
                <td className="px-2 py-2 text-muted-foreground">
                  <GripVertical className="h-4 w-4" />
                </td>
                <td className="px-3 py-2">
                  <Input
                    placeholder="Line item description"
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    className="h-8 text-sm"
                  />
                </td>
                <td className="px-3 py-2">
                  <Input
                    type="number"
                    min="0"
                    step="0.5"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                    className="h-8 text-right text-sm"
                  />
                </td>
                <td className="px-3 py-2">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                    className="h-8 text-right text-sm"
                  />
                </td>
                <td className="px-3 py-2 text-right font-mono font-medium text-foreground">
                  {formatCurrency(item.amount)}
                </td>
                <td className="px-2 py-2">
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    aria-label="Remove line item"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Button type="button" variant="outline" size="sm" onClick={addItem}>
        <Plus className="mr-1.5 h-3.5 w-3.5" />
        Add Line Item
      </Button>
    </div>
  );
}
