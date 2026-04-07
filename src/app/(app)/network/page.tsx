'use client';

import { useEffect, useState } from 'react';
import {
  Globe,
  Plus,
  X,
  Loader2,
  AlertCircle,
  Search,
  Calendar,
  Building2,
  Tag,
  User,
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';

interface Contact {
  id: string;
  name: string;
  company: string;
  title: string;
  relationshipType: string;
  lastContactAt: string | null;
  nextFollowUp: string | null;
  tags: string[];
  email?: string;
  phone?: string;
}

const relationshipColors: Record<string, string> = {
  Client: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Prospect: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Partner: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  Vendor: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  Referral: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  Personal: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  Other: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

const relationshipTypes = ['All', 'Client', 'Prospect', 'Partner', 'Vendor', 'Referral', 'Personal', 'Other'];

const emptyForm = {
  name: '',
  company: '',
  title: '',
  relationshipType: 'Prospect',
  email: '',
  phone: '',
  tags: '',
  nextFollowUp: '',
};

export default function NetworkPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  useEffect(() => {
    async function fetchContacts() {
      try {
        setLoading(true);
        const res = await fetch('/api/v1/network');
        if (!res.ok) throw new Error(`Failed to load contacts (${res.status})`);
        const json = await res.json();
        setContacts(Array.isArray(json) ? json : json.contacts ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    }
    fetchContacts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        tags: form.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      };
      const res = await fetch('/api/v1/network', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to create contact');
      const created = await res.json();
      setContacts((prev) => [created, ...prev]);
      setShowModal(false);
      setForm(emptyForm);
    } catch {
      // silently handle
    }
  };

  const filtered = contacts.filter((c) => {
    const matchesSearch =
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.company?.toLowerCase().includes(search.toLowerCase()) ||
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchesType = typeFilter === 'All' || c.relationshipType === typeFilter;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#00D4AA]" />
          <p className="text-[#829AB1] text-sm">Loading network...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-center px-4">
          <AlertCircle className="h-8 w-8 text-red-400" />
          <p className="text-red-400 font-medium">Failed to load network</p>
          <p className="text-[#829AB1] text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F0F4F8]">Network</h1>
          <p className="text-[#829AB1] text-sm mt-1">Your professional contacts and relationships</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#00D4AA] text-[#050E1A] rounded-lg font-medium text-sm hover:bg-[#00D4AA]/90 transition-colors"
        >
          <Plus size={16} />
          Add Contact
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#829AB1]" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#0B1B2E] border border-[#1A3550] rounded-lg text-[#F0F4F8] text-sm placeholder:text-[#829AB1]/50 focus:outline-none focus:border-[#00D4AA]/50"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {relationshipTypes.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                typeFilter === t
                  ? 'bg-[#00D4AA]/10 text-[#00D4AA] border border-[#00D4AA]/30'
                  : 'bg-[#0B1B2E] text-[#829AB1] border border-[#1A3550] hover:border-[#829AB1]/30'
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((contact) => (
          <div
            key={contact.id}
            className="bg-[#0B1B2E] rounded-xl border border-[#1A3550] p-5 space-y-3 hover:border-[#00D4AA]/30 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <h3 className="text-[#F0F4F8] font-semibold truncate">{contact.name}</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {contact.title && (
                    <span className="text-[#829AB1] text-sm truncate">{contact.title}</span>
                  )}
                  {contact.title && contact.company && (
                    <span className="text-[#829AB1]/40 text-sm">at</span>
                  )}
                  {contact.company && (
                    <span className="text-[#829AB1] text-sm truncate flex items-center gap-1">
                      <Building2 size={12} />
                      {contact.company}
                    </span>
                  )}
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#1A3550] flex items-center justify-center shrink-0">
                <User size={14} className="text-[#829AB1]" />
              </div>
            </div>

            <div>
              <span
                className={cn(
                  'px-2 py-0.5 rounded-full text-xs font-medium border',
                  relationshipColors[contact.relationshipType] ?? relationshipColors.Other
                )}
              >
                {contact.relationshipType}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              {contact.lastContactAt && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[#829AB1]">
                    <Calendar size={14} />
                    Last Contact
                  </span>
                  <span className="text-[#F0F4F8]">{formatDate(contact.lastContactAt)}</span>
                </div>
              )}
              {contact.nextFollowUp && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[#829AB1]">
                    <Calendar size={14} />
                    Next Follow-up
                  </span>
                  <span className="text-[#00D4AA]">{formatDate(contact.nextFollowUp)}</span>
                </div>
              )}
            </div>

            {contact.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {contact.tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 px-2 py-0.5 bg-[#1A3550]/50 text-[#829AB1] text-xs rounded-full"
                  >
                    <Tag size={10} />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <Globe className="h-12 w-12 text-[#829AB1]/30 mx-auto mb-3" />
          <p className="text-[#829AB1]">No contacts found</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[#0B1B2E] border border-[#1A3550] rounded-xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#F0F4F8]">Add Contact</h2>
              <button onClick={() => setShowModal(false)} className="text-[#829AB1] hover:text-[#F0F4F8]">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-sm text-[#829AB1] block mb-1">Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#050E1A] border border-[#1A3550] rounded-lg text-[#F0F4F8] text-sm focus:outline-none focus:border-[#00D4AA]/50"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-[#829AB1] block mb-1">Company</label>
                  <input
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    className="w-full px-3 py-2 bg-[#050E1A] border border-[#1A3550] rounded-lg text-[#F0F4F8] text-sm focus:outline-none focus:border-[#00D4AA]/50"
                  />
                </div>
                <div>
                  <label className="text-sm text-[#829AB1] block mb-1">Title</label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-3 py-2 bg-[#050E1A] border border-[#1A3550] rounded-lg text-[#F0F4F8] text-sm focus:outline-none focus:border-[#00D4AA]/50"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-[#829AB1] block mb-1">Relationship Type</label>
                <select
                  value={form.relationshipType}
                  onChange={(e) => setForm({ ...form, relationshipType: e.target.value })}
                  className="w-full px-3 py-2 bg-[#050E1A] border border-[#1A3550] rounded-lg text-[#F0F4F8] text-sm focus:outline-none focus:border-[#00D4AA]/50"
                >
                  {relationshipTypes.filter((t) => t !== 'All').map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-[#829AB1] block mb-1">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 bg-[#050E1A] border border-[#1A3550] rounded-lg text-[#F0F4F8] text-sm focus:outline-none focus:border-[#00D4AA]/50"
                  />
                </div>
                <div>
                  <label className="text-sm text-[#829AB1] block mb-1">Phone</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-[#050E1A] border border-[#1A3550] rounded-lg text-[#F0F4F8] text-sm focus:outline-none focus:border-[#00D4AA]/50"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-[#829AB1] block mb-1">Next Follow-up</label>
                <input
                  type="date"
                  value={form.nextFollowUp}
                  onChange={(e) => setForm({ ...form, nextFollowUp: e.target.value })}
                  className="w-full px-3 py-2 bg-[#050E1A] border border-[#1A3550] rounded-lg text-[#F0F4F8] text-sm focus:outline-none focus:border-[#00D4AA]/50"
                />
              </div>
              <div>
                <label className="text-sm text-[#829AB1] block mb-1">Tags (comma-separated)</label>
                <input
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="e.g. design, agency, referral"
                  className="w-full px-3 py-2 bg-[#050E1A] border border-[#1A3550] rounded-lg text-[#F0F4F8] text-sm placeholder:text-[#829AB1]/50 focus:outline-none focus:border-[#00D4AA]/50"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-[#829AB1] hover:text-[#F0F4F8] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00D4AA] text-[#050E1A] rounded-lg font-medium text-sm hover:bg-[#00D4AA]/90 transition-colors"
                >
                  Add Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
