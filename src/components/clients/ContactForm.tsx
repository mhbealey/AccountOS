'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import type { Contact, ContactRoleLiteral, SentimentLiteral } from '@/types';

const ROLE_OPTIONS: { value: ContactRoleLiteral; label: string }[] = [
  { value: 'DecisionMaker', label: 'Decision Maker' },
  { value: 'Champion', label: 'Champion' },
  { value: 'Influencer', label: 'Influencer' },
  { value: 'Blocker', label: 'Blocker' },
  { value: 'EndUser', label: 'End User' },
  { value: 'BudgetHolder', label: 'Budget Holder' },
];

const SENTIMENT_OPTIONS: SentimentLiteral[] = ['Positive', 'Neutral', 'Negative', 'Unknown'];

interface ContactFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact?: Contact | null;
  onSubmit: (data: Partial<Contact>) => Promise<void>;
}

export function ContactForm({ open, onOpenChange, contact, onSubmit }: ContactFormProps) {
  const isEdit = !!contact;

  const [form, setForm] = useState({
    name: '',
    title: '',
    email: '',
    phone: '',
    role: '' as string,
    sentiment: 'Unknown' as SentimentLiteral,
    isPrimary: false,
    isExecutive: false,
    linkedinUrl: '',
    birthday: '',
    interests: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (contact) {
      setForm({
        name: contact.name,
        title: contact.title ?? '',
        email: contact.email ?? '',
        phone: contact.phone ?? '',
        role: contact.role ?? '',
        sentiment: contact.sentiment ?? 'Unknown',
        isPrimary: contact.isPrimary,
        isExecutive: contact.isExecutive,
        linkedinUrl: contact.linkedinUrl ?? '',
        birthday: contact.birthday ?? '',
        interests: contact.interests ?? '',
        notes: contact.notes ?? '',
      });
    } else {
      setForm({
        name: '',
        title: '',
        email: '',
        phone: '',
        role: '',
        sentiment: 'Unknown',
        isPrimary: false,
        isExecutive: false,
        linkedinUrl: '',
        birthday: '',
        interests: '',
        notes: '',
      });
    }
    setErrors({});
  }, [contact, open]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Invalid email address';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        name: form.name.trim(),
        title: form.title || null,
        email: form.email || null,
        phone: form.phone || null,
        role: (form.role as ContactRoleLiteral) || null,
        sentiment: form.sentiment,
        isPrimary: form.isPrimary,
        isExecutive: form.isExecutive,
        linkedinUrl: form.linkedinUrl || null,
        birthday: form.birthday || null,
        interests: form.interests || null,
        notes: form.notes || null,
      });
      onOpenChange(false);
    } catch {
      setErrors({ _form: 'Failed to save contact.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Contact' : 'Add Contact'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {errors._form && <p className="text-sm text-red-400">{errors._form}</p>}

          <div className="space-y-1.5">
            <Label htmlFor="ctf-name">Name *</Label>
            <Input
              id="ctf-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Jane Smith"
            />
            {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="ctf-title">Title</Label>
              <Input
                id="ctf-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="VP of Engineering"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ctf-role">Role</Label>
              <Select
                id="ctf-role"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="">Select...</option>
                {ROLE_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="ctf-email">Email</Label>
              <Input
                id="ctf-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="jane@acme.com"
              />
              {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ctf-phone">Phone</Label>
              <Input
                id="ctf-phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+1 555-0123"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ctf-sentiment">Sentiment</Label>
            <Select
              id="ctf-sentiment"
              value={form.sentiment}
              onChange={(e) => setForm({ ...form, sentiment: e.target.value as SentimentLiteral })}
            >
              {SENTIMENT_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={form.isPrimary}
                onCheckedChange={(checked) => setForm({ ...form, isPrimary: checked })}
              />
              <Label className="cursor-pointer">Primary Contact</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={form.isExecutive}
                onCheckedChange={(checked) => setForm({ ...form, isExecutive: checked })}
              />
              <Label className="cursor-pointer">Executive</Label>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ctf-linkedin">LinkedIn URL</Label>
            <Input
              id="ctf-linkedin"
              value={form.linkedinUrl}
              onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })}
              placeholder="https://linkedin.com/in/..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="ctf-birthday">Birthday</Label>
              <Input
                id="ctf-birthday"
                value={form.birthday}
                onChange={(e) => setForm({ ...form, birthday: e.target.value })}
                placeholder="MM/DD"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ctf-interests">Interests</Label>
              <Input
                id="ctf-interests"
                value={form.interests}
                onChange={(e) => setForm({ ...form, interests: e.target.value })}
                placeholder="Golf, cooking..."
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ctf-notes">Notes</Label>
            <Textarea
              id="ctf-notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Contact'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
