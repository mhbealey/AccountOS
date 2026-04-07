'use client';

import { useState } from 'react';
import {
  Settings,
  User,
  CreditCard,
  Target,
  HeartPulse,
  Database,
  AlertTriangle,
  LogOut,
  Save,
  Loader2,
  Download,
  Upload,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type TabKey = 'profile' | 'billing' | 'goals' | 'health' | 'data' | 'danger';

interface TabDef {
  key: TabKey;
  label: string;
  icon: React.ElementType;
}

const tabs: TabDef[] = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'billing', label: 'Billing Defaults', icon: CreditCard },
  { key: 'goals', label: 'Goals', icon: Target },
  { key: 'health', label: 'Health Config', icon: HeartPulse },
  { key: 'data', label: 'Data', icon: Database },
  { key: 'danger', label: 'Danger Zone', icon: AlertTriangle },
];

interface HealthWeight {
  label: string;
  key: string;
  value: number;
}

const defaultHealthWeights: HealthWeight[] = [
  { label: 'Engagement', key: 'engagement', value: 25 },
  { label: 'Satisfaction', key: 'satisfaction', value: 25 },
  { label: 'Growth', key: 'growth', value: 25 },
  { label: 'Support', key: 'support', value: 25 },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('profile');
  const [saving, setSaving] = useState(false);

  // Profile
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');

  // Billing
  const [defaultRate, setDefaultRate] = useState(150);
  const [paymentTerms, setPaymentTerms] = useState('Net 30');
  const [invoicePrefix, setInvoicePrefix] = useState('INV-');

  // Goals
  const [annualRevenue, setAnnualRevenue] = useState(120000);
  const [monthlyHours, setMonthlyHours] = useState(160);

  // Health
  const [healthWeights, setHealthWeights] = useState<HealthWeight[]>(defaultHealthWeights);

  // Danger
  const [resetConfirm, setResetConfirm] = useState('');

  const healthSum = healthWeights.reduce((sum, w) => sum + w.value, 0);

  const updateHealthWeight = (key: string, value: number) => {
    setHealthWeights((prev) =>
      prev.map((w) => (w.key === key ? { ...w, value: Math.max(0, Math.min(100, value)) } : w))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/v1/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: { name, email, businessName, address, phone, website },
          billing: { defaultRate, paymentTerms, invoicePrefix },
          goals: { annualRevenue, monthlyHours },
          healthWeights: healthWeights.reduce(
            (acc, w) => ({ ...acc, [w.key]: w.value }),
            {} as Record<string, number>
          ),
        }),
      });
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    try {
      const res = await fetch('/api/v1/settings/export');
      if (!res.ok) throw new Error('Export failed');
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'accountos-export.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // silently handle
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        await fetch('/api/v1/settings/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        window.location.reload();
      } catch {
        // silently handle
      }
    };
    input.click();
  };

  const handleReset = async () => {
    if (resetConfirm !== 'RESET') return;
    try {
      await fetch('/api/v1/settings/reset', { method: 'POST' });
      window.location.reload();
    } catch {
      // silently handle
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch {
      window.location.href = '/login';
    }
  };

  const inputClass =
    'w-full px-3 py-2 bg-[#050E1A] border border-[#1A3550] rounded-lg text-[#F0F4F8] text-sm focus:outline-none focus:border-[#00D4AA]/50';

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F0F4F8]">Settings</h1>
          <p className="text-[#829AB1] text-sm mt-1">Manage your account and preferences</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-red-400 border border-red-500/20 rounded-lg text-sm hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 flex-wrap border-b border-[#1A3550] pb-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                activeTab === tab.key
                  ? 'bg-[#00D4AA]/10 text-[#00D4AA]'
                  : 'text-[#829AB1] hover:text-[#F0F4F8] hover:bg-[#1A3550]/50'
              )}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="bg-[#0B1B2E] rounded-xl border border-[#1A3550] p-6">
        {activeTab === 'profile' && (
          <div className="space-y-4 max-w-xl">
            <h2 className="text-lg font-semibold text-[#F0F4F8] mb-4">Profile Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-[#829AB1] block mb-1">Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="text-sm text-[#829AB1] block mb-1">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
              </div>
            </div>
            <div>
              <label className="text-sm text-[#829AB1] block mb-1">Business Name</label>
              <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="text-sm text-[#829AB1] block mb-1">Address</label>
              <input value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-[#829AB1] block mb-1">Phone</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="text-sm text-[#829AB1] block mb-1">Website</label>
                <input value={website} onChange={(e) => setWebsite(e.target.value)} className={inputClass} />
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-[#00D4AA] text-[#050E1A] rounded-lg font-medium text-sm hover:bg-[#00D4AA]/90 transition-colors disabled:opacity-50 mt-2"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Changes
            </button>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="space-y-4 max-w-xl">
            <h2 className="text-lg font-semibold text-[#F0F4F8] mb-4">Billing Defaults</h2>
            <div>
              <label className="text-sm text-[#829AB1] block mb-1">Default Hourly Rate ($)</label>
              <input
                type="number"
                value={defaultRate}
                onChange={(e) => setDefaultRate(Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-sm text-[#829AB1] block mb-1">Payment Terms</label>
              <select
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className={inputClass}
              >
                {['Net 15', 'Net 30', 'Net 45', 'Net 60', 'Due on Receipt'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-[#829AB1] block mb-1">Invoice Prefix</label>
              <input value={invoicePrefix} onChange={(e) => setInvoicePrefix(e.target.value)} className={inputClass} />
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-[#00D4AA] text-[#050E1A] rounded-lg font-medium text-sm hover:bg-[#00D4AA]/90 transition-colors disabled:opacity-50 mt-2"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Changes
            </button>
          </div>
        )}

        {activeTab === 'goals' && (
          <div className="space-y-4 max-w-xl">
            <h2 className="text-lg font-semibold text-[#F0F4F8] mb-4">Goals</h2>
            <div>
              <label className="text-sm text-[#829AB1] block mb-1">Annual Revenue Target ($)</label>
              <input
                type="number"
                value={annualRevenue}
                onChange={(e) => setAnnualRevenue(Number(e.target.value))}
                className={inputClass}
              />
              <p className="text-xs text-[#829AB1] mt-1">
                Monthly: ${Math.round(annualRevenue / 12).toLocaleString()}
              </p>
            </div>
            <div>
              <label className="text-sm text-[#829AB1] block mb-1">Monthly Hours Target</label>
              <input
                type="number"
                value={monthlyHours}
                onChange={(e) => setMonthlyHours(Number(e.target.value))}
                className={inputClass}
              />
              <p className="text-xs text-[#829AB1] mt-1">
                Weekly: ~{Math.round(monthlyHours / 4.33)} hours
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-[#00D4AA] text-[#050E1A] rounded-lg font-medium text-sm hover:bg-[#00D4AA]/90 transition-colors disabled:opacity-50 mt-2"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Changes
            </button>
          </div>
        )}

        {activeTab === 'health' && (
          <div className="space-y-4 max-w-xl">
            <h2 className="text-lg font-semibold text-[#F0F4F8] mb-2">Health Score Weights</h2>
            <p className="text-sm text-[#829AB1]">
              Adjust how each factor contributes to client health scores. Weights must sum to 100.
            </p>
            <div
              className={cn(
                'text-sm font-medium px-3 py-2 rounded-lg',
                healthSum === 100
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-red-500/10 text-red-400'
              )}
            >
              Total: {healthSum} / 100 {healthSum !== 100 && '(must equal 100)'}
            </div>
            <div className="space-y-5">
              {healthWeights.map((w) => (
                <div key={w.key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm text-[#F0F4F8] font-medium">{w.label}</label>
                    <span className="text-sm text-[#829AB1] font-mono">{w.value}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={w.value}
                    onChange={(e) => updateHealthWeight(w.key, Number(e.target.value))}
                    className="w-full h-2 bg-[#1A3550] rounded-full appearance-none cursor-pointer accent-[#00D4AA]"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={handleSave}
              disabled={saving || healthSum !== 100}
              className="flex items-center gap-2 px-4 py-2 bg-[#00D4AA] text-[#050E1A] rounded-lg font-medium text-sm hover:bg-[#00D4AA]/90 transition-colors disabled:opacity-50 mt-2"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Changes
            </button>
          </div>
        )}

        {activeTab === 'data' && (
          <div className="space-y-4 max-w-xl">
            <h2 className="text-lg font-semibold text-[#F0F4F8] mb-4">Data Management</h2>
            <div className="bg-[#050E1A] rounded-lg border border-[#1A3550] p-4 space-y-3">
              <h3 className="text-sm font-medium text-[#F0F4F8]">Export Data</h3>
              <p className="text-xs text-[#829AB1]">
                Download all your data as a JSON file for backup or migration.
              </p>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg text-sm hover:bg-blue-500/20 transition-colors"
              >
                <Download size={16} />
                Export JSON
              </button>
            </div>
            <div className="bg-[#050E1A] rounded-lg border border-[#1A3550] p-4 space-y-3">
              <h3 className="text-sm font-medium text-[#F0F4F8]">Import Data</h3>
              <p className="text-xs text-[#829AB1]">
                Import data from a previously exported JSON file. This will merge with existing data.
              </p>
              <button
                onClick={handleImport}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg text-sm hover:bg-purple-500/20 transition-colors"
              >
                <Upload size={16} />
                Import JSON
              </button>
            </div>
          </div>
        )}

        {activeTab === 'danger' && (
          <div className="space-y-4 max-w-xl">
            <h2 className="text-lg font-semibold text-red-400 mb-4">Danger Zone</h2>
            <div className="bg-red-500/5 rounded-lg border border-red-500/20 p-4 space-y-3">
              <h3 className="text-sm font-medium text-red-400">Reset All Data</h3>
              <p className="text-xs text-[#829AB1]">
                This will permanently delete all your data including clients, contracts, invoices, and
                settings. This action cannot be undone.
              </p>
              <div>
                <label className="text-xs text-[#829AB1] block mb-1">
                  Type <span className="font-mono text-red-400">RESET</span> to confirm
                </label>
                <input
                  value={resetConfirm}
                  onChange={(e) => setResetConfirm(e.target.value)}
                  placeholder="RESET"
                  className="w-full px-3 py-2 bg-[#050E1A] border border-red-500/30 rounded-lg text-[#F0F4F8] text-sm focus:outline-none focus:border-red-500/50 font-mono"
                />
              </div>
              <button
                onClick={handleReset}
                disabled={resetConfirm !== 'RESET'}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-sm hover:bg-red-500/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Trash2 size={16} />
                Reset All Data
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
