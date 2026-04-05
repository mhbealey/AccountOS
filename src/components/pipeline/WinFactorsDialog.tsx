'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface WinFactorsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (factors: string) => void;
  onCancel: () => void;
  dealTitle: string;
}

export function WinFactorsDialog({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  dealTitle,
}: WinFactorsDialogProps) {
  const [factors, setFactors] = useState('');

  const handleConfirm = () => {
    onConfirm(factors);
    setFactors('');
  };

  const handleCancel = () => {
    setFactors('');
    onCancel();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Deal Won!</DialogTitle>
          <DialogDescription>
            Congratulations on closing &quot;{dealTitle}&quot;! What were the key
            factors that helped win this deal?
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <Label htmlFor="win-factors">Win Factors</Label>
          <Textarea
            id="win-factors"
            value={factors}
            onChange={(e) => setFactors(e.target.value)}
            placeholder="e.g., Strong champion, competitive pricing, great demo..."
            rows={3}
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>Confirm Win</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
