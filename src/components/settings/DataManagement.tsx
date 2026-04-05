'use client';

import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
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
import { Database, Download, Upload, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

interface ImportPreview {
  tables: { name: string; count: number }[];
  valid: boolean;
  errors: string[];
}

export function DataManagement() {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch('/api/settings/export');
      if (!res.ok) throw new Error('Export failed');
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `accountos-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setExportDialogOpen(false);
    } catch {
      // handle silently
    } finally {
      setExporting(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    setImportPreview(null);
    setImportSuccess(false);

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Basic schema validation preview
      const tables: { name: string; count: number }[] = [];
      const errors: string[] = [];
      const expectedTables = ['clients', 'deals', 'invoices', 'tasks', 'timeEntries', 'contacts', 'contracts', 'activities'];

      for (const table of expectedTables) {
        if (data[table]) {
          if (Array.isArray(data[table])) {
            tables.push({ name: table, count: data[table].length });
          } else {
            errors.push(`"${table}" is not an array`);
          }
        }
      }

      if (tables.length === 0 && Object.keys(data).length > 0) {
        // Check if it has settings-like structure
        tables.push({ name: 'settings', count: 1 });
      }

      if (tables.length === 0) {
        errors.push('No recognized data tables found in file');
      }

      setImportPreview({
        tables,
        valid: errors.length === 0 && tables.length > 0,
        errors,
      });
      setImportDialogOpen(true);
    } catch {
      setImportPreview({
        tables: [],
        valid: false,
        errors: ['Invalid JSON file'],
      });
      setImportDialogOpen(true);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImportConfirm = async () => {
    if (!importFile || !importPreview?.valid) return;

    setImporting(true);
    try {
      const text = await importFile.text();
      const res = await fetch('/api/settings/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: text,
      });
      if (!res.ok) throw new Error('Import failed');
      setImportSuccess(true);
      setTimeout(() => {
        setImportDialogOpen(false);
        setImportPreview(null);
        setImportFile(null);
        setImportSuccess(false);
      }, 2000);
    } catch {
      // handle silently
    } finally {
      setImporting(false);
    }
  };

  return (
    <Card className="border-[#1e1e3a] bg-[#12122a]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Database className="h-5 w-5 text-indigo-400" />
          Data Management
        </CardTitle>
        <CardDescription>Export or import your full database</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Export */}
          <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
            <DialogTrigger className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#1e1e3a] bg-[#0a0a1a] px-4 py-6 text-sm font-medium text-white transition-colors hover:bg-[#1e1e3a]">
              <Download className="h-5 w-5 text-indigo-400" />
              Export Data
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Export Data</DialogTitle>
                <DialogDescription>
                  Download your full database as a JSON file. This includes all clients, deals, invoices, tasks, time entries, and settings.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setExportDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleExport} disabled={exporting}>
                  {exporting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  {exporting ? 'Exporting...' : 'Download JSON'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Import */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#1e1e3a] bg-[#0a0a1a] px-4 py-6 text-sm font-medium text-white transition-colors hover:bg-[#1e1e3a]"
            >
              <Upload className="h-5 w-5 text-indigo-400" />
              Import Data
            </button>
          </div>
        </div>

        {/* Import preview dialog */}
        <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Import Data Preview</DialogTitle>
              <DialogDescription>
                Review the data before importing. This will overwrite existing data.
              </DialogDescription>
            </DialogHeader>

            {importSuccess ? (
              <div className="flex flex-col items-center gap-2 py-4">
                <CheckCircle className="h-10 w-10 text-emerald-400" />
                <p className="text-sm font-medium text-emerald-400">Import successful</p>
              </div>
            ) : importPreview ? (
              <div className="space-y-3">
                {importPreview.errors.length > 0 && (
                  <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                    {importPreview.errors.map((err, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-red-400">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        {err}
                      </div>
                    ))}
                  </div>
                )}

                {importPreview.tables.length > 0 && (
                  <div className="rounded-lg border border-[#1e1e3a] bg-[#0a0a1a] p-3">
                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-400">
                      Data to import
                    </p>
                    {importPreview.tables.map((table) => (
                      <div key={table.name} className="flex items-center justify-between py-1">
                        <span className="text-sm text-slate-300">{table.name}</span>
                        <span className="text-sm font-medium text-white">{table.count} records</span>
                      </div>
                    ))}
                  </div>
                )}

                {importPreview.valid && (
                  <p className="text-xs text-amber-400">
                    Warning: Importing will replace all existing data with the imported data.
                  </p>
                )}
              </div>
            ) : null}

            <DialogFooter>
              <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleImportConfirm}
                disabled={importing || !importPreview?.valid || importSuccess}
                variant={importPreview?.valid ? 'default' : 'destructive'}
              >
                {importing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                {importing ? 'Importing...' : 'Confirm Import'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
