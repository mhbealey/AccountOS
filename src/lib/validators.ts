import type { ValidationResult } from '@/types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CLIENT_STATUSES = ['Prospect', 'Onboarding', 'Active', 'At-Risk', 'Paused', 'Churned'];
const DEAL_STAGES = ['Lead', 'Discovery', 'Proposal', 'Negotiation', 'ClosedWon', 'ClosedLost'];
const TASK_PRIORITIES = ['High', 'Medium', 'Low'];
const TASK_STATUSES = ['open', 'in_progress', 'done'];
const INVOICE_STATUSES = ['Draft', 'Sent', 'Viewed', 'Paid', 'Overdue', 'Void'];
const CONTRACT_STATUSES = ['Draft', 'Sent', 'Active', 'Expired', 'Terminated'];
const CONTRACT_TYPES = ['Retainer', 'SOW', 'MSA', 'NDA', 'Amendment', 'Subcontractor'];
const ACTIVITY_TYPES = [
  'call', 'email_sent', 'email_received', 'meeting', 'note', 'qbr',
  'milestone', 'gift', 'referral_given', 'referral_received',
  'proposal_sent', 'contract_signed', 'onboarding_step', 'check_in',
];
const PROPOSAL_STATUSES = ['Draft', 'Sent', 'Accepted', 'Declined', 'Expired'];

// ── Helpers ─────────────────────────────────────────────────────────────────

function required(errors: Record<string, string>, field: string, value: unknown): boolean {
  if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
    errors[field] = `${field} is required`;
    return false;
  }
  return true;
}

function validEmail(errors: Record<string, string>, field: string, value: unknown): void {
  if (typeof value === 'string' && value.trim() !== '' && !EMAIL_REGEX.test(value)) {
    errors[field] = `${field} must be a valid email address`;
  }
}

function positiveNumber(errors: Record<string, string>, field: string, value: unknown): void {
  if (value !== undefined && value !== null) {
    const n = typeof value === 'string' ? parseFloat(value) : value;
    if (typeof n !== 'number' || isNaN(n) || n < 0) {
      errors[field] = `${field} must be a positive number`;
    }
  }
}

function inSet(
  errors: Record<string, string>,
  field: string,
  value: unknown,
  allowed: string[]
): void {
  if (value !== undefined && value !== null && !allowed.includes(value as string)) {
    errors[field] = `${field} must be one of: ${allowed.join(', ')}`;
  }
}

function validDateRange(
  errors: Record<string, string>,
  startField: string,
  endField: string,
  startValue: unknown,
  endValue: unknown
): void {
  if (startValue && endValue) {
    const start = new Date(startValue as string | number | Date);
    const end = new Date(endValue as string | number | Date);
    if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && start > end) {
      errors[endField] = `${endField} must be after ${startField}`;
    }
  }
}

function result(errors: Record<string, string>): ValidationResult {
  return { valid: Object.keys(errors).length === 0, errors };
}

// ── Validators ──────────────────────────────────────────────────────────────

/**
 * Validate client form data.
 */
export function validateClient(data: Record<string, unknown>): ValidationResult {
  const errors: Record<string, string> = {};

  required(errors, 'name', data.name);
  if (data.status !== undefined) {
    inSet(errors, 'status', data.status, CLIENT_STATUSES);
  }
  if (data.mrr !== undefined) positiveNumber(errors, 'mrr', data.mrr);
  if (data.contractValue !== undefined) positiveNumber(errors, 'contractValue', data.contractValue);
  if (data.website && typeof data.website === 'string' && data.website.trim() !== '') {
    try {
      new URL(data.website as string);
    } catch {
      errors.website = 'website must be a valid URL';
    }
  }

  return result(errors);
}

/**
 * Validate contact form data.
 */
export function validateContact(data: Record<string, unknown>): ValidationResult {
  const errors: Record<string, string> = {};

  required(errors, 'name', data.name);
  required(errors, 'clientId', data.clientId);
  if (data.email !== undefined) validEmail(errors, 'email', data.email);

  return result(errors);
}

/**
 * Validate deal form data.
 */
