'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { formatDateTime } from '@/lib/utils';
import { StickyNote, Plus } from 'lucide-react';

interface NoteEntry {
  text: string;
  timestamp: string;
}

interface NotesSectionProps {
  notes: string | null;
  onAppendNote: (updatedNotes: string) => void;
}

function parseNotes(raw: string | null): NoteEntry[] {
  if (!raw) return [];
  const entries: NoteEntry[] = [];
  const lines = raw.split('\n---\n');
  for (const block of lines) {
    const match = block.match(/^\[(.+?)\]\s*([\s\S]*)$/);
    if (match) {
      entries.push({ timestamp: match[1], text: match[2].trim() });
    } else if (block.trim()) {
      entries.push({ timestamp: '', text: block.trim() });
    }
  }
  return entries;
}

export function NotesSection({ notes, onAppendNote }: NotesSectionProps) {
  const [newNote, setNewNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const parsed = parseNotes(notes).reverse();

  const handleSubmit = async () => {
    if (!newNote.trim()) return;
    setSubmitting(true);
    const timestamp = new Date().toISOString();
    const entry = `[${timestamp}] ${newNote.trim()}`;
    const updated = notes ? `${notes}\n---\n${entry}` : entry;
    await onAppendNote(updated);
    setNewNote('');
    setSubmitting(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
        <StickyNote className="h-4 w-4" />
        Notes
      </div>

      <div className="space-y-2">
        <Textarea
          placeholder="Add a note..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          rows={3}
        />
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!newNote.trim() || submitting}
        >
          <Plus className="h-3.5 w-3.5" />
          {submitting ? 'Saving...' : 'Add Note'}
        </Button>
      </div>

      {parsed.length === 0 ? (
        <p className="text-sm text-muted-foreground">No notes yet.</p>
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {parsed.map((note, i) => (
            <div
              key={i}
              className="rounded-lg border border-border bg-secondary/50 p-3"
            >
              {note.timestamp && (
                <p className="text-xs text-muted-foreground mb-1">
                  {formatDateTime(note.timestamp)}
                </p>
              )}
              <p className="text-sm text-foreground whitespace-pre-wrap">{note.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
