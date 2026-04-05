'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import { AlertTriangle, RotateCcw, Loader2 } from 'lucide-react';

export function DangerZone() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [resetting, setResetting] = useState(false);

  const isConfirmed = confirmation === 'RESET';

  const handleReset = async () => {
    if (!isConfirmed) return;
    setResetting(true);
    try {
      await fetch('/api/settings/reset', { method: 'POST' });
      window.location.reload();
    } catch {
      // handle silently
    } finally {
      setResetting(false);
    }
  };

  return (
    <Card className="border-red-500/30 bg-[#12122a]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-400">
          <AlertTriangle className="h-5 w-5" />
          Danger Zone
        </CardTitle>
        <CardDescription className="text-red-400/70">
          Irreversible actions that affect all your data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between rounded-lg border border-red-500/20 bg-red-500/5 p-4">
          <div>
            <p className="text-sm font-medium text-white">Reset to Demo Data</p>
            <p className="text-xs text-slate-400">
              Replace all current data with the default demo dataset. This cannot be undone.
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) setConfirmation('');
          }}>
            <DialogTrigger className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 bg-transparent px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10">
              <RotateCcw className="h-4 w-4" />
              Reset
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-red-400">Reset to Demo Data</DialogTitle>
                <DialogDescription>
                  This will permanently delete all your current data and replace it with the default demo dataset. This action cannot be undone.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-2">
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                    <div className="text-sm text-red-400">
                      <p className="font-medium">You will lose:</p>
                      <ul className="mt-1 list-inside list-disc space-y-0.5 text-red-400/80">
                        <li>All client records and history</li>
                        <li>All deals and pipeline data</li>
                        <li>All invoices and payments</li>
                        <li>All time entries</li>
                        <li>All tasks and activities</li>
                        <li>All custom settings</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-slate-400">
                    Type <span className="font-mono font-bold text-red-400">RESET</span> to confirm:
                  </p>
                  <Input
                    value={confirmation}
                    onChange={(e) => setConfirmation(e.target.value)}
                    placeholder="Type RESET to confirm"
                    className="border-red-500/30 focus-visible:ring-red-500"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReset}
                  disabled={!isConfirmed || resetting}
                >
                  {resetting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RotateCcw className="h-4 w-4" />
                  )}
                  {resetting ? 'Resetting...' : 'Reset All Data'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