export function validateDeal(data: Record<string, unknown>): ValidationResult {
  const errors: Record<string, string> = {};

  required(errors, 'title', data.title);
  required(errors, 'clientId', data.clientId);
  if (required(errors, 'value', data.value)) {
    positiveNumber(errors, 'value', data.value);
  }
  if (data.stage !== undefined) inSet(errors, 'stage', data.stage, DEAL_STAGES);
  if (data.probability !== undefined) {
    const p = data.probability as number;
    if (typeof p !== 'number' || p < 0 || p > 100) {
      errors.probability = 'probability must be between 0 and 100';
    }
  }

  return result(errors);
}

/**
 * Validate task form data.
 */
export function validateTask(data: Record<string, unknown>): ValidationResult {
  const errors: Record<string, string> = {};

  required(errors, 'title', data.title);
  if (data.priority !== undefined) inSet(errors, 'priority', data.priority, TASK_PRIORITIES);
  if (data.status !== undefined) inSet(errors, 'status', data.status, TASK_STATUSES);

  return result(errors);
}

/**
 * Validate time entry form data.
 */
export function validateTimeEntry(data: Record<string, unknown>): ValidationResult {
  const errors: Record<string, string> = {};

  required(errors, 'description', data.description);
  if (required(errors, 'hours', data.hours)) {
    const h = data.hours as number;
    if (typeof h !== 'number' || h <= 0) {
      errors.hours = 'hours must be a positive number';
    }
  }
  if (required(errors, 'rate', data.rate)) {
    positiveNumber(errors, 'rate', data.rate);
  }
  required(errors, 'date', data.date);

  return result(errors);
}

/**
 * Validate invoice form data.
 */
export function validateInvoice(data: Record<string, unknown>): ValidationResult {
  const errors: Record<string, string> = {};

  required(errors, 'clientId', data.clientId);
  required(errors, 'number', data.number);
  if (required(errors, 'amount', data.amount)) {
    positiveNumber(errors, 'amount', data.amount);
  }
  if (data.tax !== undefined) positiveNumber(errors, 'tax', data.tax);
  if (data.status !== undefined) inSet(errors, 'status', data.status, INVOICE_STATUSES);
  required(errors, 'issuedDate', data.issuedDate);
  required(errors, 'dueDate', data.dueDate);
  validDateRange(errors, 'issuedDate', 'dueDate', data.issuedDate, data.dueDate);

  return result(errors);
}

/**
 * Validate contract form data.
 */
export function validateContract(data: Record<string, unknown>): ValidationResult {
  const errors: Record<string, string> = {};

  required(errors, 'clientId', data.clientId);
  required(errors, 'title', data.title);
  required(errors, 'type', data.type);
  inSet(errors, 'type', data.type, CONTRACT_TYPES);
  if (data.status !== undefined) inSet(errors, 'status', data.status, CONTRACT_STATUSES);
  if (data.value !== undefined) positiveNumber(errors, 'value', data.value);
  if (data.monthlyValue !== undefined) positiveNumber(errors, 'monthlyValue', data.monthlyValue);
  validDateRange(errors, 'startDate', 'endDate', data.startDate, data.endDate);

  return result(errors);
}

/**
 * Validate activity form data.
 */
export function validateActivity(data: Record<string, unknown>): ValidationResult {
  const errors: Record<string, string> = {};

  required(errors, 'type', data.type);
  inSet(errors, 'type', data.type, ACTIVITY_TYPES);
  required(errors, 'title', data.title);
  if (data.duration !== undefined) {
    const d = data.duration as number;
    if (typeof d !== 'number' || d < 0) {
      errors.duration = 'duration must be a non-negative number';
    }
  }

  return result(errors);
}

/**
 * Validate proposal form data.
 */
export function validateProposal(data: Record<string, unknown>): ValidationResult {
  const errors: Record<string, string> = {};

  required(errors, 'clientId', data.clientId);
  required(errors, 'title', data.title);
  if (data.status !== undefined) inSet(errors, 'status', data.status, PROPOSAL_STATUSES);
  if (data.investment !== undefined) positiveNumber(errors, 'investment', data.investment);

  return result(errors);
}

/**
 * Validate template form data.
 */
export function validateTemplate(data: Record<string, unknown>): ValidationResult {
  const errors: Record<string, string> = {};

  required(errors, 'name', data.name);
  required(errors, 'category', data.category);
  required(errors, 'body', data.body);

  return result(errors);
}
