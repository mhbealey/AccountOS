// ============================================================================
// AccountOS v4 - TypeScript Types & Interfaces
// ============================================================================

// ── Enums (for programmatic use) ────────────────────────────────────────────

export enum ClientStatus {
  Prospect = 'Prospect',
  Onboarding = 'Onboarding',
  Active = 'Active',
  AtRisk = 'At-Risk',
  Paused = 'Paused',
  Churned = 'Churned',
}

export enum DealStage {
  Lead = 'Lead',
  Discovery = 'Discovery',
  Proposal = 'Proposal',
  Negotiation = 'Negotiation',
  ClosedWon = 'ClosedWon',
  ClosedLost = 'ClosedLost',
}

export enum TaskPriority {
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
}

export enum TaskStatus {
  Open = 'open',
  InProgress = 'in_progress',
  Done = 'done',
}

export enum InvoiceStatus {
  Draft = 'Draft',
  Sent = 'Sent',
  Viewed = 'Viewed',
  Paid = 'Paid',
  Overdue = 'Overdue',
  Void = 'Void',
}

export enum ContractStatus {
  Draft = 'Draft',
  Sent = 'Sent',
  Active = 'Active',
  Expired = 'Expired',
  Terminated = 'Terminated',
}

export enum ContractType {
  Retainer = 'Retainer',
  SOW = 'SOW',
  MSA = 'MSA',
  NDA = 'NDA',
  Amendment = 'Amendment',
  Subcontractor = 'Subcontractor',
}

export enum ProposalStatus {
  Draft = 'Draft',
  Sent = 'Sent',
  Accepted = 'Accepted',
  Declined = 'Declined',
  Expired = 'Expired',
}

export enum ActivityType {
  call = 'call',
  email_sent = 'email_sent',
  email_received = 'email_received',
  meeting = 'meeting',
  note = 'note',
  qbr = 'qbr',
  milestone = 'milestone',
  gift = 'gift',
  referral_given = 'referral_given',
  referral_received = 'referral_received',
  proposal_sent = 'proposal_sent',
  contract_signed = 'contract_signed',
  onboarding_step = 'onboarding_step',
  check_in = 'check_in',
}

export enum ContactRole {
  DecisionMaker = 'DecisionMaker',
  Champion = 'Champion',
  Influencer = 'Influencer',
  Blocker = 'Blocker',
  EndUser = 'EndUser',
  BudgetHolder = 'BudgetHolder',
}

export enum Sentiment {
  Positive = 'Positive',
  Neutral = 'Neutral',
  Negative = 'Negative',
  Unknown = 'Unknown',
}

export enum HealthThreshold {
  Critical = 30,
  AtRisk = 60,
  Healthy = 80,
}

export enum PlaybookTrigger {
  NEW_CLIENT = 'new_client',
  RENEWAL_90 = 'renewal_90',
  HEALTH_BELOW_40 = 'health_below_40',
  HEALTH_ABOVE_80 = 'health_above_80',
  QBR_14_DAYS = 'qbr_14_days',
  CONTRACT_EXPIRING = 'contract_expiring',
  DEAL_CLOSED_WON = 'deal_closed_won',
  DEAL_CLOSED_LOST = 'deal_closed_lost',
  CUSTOM = 'custom',
}

export enum TimeCategory {
  Strategy = 'Strategy',
  Delivery = 'Delivery',
  Admin = 'Admin',
  Meeting = 'Meeting',
  QBR = 'QBR',
}

export enum RecurringInterval {
  daily = 'daily',
  weekly = 'weekly',
  biweekly = 'biweekly',
  monthly = 'monthly',
  quarterly = 'quarterly',
}

// ── String literal types (for interface type safety) ────────────────────────

export type ClientStatusLiteral =
  | 'Prospect'
  | 'Onboarding'
  | 'Active'
  | 'At-Risk'
  | 'Paused'
  | 'Churned';

export type DealStageLiteral =
  | 'Lead'
  | 'Discovery'
  | 'Proposal'
  | 'Negotiation'
  | 'ClosedWon'
  | 'ClosedLost';

export type TaskPriorityLiteral = 'High' | 'Medium' | 'Low';

export type TaskStatusLiteral = 'open' | 'in_progress' | 'done';

export type InvoiceStatusLiteral =
  | 'Draft'
  | 'Sent'
  | 'Viewed'
  | 'Paid'
  | 'Overdue'
  | 'Void';

export type ContractStatusLiteral =
  | 'Draft'
  | 'Sent'
  | 'Active'
  | 'Expired'
  | 'Terminated';

export type ContractTypeLiteral =
  | 'Retainer'
  | 'SOW'
  | 'MSA'
  | 'NDA'
  | 'Amendment'
  | 'Subcontractor';

export type ProposalStatusLiteral =
  | 'Draft'
  | 'Sent'
  | 'Accepted'
  | 'Declined'
  | 'Expired';

