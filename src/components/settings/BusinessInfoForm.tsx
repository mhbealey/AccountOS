'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Building2, Save, Loader2 } from 'lucide-react';

interface BusinessInfo {
  businessName: string;
  address: string;
  phone: string;
  website: string;
  taxId: string;
  logoUrl: string;
}

export function BusinessInfoForm() {
  const [form, setForm] = useState<BusinessInfo>({
    businessName: '',
    address: '',
    phone: '',
    website: '',
    taxId: '',
    logoUrl: '',
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
          businessName: data.businessName ?? '',
          address: data.address ?? '',
          phone: data.phone ?? '',
          website: data.website ?? '',
          taxId: data.taxId ?? '',
          logoUrl: data.logoUrl ?? '',
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
      await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // handle silently
    } finally {
      setSaving(false);
    }
  };

  const update = (field: keyof BusinessInfo) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setSaved(false);
  };

  return (
    <Card className="border-[#1e1e3a] bg-[#12122a]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Building2 className="h-5 w-5 text-indigo-400" />
          Business Info
        </CardTitle>
        <CardDescription>Your company details for invoices and branding</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="businessName">Business Name</Label>
            <Input
              id="businessName"
              value={form.businessName}
              onChange={update('businessName')}
              placeholder="Acme Consulting"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={form.phone}
              onChange={update('phone')}
              placeholder="+1 (555) 123-4567"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            value={form.address}
            onChange={update('address')}
            placeholder="123 Main St, City, State 12345"
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={form.website}
              onChange={update('website')}
              placeholder="https://example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="taxId">Tax ID</Label>
            <Input
              id="taxId"
              value={form.taxId}
              onChange={update('taxId')}
              placeholder="XX-XXXXXXX"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="logoUrl">Logo URL</Label>
          <Input
            id="logoUrl"
            value={form.logoUrl}
            onChange={update('logoUrl')}
            placeholder="https://example.com/logo.png"
          />
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
