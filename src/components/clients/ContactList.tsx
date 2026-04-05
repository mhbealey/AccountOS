'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { ContactForm } from './ContactForm';
import { formatRelativeTime } from '@/lib/utils';
import type { Contact } from '@/types';
import {
  Plus,
  Mail,
  Phone,
  Pencil,
  Trash2,
  Users,
  Smile,
  Meh,
  Frown,
  HelpCircle,
  Link2,
  Cake,
  Heart,
} from 'lucide-react';

interface ContactListProps {
  contacts: Contact[];
  clientId: string;
  onRefresh: () => void;
}

function getRoleBadgeVariant(role: string | null) {
  switch (role) {
    case 'DecisionMaker': return 'info';
    case 'Champion': return 'success';
    case 'Influencer': return 'default';
    case 'Blocker': return 'danger';
    case 'EndUser': return 'default';
    case 'BudgetHolder': return 'warning';
    default: return 'default';
  }
}

function getRoleLabel(role: string | null) {
  switch (role) {
    case 'DecisionMaker': return 'Decision Maker';
    case 'Champion': return 'Champion';
    case 'Influencer': return 'Influencer';
    case 'Blocker': return 'Blocker';
    case 'EndUser': return 'End User';
    case 'BudgetHolder': return 'Budget Holder';
    default: return role;
  }
}

function SentimentIcon({ sentiment }: { sentiment: string | null }) {
  switch (sentiment) {
    case 'Positive': return <Smile className="h-4 w-4 text-emerald-400" />;
    case 'Negative': return <Frown className="h-4 w-4 text-red-400" />;
    case 'Neutral': return <Meh className="h-4 w-4 text-yellow-400" />;
    default: return <HelpCircle className="h-4 w-4 text-slate-500" />;
  }
}

export function ContactList({ contacts, clientId, onRefresh }: ContactListProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleCreate = async (data: Partial<Contact>) => {
    const res = await fetch(`/api/clients/${clientId}/contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create contact');
    onRefresh();
  };

  const handleUpdate = async (data: Partial<Contact>) => {
    if (!editingContact) return;
    const res = await fetch(`/api/contacts/${editingContact.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update contact');
    onRefresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this contact? This action cannot be undone.')) return;
    setDeleting(id);
    try {
      await fetch(`/api/contacts/${id}`, { method: 'DELETE' });
      onRefresh();
    } finally {
      setDeleting(null);
    }
  };

  if (contacts.length === 0 && !formOpen) {
    return (
      <>
        <EmptyState
          icon={<Users className="h-7 w-7" />}
          title="No contacts yet"
          description="Add your first contact for this client."
          actionLabel="Add Contact"
          onAction={() => setFormOpen(true)}
        />
        <ContactForm
          open={formOpen}
          onOpenChange={setFormOpen}
          onSubmit={handleCreate}
        />
      </>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-300">
          {contacts.length} Contact{contacts.length !== 1 ? 's' : ''}
        </h3>
        <Button size="sm" onClick={() => { setEditingContact(null); setFormOpen(true); }}>
          <Plus className="h-3.5 w-3.5" />
          Add Contact
        </Button>
      </div>

      <div className="space-y-3">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className="rounded-lg border border-border bg-[#12122a] p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400 text-sm font-bold">
                  {contact.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{contact.name}</span>
                    {contact.isPrimary && (
                      <Badge variant="info" className="text-[10px]">Primary</Badge>
                    )}
                    {contact.isExecutive && (
                      <Badge variant="warning" className="text-[10px]">Executive</Badge>
                    )}
                  </div>
                  {contact.title && (
                    <p className="text-xs text-muted-foreground">{contact.title}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <SentimentIcon sentiment={contact.sentiment} />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => { setEditingContact(contact); setFormOpen(true); }}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-red-400 hover:text-red-300"
                  onClick={() => handleDelete(contact.id)}
                  disabled={deleting === contact.id}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              {contact.role && (
                <Badge variant={getRoleBadgeVariant(contact.role) as 'default' | 'success' | 'warning' | 'danger' | 'info'}>
                  {getRoleLabel(contact.role)}
                </Badge>
              )}
              {contact.email && (
                <a href={`mailto:${contact.email}`} className="flex items-center gap-1 hover:text-foreground transition-colors">
                  <Mail className="h-3 w-3" />
                  {contact.email}
                </a>
              )}
              {contact.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {contact.phone}
                </span>
              )}
              {contact.lastContactAt && (
                <span>Last contact: {formatRelativeTime(contact.lastContactAt)}</span>
              )}
            </div>

            {(contact.linkedinUrl || contact.birthday || contact.interests) && (
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                {contact.linkedinUrl && (
                  <a
                    href={contact.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    <Link2 className="h-3 w-3" />
                    LinkedIn
                  </a>
                )}
                {contact.birthday && (
                  <span className="flex items-center gap-1">
                    <Cake className="h-3 w-3" />
                    {contact.birthday}
                  </span>
                )}
                {contact.interests && (
                  <span className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    {contact.interests}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <ContactForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingContact(null);
        }}
        contact={editingContact}
        onSubmit={editingContact ? handleUpdate : handleCreate}
      />
    </div>
  );
}
