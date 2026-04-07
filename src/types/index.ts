// ═══════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════

export enum ClientStatus {
  PROSPECT = 'Prospect',
  ONBOARDING = 'Onboarding',
  ACTIVE = 'Active',
  AT_RISK = 'At-Risk',
  PAUSED = 'Paused',
  CHURNED = 'Churned',
}

export enum DealStage {
  LEAD = 'Lead',
  DISCOVERY = 'Discovery',
  PROPOSAL = 'Proposal',
  NEGOTIATION = 'Negotiation',
  CLOSED_WON = 'Closed Won',
  CLOSED_LOST = 'Closed Lost',
}

export enum TaskPriority {
  URGENT = 'Urgent',
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low',
}

export enum TaskStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
}

export enum TaskCategory {
  FOLLOW_UP = 'Follow-up',
  DELIVERABLE = 'Deliverable',
  ADMIN = 'Admin',
  RENEWAL = 'Renewal',
  QBR = 'QBR',
  ONBOARDING = 'Onboarding',
}

export enum InvoiceStatus {
  DRAFT = 'Draft',
  SENT = 'Sent',
  PAID = 'Paid',
  OVERDUE = 'Overdue',
  VOID = 'Void',
}

export enum ContractType {
  RETAINER = 'Retainer',
  SOW = 'SOW',
  MSA = 'MSA',
  NDA = 'NDA',
  AMENDMENT = 'Amendment',
  SUBCONTRACTOR = 'Subcontractor',
  FIXED_PRICE = 'Fixed-Price',
}

export enum ContractStatus {
  DRAFT = 'Draft',
  SENT = 'Sent',
  ACTIVE = 'Active',
  EXPIRED = 'Expired',
  TERMINATED = 'Terminated',
}

export enum ProposalStatus {
  DRAFT = 'Draft',
  SENT = 'Sent',
  ACCEPTED = 'Accepted',
  DECLINED = 'Declined',
  EXPIRED = 'Expired',
}

export enum ActivityType {
  CALL = 'Call',
  EMAIL_SENT = 'Email Sent',
  EMAIL_RECEIVED = 'Email Received',
  MEETING = 'Meeting',
  NOTE = 'Note',
  QBR = 'QBR',
  MILESTONE = 'Milestone',
  GIFT_SENT = 'Gift Sent',
  REFERRAL_GIVEN = 'Referral Given',
  REFERRAL_RECEIVED = 'Referral Received',
  PROPOSAL_SENT = 'Proposal Sent',
  CONTRACT_SIGNED = 'Contract Signed',
  ONBOARDING_STEP = 'Onboarding Step',
  CHECK_IN = 'Check-in',
  INCIDENT = 'Incident',
  SUCCESS_STORY = 'Success Story',
}

export enum Sentiment {
  POSITIVE = 'Positive',
  NEUTRAL = 'Neutral',
  NEGATIVE = 'Negative',
}

export enum ContactRole {
  DECISION_MAKER = 'Decision Maker',
  CHAMPION = 'Champion',
  INFLUENCER = 'Influencer',
  BLOCKER = 'Blocker',
  BUDGET_HOLDER = 'Budget Holder',
  END_USER = 'End User',
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
  CHAMPION_SILENT = 'champion_silent',
  CUSTOM = 'custom',
}

export enum ChurnReason {
  EXECUTIVE_TURNOVER = 'Executive Turnover',
  BUDGET_CUTS = 'Budget Cuts',
  COMPETITIVE_DISPLACEMENT = 'Competitive Displacement',
  PRODUCT_FIT = 'Product Fit',
  RELATIONSHIP = 'Relationship',
  ACQUISITION = 'Acquisition',
  OTHER = 'Other',
}

export enum LossReason {
  BUDGET = 'Budget',
  COMPETITIVE = 'Competitive',
  TIMING = 'Timing',
  PRODUCT_FIT = 'Product Fit',
  CHAMPION_LEFT = 'Champion Left',
  NO_DECISION = 'No Decision',
  OTHER = 'Other',
}