export type ActivityTypeLiteral =
  | 'call'
  | 'email_sent'
  | 'email_received'
  | 'meeting'
  | 'note'
  | 'qbr'
  | 'milestone'
  | 'gift'
  | 'referral_given'
  | 'referral_received'
  | 'proposal_sent'
  | 'contract_signed'
  | 'onboarding_step'
  | 'check_in';

export type ContactRoleLiteral =
  | 'DecisionMaker'
  | 'Champion'
  | 'Influencer'
  | 'Blocker'
  | 'EndUser'
  | 'BudgetHolder';

export type SentimentLiteral = 'Positive' | 'Neutral' | 'Negative' | 'Unknown';

export type PlaybookTriggerLiteral =
  | 'new_client'
  | 'renewal_90'
  | 'health_below_40'
  | 'health_above_80'
  | 'qbr_14_days'
  | 'contract_expiring'
  | 'deal_closed_won'
  | 'deal_closed_lost'
  | 'custom';

export type TimeCategoryLiteral =
  | 'Strategy'
  | 'Delivery'
  | 'Admin'
  | 'Meeting'
  | 'QBR';

export type RecurringIntervalLiteral =
  | 'daily'
  | 'weekly'
  | 'biweekly'
  | 'monthly'
  | 'quarterly';

export type ClientGoalStatusLiteral =
  | 'In Progress'
  | 'Achieved'
  | 'Missed'
  | 'Cancelled';

// ── Entity Interfaces ───────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  businessName: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  logoUrl: string | null;
  defaultRate: number;
  defaultTerms: string;
  taxId: string | null;
  goalAnnualRev: number | null;
  goalMonthlyHrs: number | null;
  createdAt: Date;
}

export interface Client {
  id: string;
  name: string;
  status: ClientStatusLiteral;
  industry: string | null;
  website: string | null;
  companySize: string | null;
  source: string | null;
  referredById: string | null;
  referredBy?: Client | null;
  referrals?: Client[];
  notes: string | null;
  mrr: number;
  contractValue: number;
  healthScore: number;
  engagementScore: number;
  satisfactionScore: number | null;
  paymentScore: number;
  adoptionScore: number | null;
  csmPulse: number;
  lastHealthUpdate: Date | null;
  onboardedAt: Date | null;
  firstValueAt: Date | null;
  lastContactAt: Date | null;
  nextQbrDate: Date | null;
  churnedAt: Date | null;
  churnReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  contacts?: Contact[];
  deals?: Deal[];
  tasks?: Task[];
  timeEntries?: TimeEntry[];
  invoices?: Invoice[];
  contracts?: Contract[];
  activities?: Activity[];
  proposals?: Proposal[];
  goals?: ClientGoal[];
}

export interface Contact {
  id: string;
  clientId: string;
  client?: Client;
  name: string;
  title: string | null;
  email: string | null;
  phone: string | null;
  role: ContactRoleLiteral | null;
  sentiment: SentimentLiteral | null;
  isPrimary: boolean;
  isExecutive: boolean;
  notes: string | null;
  lastContactAt: Date | null;
  linkedinUrl: string | null;
  birthday: string | null;
  interests: string | null;
  createdAt: Date;
  activities?: Activity[];
}

export interface Deal {
  id: string;
  clientId: string;
  client?: Client;
  title: string;
  value: number;
  stage: DealStageLiteral;
  probability: number;
  closeDate: Date | null;
  actualCloseDate: Date | null;
  notes: string | null;
  lostReason: string | null;
  winFactors: string | null;
  nextStep: string | null;
  proposalId: string | null;
  proposal?: Proposal | null;
  createdAt: Date;
  updatedAt: Date;
  stageHistory?: StageChange[];
}

