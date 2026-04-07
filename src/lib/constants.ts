import {
  ClientStatus,
  DealStage,
  TaskPriority,
  InvoiceStatus,
  Sentiment,
  ContactRole,
  HealthThreshold,
  type NavigationItem,
} from '@/types';

// ═══════════════════════════════════════════
// APP CONSTANTS
// ═══════════════════════════════════════════

export const APP_NAME = 'AccountOS';
export const APP_VERSION = '1.0.0';
export const SCHEMA_VERSION = 1;
export const STORAGE_PREFIX = 'accountos_';
export const DEFAULT_MONTHLY_HOURS = 160;
export const DEFAULT_RATE = 150;
export const DEFAULT_PAYMENT_TERMS = 'Net 30';
export const DEFAULT_CONCENTRATION_THRESHOLD = 40;
export const DEFAULT_REMINDER_DAYS = 30;
export const HEALTH_SCORE_MAX = 100;
export const UNDO_TIMEOUT_MS = 5000;
export const TOAST_DURATION_MS = 4000;
export const AUTOSAVE_DELAY_MS = 1000;
export const MAX_RECENT_ITEMS = 10;

// ═══════════════════════════════════════════
// STAGE PROBABILITY MAP
// ═══════════════════════════════════════════

export const STAGE_PROBABILITY: Record<DealStage, number> = {
  [DealStage.LEAD]: 10,
  [DealStage.DISCOVERY]: 25,
  [DealStage.PROPOSAL]: 50,
  [DealStage.NEGOTIATION]: 75,
  [DealStage.CLOSED_WON]: 100,
  [DealStage.CLOSED_LOST]: 0,
};

// ═══════════════════════════════════════════
// COLOR MAPS (Tailwind classes)
// ═══════════════════════════════════════════

export const CLIENT_STATUS_COLOR: Record<ClientStatus, string> = {
  [ClientStatus.PROSPECT]: 'bg-blue-100 text-blue-800',
  [ClientStatus.ONBOARDING]: 'bg-purple-100 text-purple-800',
  [ClientStatus.ACTIVE]: 'bg-green-100 text-green-800',
  [ClientStatus.AT_RISK]: 'bg-orange-100 text-orange-800',
  [ClientStatus.PAUSED]: 'bg-gray-100 text-gray-800',
  [ClientStatus.CHURNED]: 'bg-red-100 text-red-800',
};

export const DEAL_STAGE_COLOR: Record<DealStage, string> = {
  [DealStage.LEAD]: 'bg-slate-100 text-slate-800',
  [DealStage.DISCOVERY]: 'bg-blue-100 text-blue-800',
  [DealStage.PROPOSAL]: 'bg-indigo-100 text-indigo-800',
  [DealStage.NEGOTIATION]: 'bg-purple-100 text-purple-800',
  [DealStage.CLOSED_WON]: 'bg-green-100 text-green-800',
  [DealStage.CLOSED_LOST]: 'bg-red-100 text-red-800',
};

export const PRIORITY_COLOR: Record<TaskPriority, string> = {
  [TaskPriority.URGENT]: 'bg-red-100 text-red-800',
  [TaskPriority.HIGH]: 'bg-orange-100 text-orange-800',
  [TaskPriority.MEDIUM]: 'bg-yellow-100 text-yellow-800',
  [TaskPriority.LOW]: 'bg-gray-100 text-gray-800',
};

export const INVOICE_STATUS_COLOR: Record<InvoiceStatus, string> = {
  [InvoiceStatus.DRAFT]: 'bg-gray-100 text-gray-800',
  [InvoiceStatus.SENT]: 'bg-blue-100 text-blue-800',
  [InvoiceStatus.PAID]: 'bg-green-100 text-green-800',
  [InvoiceStatus.OVERDUE]: 'bg-red-100 text-red-800',
  [InvoiceStatus.VOID]: 'bg-slate-100 text-slate-800',
};

export const SENTIMENT_COLOR: Record<Sentiment, string> = {
  [Sentiment.POSITIVE]: 'bg-green-100 text-green-800',
  [Sentiment.NEUTRAL]: 'bg-gray-100 text-gray-800',
  [Sentiment.NEGATIVE]: 'bg-red-100 text-red-800',
};

export const CONTACT_ROLE_COLOR: Record<ContactRole, string> = {
  [ContactRole.DECISION_MAKER]: 'bg-purple-100 text-purple-800',
  [ContactRole.CHAMPION]: 'bg-green-100 text-green-800',
  [ContactRole.INFLUENCER]: 'bg-blue-100 text-blue-800',
  [ContactRole.BLOCKER]: 'bg-red-100 text-red-800',
  [ContactRole.BUDGET_HOLDER]: 'bg-amber-100 text-amber-800',
  [ContactRole.END_USER]: 'bg-gray-100 text-gray-800',
};

// ═══════════════════════════════════════════
// HEALTH SCORE HELPERS
// ═══════════════════════════════════════════

export function healthScoreColor(score: number): string {
  if (score <= HealthThreshold.CRITICAL) return 'text-red-600';
  if (score <= HealthThreshold.AT_RISK) return 'text-orange-500';
  if (score <= HealthThreshold.HEALTHY) return 'text-yellow-500';
  return 'text-green-600';
}

export function healthScoreBorderColor(score: number): string {
  if (score <= HealthThreshold.CRITICAL) return 'border-red-500';
  if (score <= HealthThreshold.AT_RISK) return 'border-orange-400';
  if (score <= HealthThreshold.HEALTHY) return 'border-yellow-400';
  return 'border-green-500';
}

export function healthScoreLabel(score: number): string {
  if (score <= HealthThreshold.CRITICAL) return 'Critical';
  if (score <= HealthThreshold.AT_RISK) return 'At Risk';
  if (score <= HealthThreshold.HEALTHY) return 'Healthy';
  return 'Thriving';
}

// ═══════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════

export const NAVIGATION: NavigationItem[] = [
  { name: 'Dashboard', href: '/', icon: 'LayoutDashboard', isPrimary: true },
  { name: 'Clients', href: '/clients', icon: 'Building2', isPrimary: true },
  { name: 'Pipeline', href: '/pipeline', icon: 'GitBranch', isPrimary: true },
  { name: 'Tasks', href: '/tasks', icon: 'CheckSquare', isPrimary: true },
  { name: 'Activity', href: '/activity', icon: 'Activity', isPrimary: true },
  { name: 'Time', href: '/time', icon: 'Clock', isPrimary: true },
  { name: 'Invoices', href: '/invoices', icon: 'Receipt', isPrimary: true },
  { name: 'Contracts', href: '/contracts', icon: 'FileText', isPrimary: true },
  { name: 'Proposals', href: '/proposals', icon: 'FileSignature', isPrimary: false },
  { name: 'Expenses', href: '/expenses', icon: 'Wallet', isPrimary: false },
  { name: 'Playbooks', href: '/playbooks', icon: 'BookOpen', isPrimary: false },
  { name: 'Reports', href: '/reports', icon: 'BarChart3', isPrimary: false },
  { name: 'Templates', href: '/templates', icon: 'LayoutTemplate', isPrimary: false },
  { name: 'Knowledge Base', href: '/knowledge', icon: 'Library', isPrimary: false },
  { name: 'Network', href: '/network', icon: 'Users', isPrimary: false },
  { name: 'Settings', href: '/settings', icon: 'Settings', isPrimary: false },
];

export const PRIMARY_NAV = NAVIGATION.filter((item) => item.isPrimary);
export const SECONDARY_NAV = NAVIGATION.filter((item) => !item.isPrimary);
