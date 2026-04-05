'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Sparkles, Save, Loader2 } from 'lucide-react';

interface AIConfig {
  claudeApiKey: string;
  aiCopilotEnabled: boolean;
}

export function AIConfigForm() {
  const [form, setForm] = useState<AIConfig>({
    claudeApiKey: '',
    aiCopilotEnabled: false,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/settings');
        if (!res.ok) return;
        const json = await res.json();
        const data = json.data ?? json;
        setForm({
          claudeApiKey: data.claudeApiKey ? '********' : '',
          aiCopilotEnabled: data.aiCopilotEnabled ?? false,
        });
      } catch {
        // keep defaults
      }
    }
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const payload: Record<string, unknown> = {
        aiCopilotEnabled: form.aiCopilotEnabled,
      };
      // Only send key if changed from placeholder
      if (form.claudeApiKey && form.claudeApiKey !== '********') {
        payload.claudeApiKey = form.claudeApiKey;
      }
      await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // handle silently
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-[#1e1e3a] bg-[#12122a]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Sparkles className="h-5 w-5 text-indigo-400" />
          AI Configuration
        </CardTitle>
        <CardDescription>Configure the AI Copilot integration</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="apiKey">Claude API Key</Label>
          <Input
            id="apiKey"
            type="password"
            value={form.claudeApiKey}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, claudeApiKey: e.target.value }));
              setSaved(false);
            }}
            placeholder="sk-ant-..."
          />
          <p className="text-xs text-slate-500">
            API key is stored in environment variables for security
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={form.aiCopilotEnabled}
            onClick={() => {
              setForm((prev) => ({ ...prev, aiCopilotEnabled: !prev.aiCopilotEnabled }));
              setSaved(false);
            }}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
              form.aiCopilotEnabled ? 'bg-indigo-500' : 'bg-[#1e1e3a]'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg transition-transform duration-200 ${
                form.aiCopilotEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
          <Label>AI Copilot {form.aiCopilotEnabled ? 'Enabled' : 'Disabled'}</Label>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? 'Saving...' : 'Save'}
          </Button>
          {saved && <span className="text-sm text-emerald-400">Saved successfully</span>}
        </div>
      </CardContent>
    </Card>
  );
}
