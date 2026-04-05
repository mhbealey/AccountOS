'use client';

import React, { useState } from 'react';
import { CreditCard } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface PaymentDialogProps {
  onConfirm: (data: { paidDate: string; paymentMethod: string }) => Promise<void>;
  children: React.ReactElement<{ onClick?: () => void }>;
}

const PAYMENT_METHODS = ['Bank Transfer', 'Credit Card', 'Check', 'Cash', 'PayPal', 'Stripe', 'Other'];

export function PaymentDialog({ onConfirm, children }: PaymentDialogProps) {
  const today = new Date().toISOString().split('T')[0];
  const [open, setOpen] = useState(false);
  const [paidDate, setPaidDate] = useState(today);
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await onConfirm({ paidDate, paymentMethod });
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {React.cloneElement(children, { onClick: () => setOpen(true) })}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>Enter the payment details for this invoice.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label>Payment Date</Label>
              <Input type="date" value={paidDate} onChange={(e) => setPaidDate(e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={submitting}>
              <CreditCard className="mr-2 h-4 w-4" />
              {submitting ? 'Recording...' : 'Record Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