export interface StageChange {
  id: string;
  dealId: string;
  deal?: Deal;
  fromStage: string;
  toStage: string;
  changedAt: Date;
  notes: string | null;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  clientId: string | null;
  client?: Client | null;
  priority: TaskPriorityLiteral;
  status: TaskStatusLiteral;
  category: string | null;
  dueDate: Date | null;
  completedAt: Date | null;
  recurring: RecurringIntervalLiteral | null;
  nextRecurrence: Date | null;
  playbook: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeEntry {
  id: string;
  clientId: string | null;
  client?: Client | null;
  description: string;
  hours: number;
  rate: number;
  date: Date;
  category: TimeCategoryLiteral | null;
  invoiceId: string | null;
  invoice?: Invoice | null;
  billable: boolean;
  timerStart: Date | null;
  createdAt: Date;
}

export interface Invoice {
  id: string;
  clientId: string;
  client?: Client;
  number: string;
  amount: number;
  tax: number;
  status: InvoiceStatusLiteral;
  issuedDate: Date;
  dueDate: Date;
  paidDate: Date | null;
  paymentMethod: string | null;
  notes: string | null;
  terms: string | null;
  reminderSentAt: Date | null;
  lineItems?: InvoiceLineItem[];
  timeEntries?: TimeEntry[];
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceLineItem {
  id: string;
  invoiceId: string;
  invoice?: Invoice;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  timeEntryId: string | null;
  sortOrder: number;
}

export interface Contract {
  id: string;
  clientId: string;
  client?: Client;
  title: string;
  type: ContractTypeLiteral;
  status: ContractStatusLiteral;
  startDate: Date | null;
  endDate: Date | null;
  value: number | null;
  monthlyValue: number | null;
  renewalType: string | null;
  renewalTerms: string | null;
  reminderDays: number;
  autoRenewDate: Date | null;
  terminationClause: string | null;
  fileUrl: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Activity {
  id: string;
  clientId: string | null;
  client?: Client | null;
  contactId: string | null;
  contact?: Contact | null;
  dealId: string | null;
  type: ActivityTypeLiteral;
  title: string;
  description: string | null;
  date: Date;
  duration: number | null;
  outcome: string | null;
  sentiment: SentimentLiteral | null;
  isKeyMoment: boolean;
  createdAt: Date;
}

export interface Proposal {
  id: string;
  clientId: string;
  client?: Client;
  title: string;
  status: ProposalStatusLiteral;
  type: string;
  executiveSummary: string | null;
  problemStatement: string | null;
  scopeOfWork: string | null;
  timeline: string | null;
  investment: number | null;
  paymentTerms: string | null;
  validUntil: Date | null;
  sentAt: Date | null;
  acceptedAt: Date | null;
  declinedReason: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  deliverables?: ProposalDeliverable[];
  deals?: Deal[];
}

export interface ProposalDeliverable {
  id: string;
  proposalId: string;
  proposal?: Proposal;
  title: string;
  description: string | null;
  sortOrder: number;
}

export interface ClientGoal {
  id: string;
  clientId: string;
  client?: Client;
  title: string;
  description: string | null;
  targetMetric: string | null;
  targetValue: number | null;
  currentValue: number | null;
  status: ClientGoalStatusLiteral;
  dueDate: Date | null;
  achievedAt: Date | null;
  quarter: string | null;
  notes: string | null;
  createdAt: Date;
}

export interface Playbook {
  id: string;
  name: string;
  description: string | null;
  trigger: PlaybookTriggerLiteral;
  isActive: boolean;
  createdAt: Date;
  steps?: PlaybookStep[];
}

export interface PlaybookStep {
  id: string;
  playbookId: string;
  playbook?: Playbook;
  title: string;
  dayOffset: number;
  taskTemplate: string | null;
  sortOrder: number;
}

export interface Template {
  id: string;
  name: string;
  category: string;
  subject: string | null;
  body: string;
  variables: string | null;
  createdAt: Date;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  frequency: RecurringIntervalLiteral | 'monthly';
  category: string | null;
  startDate: Date | null;
  endDate: Date | null;
  notes: string | null;
  createdAt: Date;
}

export interface HealthScoreSnapshot {
  id: string;
  clientId: string;
  score: number;
  engagement: number;
  satisfaction: number | null;
  payment: number;
  adoption: number | null;
  csmPulse: number;
  recordedAt: Date;
}

export interface MetricSnapshot {
  id: string;
  metric: string;
  value: number;
  recordedAt: Date;
}

export interface AuditLog {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  changes: string;
  performedAt: Date;
}

// ── Utility Types ───────────────────────────────────────────────────────────

/** Input type for creating a new entity (omits auto-generated fields). */
export type CreateInput<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;

/** Input type for updating an entity (all fields from CreateInput are optional). */
export type UpdateInput<T> = Partial<CreateInput<T>>;

// ── Validation Result ───────────────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

// ── Health Score Params ─────────────────────────────────────────────────────

export interface HealthScoreParams {
  daysSinceContact: number;
  satisfactionScore: number | null;
  invoiceOnTimePercentage: number;
  adoptionScore: number | null;
  csmPulse: number;
}

export interface HealthScoreResult {
  total: number;
  engagement: number;
  satisfaction: number | null;
  payment: number;
  adoption: number | null;
  csmPulse: number;
}

// ── Revenue Forecast Types ──────────────────────────────────────────────────

export interface WeeklyForecast {
  weekStart: Date;
  weekEnd: Date;
  recurringRevenue: number;
  pipelineRevenue: number;
  invoicePayments: number;
  expenses: number;
  netCashFlow: number;
  runningBalance: number;
}

export interface CashFlowForecastParams {
  clients: Pick<Client, 'id' | 'status' | 'mrr'>[];
  invoices: Pick<Invoice, 'id' | 'status' | 'amount' | 'dueDate'>[];
  deals: Pick<Deal, 'id' | 'stage' | 'value' | 'probability' | 'closeDate'>[];
  expenses: Pick<Expense, 'id' | 'amount' | 'frequency' | 'startDate' | 'endDate'>[];
  startDate: Date;
}