export enum HealthThreshold {
  CRITICAL = 30,
  AT_RISK = 60,
  HEALTHY = 80,
  THRIVING = 100,
}

export enum MaturityStage {
  EVALUATING = 'Evaluating',
  IMPLEMENTING = 'Implementing',
  OPTIMIZING = 'Optimizing',
  TRANSFORMING = 'Transforming',
}

export enum ClientTier {
  BRONZE = 'Bronze',
  SILVER = 'Silver',
  GOLD = 'Gold',
  PLATINUM = 'Platinum',
}

export enum ExpenseFrequency {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ANNUAL = 'annual',
  ONE_TIME = 'one-time',
}

// ═══════════════════════════════════════════
// INTERFACES
// ═══════════════════════════════════════════

export interface User {
  id: string;
  email: string;
  name: string;
  businessName: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  logoBase64: string | null;
  defaultRate: number;
  defaultTerms: string;
  taxId: string | null;
  goalAnnualRev: number | null;
  goalMonthlyHrs: number;
  invoiceCounter: number;
  concentrationThreshold: number;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  status: ClientStatus;
  industry: string | null;
  website: string | null;
  companySize: string | null;
  tier: ClientTier | null;
  source: string | null;
  maturityStage: MaturityStage | null;
  referredById: string | null;
  mrr: number;
  contractValue: number;
  healthScore: number;
  engagementScore: number;
  satisfactionScore: number | null;
  paymentScore: number;
  adoptionScore: number | null;
  csmPulse: number;
  lastHealthUpdate: string | null;
  preferredChannel: string | null;
  preferredFrequency: string | null;
  communicationNotes: string | null;
  onboardedAt: string | null;
  firstValueAt: string | null;
  lastContactAt: string | null;
  nextQbrDate: string | null;
  lastQbrDate: string | null;
  churnedAt: string | null;
  churnReason: ChurnReason | null;
  pauseReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  clientId: string;
  name: string;
  title: string | null;
  email: string | null;
  phone: string | null;
  role: ContactRole | null;
  sentiment: Sentiment | null;
  isPrimary: boolean;
  isExecutive: boolean;
  notes: string | null;
  lastContactAt: string | null;
  linkedinUrl: string | null;
  birthday: string | null;
  interests: string | null;
  reportsToId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Deal {
  id: string;
  clientId: string;
  title: string;
  value: number;
  stage: DealStage;
  probability: number;
  closeDate: string | null;
  actualCloseDate: string | null;
  notes: string | null;
  lostReason: LossReason | null;
  winFactors: string | null;
  nextStep: string | null;
  proposalId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StageChange {
  id: string;
  dealId: string;
  fromStage: DealStage;
  toStage: DealStage;
  changedAt: string;
  notes: string | null;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  clientId: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  category: TaskCategory | null;
  dueDate: string | null;
  completedAt: string | null;
  recurring: string | null;
  recurringAnchor: string | null;
  playbook: string | null;
  playbookStep: number | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface TimeEntry {
  id: string;
  clientId: string | null;
  description: string;
  hours: number;
  rate: number;
  date: string;
  category: string | null;
  invoiceId: string | null;
  billable: boolean;
  timerStart: string | null;
  createdAt: string;
}

export interface Invoice {
  id: string;
  clientId: string;
  number: string;
  amount: number;
  tax: number;
  status: InvoiceStatus;
  issuedDate: string;
  dueDate: string;
  paidDate: string | null;
  paymentMethod: string | null;
  lineItems: InvoiceLineItem[];
  notes: string | null;
  terms: string | null;
  voidReason: string | null;
  reminderSentAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceLineItem {
  id: string;
  invoiceId: string;
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
  title: string;
  type: ContractType;
  status: ContractStatus;
  startDate: string | null;
  endDate: string | null;
  value: number | null;
  monthlyValue: number | null;
  renewalType: string | null;
  renewalTerms: string | null;
  reminderDays: number;
  autoRenewDate: string | null;
  terminationClause: string | null;
  optOutDays: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  clientId: string | null;
  contactId: string | null;
  dealId: string | null;
  type: ActivityType;
  title: string;
  description: string | null;
  date: string;
  duration: number | null;
  outcome: string | null;
  sentiment: Sentiment | null;
  isKeyMoment: boolean;
  isSuccessStory: boolean;
  isProactive: boolean;
  competitorMentioned: string | null;
  createdAt: string;
}

export interface Proposal {
  id: string;
  clientId: string;
  title: string;
  status: ProposalStatus;
  type: string;
  executiveSummary: string | null;
  problemStatement: string | null;
  scopeOfWork: string | null;
  deliverables: ProposalDeliverable[];
  timeline: string | null;
  investment: number | null;
  paymentTerms: string | null;
  validUntil: string | null;
  sentAt: string | null;
  acceptedAt: string | null;
  declinedReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProposalDeliverable {
  id: string;
  proposalId: string;
  title: string;
  description: string | null;
  sortOrder: number;
}

export interface ClientGoal {
  id: string;
  clientId: string;
  title: string;
  description: string | null;
  targetMetric: string | null;
  targetValue: number | null;
  currentValue: number | null;
  baselineValue: number | null;
  unit: string | null;
  status: string;
  dueDate: string | null;
  achievedAt: string | null;
  quarter: string | null;
  createdAt: string;
}

export interface ClientService {
  id: string;
  clientId: string;
  serviceName: string;
  category: string;
  status: string;
  revenue: number | null;
  startDate: string | null;
  dependsOn: string | null;
  notes: string | null;
  createdAt: string;
}

export interface ClientCompetitor {
  id: string;
  clientId: string;
  name: string;
  services: string | null;
  threatLevel: string;
  notes: string | null;
  detectedAt: string;
}

export interface Playbook {
  id: string;
  name: string;
  description: string | null;
  trigger: PlaybookTrigger;
  steps: PlaybookStep[];
  isActive: boolean;
  createdAt: string;
}

export interface PlaybookStep {
  id: string;
  playbookId: string;
  title: string;
  description: string | null;
  dayOffset: number;
  taskPriority: TaskPriority;
  taskCategory: TaskCategory | null;
  sortOrder: number;
}

export interface PlaybookExecution {
  id: string;
  playbookId: string;
  clientId: string;
  status: string;
  currentStep: number;
  startedAt: string;
  completedAt: string | null;
}

export interface Template {
  id: string;
  name: string;
  category: string;
  subject: string | null;
  body: string;
  createdAt: string;
}

export interface Snippet {
  id: string;
  title: string;
  category: string;
  content: string;
  tags: string | null;
  createdAt: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  frequency: ExpenseFrequency;
  category: string | null;
  startDate: string | null;
  endDate: string | null;
  notes: string | null;
  createdAt: string;
}

export interface NetworkContact {
  id: string;
  name: string;
  company: string | null;
  title: string | null;
  email: string | null;
  phone: string | null;
  relationship: string | null;
  source: string | null;
  notes: string | null;
  lastContactAt: string | null;
  nextFollowUp: string | null;
  tags: string | null;
  createdAt: string;
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
  recordedAt: string;
}

export interface MetricSnapshot {
  id: string;
  metric: string;
  value: number;
  recordedAt: string;
}

export interface AuditLog {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  changes: string;
  performedAt: string;
}

export interface Note {
  id: string;
  clientId: string | null;
  dealId: string | null;
  contractId: string | null;
  content: string;
  createdAt: string;
}

export interface HealthScoreConfig {
  id: string;
  engagementWeight: number;
  satisfactionWeight: number;
  paymentWeight: number;
  adoptionWeight: number;
  csmPulseWeight: number;
}

// ═══════════════════════════════════════════
// UI TYPES
// ═══════════════════════════════════════════

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
}

export interface UndoAction {
  id: string;
  description: string;
  undo: () => void;
  timestamp: number;
}

export type NavigationItem = {
  name: string;
  href: string;
  icon: string;
  badge?: number;
  isPrimary: boolean;
};

export interface SaveState {
  status: 'idle' | 'saving' | 'saved' | 'error';
  lastSavedAt: string | null;
}
