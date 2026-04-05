'use client';

import React, { useState } from 'react';
import { Send, CheckCircle, XCircle, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

import { PaymentDialog } from '@/components/invoices/PaymentDialog';
import { getValidTransitions } from '@/lib/invoice-state-machine';
import { toast } from '@/components/layout/Toast';

interface InvoiceStatusActionsProps {
  invoiceId: string;
  currentStatus: string;
  onStatusChange: (status: string, extraData?: Record<string, string>) => Promise<void>;
  onSendReminder?: () => Promise<void>;
}

export function InvoiceStatusActions({
  invoiceId,
  currentStatus,
  onStatusChange,
  onSendReminder,
}: InvoiceStatusActionsProps) {
  const validTransitions = getValidTransitions(currentStatus);
  const [voidOpen, setVoidOpen] = useState(false);
  const [voidLoading, setVoidLoading] = useState(false);

  const handleVoid = async () => {
    setVoidLoading(true);
    try {
      await onStatusChange('Void');
      setVoidOpen(false);
    } finally {
      setVoidLoading(false);
    }
  };

  const handleMarkSent = async () => {
    await onStatusChange('Sent');
  };

  const handleMarkPaid = async (data: { paidDate: string; paymentMethod: string }) => {
    await onStatusChange('Paid', data);
  };

  const handleReminder = async () => {
    if (onSendReminder) {
      await onSendReminder();
      toast({ type: 'success', title: 'Reminder sent' });
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Mark as Sent */}
      {validTransitions.includes('Sent') && (
        <Button onClick={handleMarkSent} size="sm">
          <Send className="mr-1.5 h-3.5 w-3.5" />
          Mark as Sent
        </Button>
      )}

      {/* Mark as Paid */}
      {validTransitions.includes('Paid') && (
        <PaymentDialog onConfirm={handleMarkPaid}>
          <Button size="sm" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
            <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
            Mark as Paid
          </Button>
        </PaymentDialog>
      )}

      {/* Send Reminder (for Sent/Overdue) */}
      {(currentStatus === 'Sent' || currentStatus === 'Overdue') && onSendReminder && (
        <Button variant="outline" size="sm" onClick={handleReminder}>
          <Bell className="mr-1.5 h-3.5 w-3.5" />
          Send Reminder
        </Button>
      )}

      {/* Void */}
      {validTransitions.includes('Void') && (
        <Dialog open={voidOpen} onOpenChange={setVoidOpen}>
          <DialogTrigger
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 cursor-pointer bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 active:bg-destructive/80 h-8 rounded-md px-3 text-xs"
          >
            <XCircle className="mr-1.5 h-3.5 w-3.5" />
            Void
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Void Invoice</DialogTitle>
              <DialogDescription>
                Are you sure you want to void this invoice? This will unlink all associated time entries,
                making them available for new invoices. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setVoidOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleVoid} disabled={voidLoading}>
                {voidLoading ? 'Voiding...' : 'Void Invoice'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
