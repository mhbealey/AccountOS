'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { TimeEntry, Invoice } from '@/types';
import { Clock, DollarSign, Receipt, AlertCircle } from 'lucide-react';

interface ClientFinancialsTabProps {
  timeEntries: TimeEntry[];
  invoices: Invoice[];
}

function getInvoiceStatusVariant(status: string) {
  switch (status) {
    case 'Paid': return 'success';
    case 'Sent': case 'Viewed': return 'info';
    case 'Overdue': return 'danger';
    case 'Draft': return 'default';
    case 'Void': return 'default';
    default: return 'default';
  }
}

export function ClientFinancialsTab({ timeEntries, invoices }: ClientFinancialsTabProps) {
  const totalHours = timeEntries.reduce((sum, te) => sum + te.hours, 0);
  const totalRevenue = timeEntries.reduce((sum, te) => sum + te.hours * te.rate, 0);
  const averageRate = totalHours > 0 ? totalRevenue / totalHours : 0;
  const outstandingAmount = invoices
    .filter((inv) => ['Sent', 'Viewed', 'Overdue'].includes(inv.status))
    .reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border bg-[#12122a] p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Clock className="h-4 w-4" />
            <span className="text-xs">Total Hours</span>
          </div>
          <p className="text-2xl font-bold text-white">{totalHours.toFixed(1)}</p>
        </Card>
        <Card className="border-border bg-[#12122a] p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <DollarSign className="h-4 w-4" />
            <span className="text-xs">Total Revenue</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(totalRevenue)}</p>
        </Card>
        <Card className="border-border bg-[#12122a] p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Receipt className="h-4 w-4" />
            <span className="text-xs">Average Rate</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(averageRate)}/hr</p>
        </Card>
        <Card className="border-border bg-[#12122a] p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <AlertCircle className="h-4 w-4" />
            <span className="text-xs">Outstanding</span>
          </div>
          <p className={`text-2xl font-bold ${outstandingAmount > 0 ? 'text-yellow-400' : 'text-white'}`}>
            {formatCurrency(outstandingAmount)}
          </p>
        </Card>
      </div>

      {/* Time entries table */}
      <Card className="border-border bg-[#12122a]">
        <CardHeader>
          <CardTitle className="text-sm">Time Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {timeEntries.length === 0 ? (
            <EmptyState
              icon={<Clock className="h-6 w-6" />}
              title="No time entries"
              description="Time tracked for this client will appear here."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="pb-2 pr-4">Date</th>
                    <th className="pb-2 pr-4">Description</th>
                    <th className="pb-2 pr-4">Category</th>
                    <th className="pb-2 pr-4 text-right">Hours</th>
                    <th className="pb-2 pr-4 text-right">Rate</th>
                    <th className="pb-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {timeEntries.map((te) => (
                    <tr key={te.id} className="border-b border-border/50">
                      <td className="py-2 pr-4 text-muted-foreground">{formatDate(te.date)}</td>
                      <td className="py-2 pr-4 text-foreground">{te.description}</td>
                      <td className="py-2 pr-4">
                        {te.category && <Badge variant="default">{te.category}</Badge>}
                      </td>
                      <td className="py-2 pr-4 text-right text-foreground">{te.hours.toFixed(1)}</td>
                      <td className="py-2 pr-4 text-right text-muted-foreground">{formatCurrency(te.rate)}</td>
                      <td className="py-2 text-right text-foreground">{formatCurrency(te.hours * te.rate)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-semibold">
                    <td colSpan={3} className="pt-2 text-muted-foreground">Total</td>
                    <td className="pt-2 text-right">{totalHours.toFixed(1)}</td>
                    <td className="pt-2"></td>
                    <td className="pt-2 text-right">{formatCurrency(totalRevenue)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoices table */}
      <Card className="border-border bg-[#12122a]">
        <CardHeader>
          <CardTitle className="text-sm">Invoice History</CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <EmptyState
              icon={<Receipt className="h-6 w-6" />}
              title="No invoices"
              description="Invoices for this client will appear here."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="pb-2 pr-4">Invoice #</th>
                    <th className="pb-2 pr-4">Status</th>
                    <th className="pb-2 pr-4">Issued</th>
                    <th className="pb-2 pr-4">Due</th>
                    <th className="pb-2 pr-4">Paid</th>
                    <th className="pb-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="border-b border-border/50">
                      <td className="py-2 pr-4 text-foreground font-medium">{inv.number}</td>
                      <td className="py-2 pr-4">
                        <Badge variant={getInvoiceStatusVariant(inv.status) as 'default' | 'success' | 'warning' | 'danger' | 'info'}>
                          {inv.status}
                        </Badge>
                      </td>
                      <td className="py-2 pr-4 text-muted-foreground">{formatDate(inv.issuedDate)}</td>
                      <td className="py-2 pr-4 text-muted-foreground">{formatDate(inv.dueDate)}</td>
                      <td className="py-2 pr-4 text-muted-foreground">
                        {inv.paidDate ? formatDate(inv.paidDate) : '-'}
                      </td>
                      <td className="py-2 text-right text-foreground">{formatCurrency(inv.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
