'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { VariableReference, TEMPLATE_VARIABLES } from './VariableReference';
import { TemplatePreview } from './TemplatePreview';
import type { Template } from '@/types';

// ---------------------------------------------------------------------------
// Category options
// ---------------------------------------------------------------------------

const CATEGORY_OPTIONS = [
  { value: 'welcome',          label: 'Welcome' },
  { value: 'follow_up',       label: 'Follow Up' },
  { value: 'check_in',        label: 'Check In' },
  { value: 'qbr_invite',      label: 'QBR Invite' },
  { value: 'renewal',         label: 'Renewal' },
  { value: 'thank_you',       label: 'Thank You' },
  { value: 'referral_ask',    label: 'Referral Ask' },
  { value: 'proposal_cover',  label: 'Proposal Cover' },
  { value: 'payment_reminder',label: 'Payment Reminder' },
  { value: 'offboarding',     label: 'Offboarding' },
] as const;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface TemplateFormProps {
  template?: Template | null;
  onSave: (data: {
    name: string;
    category: string;
    subject: string;
    body: string;
    variables: string;
  }) => Promise<void>;
  onCancel: () => void;
  saving?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TemplateForm({ template, onSave, onCancel, saving }: TemplateFormProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('welcome');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (template) {
      setName(template.name);
      setCategory(template.category);
      setSubject(template.subject ?? '');
      setBody(template.body);
    }
  }, [template]);

  // Detect which variables are used in the body
  const usedVariables = TEMPLATE_VARIABLES.filter(
    (v) => body.includes(v.key) || subject.includes(v.key)
  ).map((v) => v.key);

  const handleInsertVariable = (variable: string) => {
    const textarea = bodyRef.current;
    if (!textarea) {
      setBody((prev) => prev + variable);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = body.slice(0, start);
    const after = body.slice(end);
    const newBody = before + variable + after;
    setBody(newBody);
    // Restore cursor position after the inserted variable
    requestAnimationFrame(() => {
      textarea.focus();
      const pos = start + variable.length;
      textarea.setSelectionRange(pos, pos);
    });
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Name is required';
    if (!body.trim()) errs.body = 'Body is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSave({
      name: name.trim(),
      category,
      subject: subject.trim(),
      body: body.trim(),
      variables: JSON.stringify(usedVariables),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          {template ? 'Edit Template' : 'New Template'}
        </h2>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_220px]">
        {/* Left column: form fields */}
        <div className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="tpl-name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="tpl-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Welcome Email"
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label htmlFor="tpl-category">Category</Label>
            <Select
              id="tpl-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </div>

          {/* Subject */}
          <div className="space-y-1.5">
            <Label htmlFor="tpl-subject">Subject Line</Label>
            <Input
              id="tpl-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Welcome to {{businessName}}, {{contactName}}!"
            />
          </div>

          {/* Body */}
          <div className="space-y-1.5">
            <Label htmlFor="tpl-body">
              Body <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="tpl-body"
              ref={bodyRef}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your email template here. Use {{variables}} for dynamic content..."
              rows={10}
              className="font-mono text-sm"
            />
            {errors.body && <p className="text-xs text-destructive">{errors.body}</p>}
          </div>
        </div>

        {/* Right column: variable reference */}
        <div className="space-y-4">
          <VariableReference onInsert={handleInsertVariable} />
        </div>
      </div>

      {/* Preview */}
      <TemplatePreview subject={subject} body={body} />

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving...' : template ? 'Update Template' : 'Create Template'}
        </Button>
      </div>
    </form>
  );
}
