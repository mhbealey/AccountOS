import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function daysFromNow(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

async function main() {
  // Clean all tables
  await prisma.auditLog.deleteMany();
  await prisma.metricSnapshot.deleteMany();
  await prisma.healthScoreSnapshot.deleteMany();
  await prisma.playbookStep.deleteMany();
  await prisma.playbook.deleteMany();
  await prisma.template.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.clientGoal.deleteMany();
  await prisma.proposalDeliverable.deleteMany();
  await prisma.stageChange.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.invoiceLineItem.deleteMany();
  await prisma.timeEntry.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.proposal.deleteMany();
  await prisma.task.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  // 1. User
  const user = await prisma.user.create({
    data: {
      email: 'admin@accountos.app',
      passwordHash: '$2a$10$rQEY0tEMOjmn.wMYBmMXYOGNnCxwGS1nBOSQhzqAZHzjfGfLXqI2S',
      name: 'Alex Morgan',
      businessName: 'Morgan Consulting LLC',
      address: '742 Evergreen Terrace, Suite 200, Portland, OR 97201',
      phone: '(503) 555-0142',
      website: 'https://morganconsulting.io',
      defaultRate: 175,
      defaultTerms: 'Net 30',
      taxId: '47-1234567',
      goalAnnualRev: 500000,
      goalMonthlyHrs: 120,
    },
  });
  console.log('Created user:', user.email);

  // 2. Clients
  const meridian = await prisma.client.create({
    data: {
      name: 'Meridian Health Systems',
      status: 'Active',
      industry: 'Healthcare',
      website: 'https://meridianhealth.com',
      companySize: '500-1000',
      source: 'Referral',
      notes: 'Major healthcare provider in the Pacific Northwest. Key account with expansion potential.',
      mrr: 8500,
      contractValue: 102000,
      healthScore: 82,
      engagementScore: 75,
      satisfactionScore: 90,
      paymentScore: 100,
      adoptionScore: 70,
      csmPulse: 80,
      lastHealthUpdate: daysAgo(3),
      onboardedAt: daysAgo(180),
      firstValueAt: daysAgo(165),
      lastContactAt: daysAgo(2),
      nextQbrDate: daysFromNow(28),
    },
  });

  const cascade = await prisma.client.create({
    data: {
      name: 'Cascade Analytics',
      status: 'Active',
      industry: 'Technology',
      website: 'https://cascadeanalytics.io',
      companySize: '50-200',
      source: 'Inbound',
      notes: 'Data analytics startup growing rapidly. Very engaged team.',
      mrr: 5200,
      contractValue: 62400,
      healthScore: 91,
      engagementScore: 95,
      satisfactionScore: 92,
      paymentScore: 100,
      adoptionScore: 88,
      csmPulse: 90,
      lastHealthUpdate: daysAgo(1),
      onboardedAt: daysAgo(120),
      firstValueAt: daysAgo(110),
      lastContactAt: daysAgo(1),
      nextQbrDate: daysFromNow(14),
    },
  });

  const vertex = await prisma.client.create({
    data: {
      name: 'Vertex Digital',
      status: 'Prospect',
      industry: 'Marketing',
      website: 'https://vertexdigital.co',
      companySize: '10-50',
      source: 'Conference',
      notes: 'Met at SaaS Connect 2026. Interested in full-stack consulting engagement.',
      mrr: 0,
      contractValue: 0,
      healthScore: 50,
      engagementScore: 40,
      paymentScore: 100,
      csmPulse: 50,
      lastContactAt: daysAgo(5),
    },
  });

  const horizon = await prisma.client.create({
    data: {
      name: 'Horizon Logistics',
      status: 'At-Risk',
      industry: 'Logistics',
      website: 'https://horizonlogistics.com',
      companySize: '200-500',
      source: 'Outbound',
      referredById: meridian.id,
      notes: 'Referred by Meridian. Having budget concerns and leadership changes.',
      mrr: 3800,
      contractValue: 45600,
      healthScore: 32,
      engagementScore: 25,
      satisfactionScore: 40,
      paymentScore: 60,
      adoptionScore: 30,
      csmPulse: 25,
      lastHealthUpdate: daysAgo(1),
      onboardedAt: daysAgo(240),
      firstValueAt: daysAgo(220),
      lastContactAt: daysAgo(14),
      nextQbrDate: daysFromNow(7),
    },
  });

  const summit = await prisma.client.create({
    data: {
      name: 'Summit Education Group',
      status: 'Onboarding',
      industry: 'Education',
      website: 'https://summitedu.org',
      companySize: '50-200',
      source: 'Referral',
      referredById: cascade.id,
      notes: 'EdTech company building learning platform. Just signed contract.',
      mrr: 4200,
      contractValue: 50400,
      healthScore: 60,
      engagementScore: 70,
      paymentScore: 100,
      csmPulse: 65,
      onboardedAt: daysAgo(10),
      lastContactAt: daysAgo(1),
    },
  });

  const coastal = await prisma.client.create({
    data: {
      name: 'Coastal Retail Co',
      status: 'Churned',
      industry: 'Retail',
      website: 'https://coastalretail.com',
      companySize: '200-500',
      source: 'Inbound',
      notes: 'Churned due to internal restructuring. Left on good terms.',
      mrr: 0,
      contractValue: 0,
      healthScore: 10,
      engagementScore: 5,
      satisfactionScore: 65,
      paymentScore: 80,
      adoptionScore: 15,
      csmPulse: 10,
      lastHealthUpdate: daysAgo(45),
      onboardedAt: daysAgo(365),
      firstValueAt: daysAgo(350),
      lastContactAt: daysAgo(45),
      churnedAt: daysAgo(45),
      churnReason: 'Internal restructuring - eliminated consulting budget',
    },
  });

  const clients = [meridian, cascade, vertex, horizon, summit, coastal];
  console.log('Created', clients.length, 'clients');

  // 3. Contacts (3-4 per client)
  const contacts: Record<string, any[]> = {};
  
  contacts[meridian.id] = [
    await prisma.contact.create({ data: { clientId: meridian.id, name: 'Dr. Sarah Chen', title: 'Chief Medical Officer', email: 'schen@meridianhealth.com', phone: '(503) 555-1001', role: 'Decision Maker', sentiment: 'Positive', isPrimary: true, isExecutive: true, lastContactAt: daysAgo(2), linkedinUrl: 'https://linkedin.com/in/sarahchen', interests: 'Digital health, AI diagnostics' } }),
    await prisma.contact.create({ data: { clientId: meridian.id, name: 'James Whitfield', title: 'VP of Technology', email: 'jwhitfield@meridianhealth.com', phone: '(503) 555-1002', role: 'Champion', sentiment: 'Positive', isPrimary: false, isExecutive: true, lastContactAt: daysAgo(5), linkedinUrl: 'https://linkedin.com/in/jameswhitfield' } }),
    await prisma.contact.create({ data: { clientId: meridian.id, name: 'Lisa Park', title: 'Project Manager', email: 'lpark@meridianhealth.com', phone: '(503) 555-1003', role: 'End User', sentiment: 'Neutral', isPrimary: false, isExecutive: false, lastContactAt: daysAgo(3) } }),
    await prisma.contact.create({ data: { clientId: meridian.id, name: 'Robert Kim', title: 'CFO', email: 'rkim@meridianhealth.com', phone: '(503) 555-1004', role: 'Budget Holder', sentiment: 'Neutral', isPrimary: false, isExecutive: true, lastContactAt: daysAgo(30) } }),
  ];

  contacts[cascade.id] = [
    await prisma.contact.create({ data: { clientId: cascade.id, name: 'Maya Rodriguez', title: 'CEO', email: 'maya@cascadeanalytics.io', phone: '(206) 555-2001', role: 'Decision Maker', sentiment: 'Positive', isPrimary: true, isExecutive: true, lastContactAt: daysAgo(1), linkedinUrl: 'https://linkedin.com/in/mayarodriguez', interests: 'Machine learning, growth strategy' } }),
    await prisma.contact.create({ data: { clientId: cascade.id, name: 'David Okonkwo', title: 'CTO', email: 'david@cascadeanalytics.io', phone: '(206) 555-2002', role: 'Champion', sentiment: 'Positive', isPrimary: false, isExecutive: true, lastContactAt: daysAgo(3) } }),
    await prisma.contact.create({ data: { clientId: cascade.id, name: 'Emma Larsen', title: 'Head of Product', email: 'emma@cascadeanalytics.io', phone: '(206) 555-2003', role: 'Influencer', sentiment: 'Positive', isPrimary: false, isExecutive: false, lastContactAt: daysAgo(7) } }),
  ];

  contacts[vertex.id] = [
    await prisma.contact.create({ data: { clientId: vertex.id, name: 'Tyler Brooks', title: 'Founder & CEO', email: 'tyler@vertexdigital.co', phone: '(415) 555-3001', role: 'Decision Maker', sentiment: 'Neutral', isPrimary: true, isExecutive: true, lastContactAt: daysAgo(5), linkedinUrl: 'https://linkedin.com/in/tylerbrooks' } }),
    await prisma.contact.create({ data: { clientId: vertex.id, name: 'Aisha Patel', title: 'Head of Operations', email: 'aisha@vertexdigital.co', phone: '(415) 555-3002', role: 'Influencer', sentiment: 'Positive', isPrimary: false, isExecutive: false, lastContactAt: daysAgo(5) } }),
    await prisma.contact.create({ data: { clientId: vertex.id, name: 'Marcus Webb', title: 'Creative Director', email: 'marcus@vertexdigital.co', phone: '(415) 555-3003', role: 'End User', sentiment: 'Neutral', isPrimary: false, isExecutive: false, lastContactAt: daysAgo(10) } }),
  ];

  contacts[horizon.id] = [
    await prisma.contact.create({ data: { clientId: horizon.id, name: 'Karen Novak', title: 'COO', email: 'knovak@horizonlogistics.com', phone: '(312) 555-4001', role: 'Decision Maker', sentiment: 'Negative', isPrimary: true, isExecutive: true, lastContactAt: daysAgo(14), notes: 'Frustrated with recent delays' } }),
    await prisma.contact.create({ data: { clientId: horizon.id, name: 'Tom Hernandez', title: 'Director of IT', email: 'thernandez@horizonlogistics.com', phone: '(312) 555-4002', role: 'Champion', sentiment: 'Neutral', isPrimary: false, isExecutive: false, lastContactAt: daysAgo(21) } }),
    await prisma.contact.create({ data: { clientId: horizon.id, name: 'Rachel Foster', title: 'VP Finance', email: 'rfoster@horizonlogistics.com', phone: '(312) 555-4003', role: 'Budget Holder', sentiment: 'Negative', isPrimary: false, isExecutive: true, lastContactAt: daysAgo(30), notes: 'Questioning ROI' } }),
    await prisma.contact.create({ data: { clientId: horizon.id, name: 'Mike Chang', title: 'Operations Manager', email: 'mchang@horizonlogistics.com', phone: '(312) 555-4004', role: 'End User', sentiment: 'Neutral', isPrimary: false, isExecutive: false, lastContactAt: daysAgo(28) } }),
  ];

  contacts[summit.id] = [
    await prisma.contact.create({ data: { clientId: summit.id, name: 'Dr. Patricia Osei', title: 'President', email: 'posei@summitedu.org', phone: '(617) 555-5001', role: 'Decision Maker', sentiment: 'Positive', isPrimary: true, isExecutive: true, lastContactAt: daysAgo(1), linkedinUrl: 'https://linkedin.com/in/patriciaosei', interests: 'EdTech innovation, student outcomes' } }),
    await prisma.contact.create({ data: { clientId: summit.id, name: 'Nathan Reeves', title: 'VP of Technology', email: 'nreeves@summitedu.org', phone: '(617) 555-5002', role: 'Champion', sentiment: 'Positive', isPrimary: false, isExecutive: true, lastContactAt: daysAgo(2) } }),
    await prisma.contact.create({ data: { clientId: summit.id, name: 'Jennifer Liu', title: 'Curriculum Director', email: 'jliu@summitedu.org', phone: '(617) 555-5003', role: 'Influencer', sentiment: 'Positive', isPrimary: false, isExecutive: false, lastContactAt: daysAgo(3) } }),
    await prisma.contact.create({ data: { clientId: summit.id, name: 'Carlos Mendez', title: 'IT Manager', email: 'cmendez@summitedu.org', phone: '(617) 555-5004', role: 'End User', sentiment: 'Neutral', isPrimary: false, isExecutive: false, lastContactAt: daysAgo(5) } }),
  ];

  contacts[coastal.id] = [
    await prisma.contact.create({ data: { clientId: coastal.id, name: 'Diane Fletcher', title: 'CEO', email: 'dfletcher@coastalretail.com', phone: '(858) 555-6001', role: 'Decision Maker', sentiment: 'Neutral', isPrimary: true, isExecutive: true, lastContactAt: daysAgo(45) } }),
    await prisma.contact.create({ data: { clientId: coastal.id, name: 'Steve Yamamoto', title: 'CTO', email: 'syamamoto@coastalretail.com', phone: '(858) 555-6002', role: 'Champion', sentiment: 'Positive', isPrimary: false, isExecutive: true, lastContactAt: daysAgo(50), notes: 'Still friendly, may return if budget restored' } }),
    await prisma.contact.create({ data: { clientId: coastal.id, name: 'Angela Russo', title: 'Marketing Director', email: 'arusso@coastalretail.com', phone: '(858) 555-6003', role: 'End User', sentiment: 'Neutral', isPrimary: false, isExecutive: false, lastContactAt: daysAgo(60) } }),
  ];

  const allContacts = Object.values(contacts).flat();
  console.log('Created', allContacts.length, 'contacts');

  // 4. Proposals
  const proposal1 = await prisma.proposal.create({
    data: {
      clientId: meridian.id,
      title: 'Patient Portal Redesign & Integration',
      status: 'Accepted',
      type: 'Proposal',
      executiveSummary: 'Comprehensive redesign of the patient portal with EHR integration to improve patient engagement and reduce administrative overhead.',
      problemStatement: 'Current patient portal has 23% adoption rate, well below industry average of 60%. Patients report difficulty scheduling, accessing records, and communicating with providers.',
      scopeOfWork: 'Phase 1: UX Research & Design (4 weeks), Phase 2: Frontend Development (8 weeks), Phase 3: EHR Integration (4 weeks), Phase 4: Testing & Launch (2 weeks)',
      timeline: '18 weeks total',
      investment: 96000,
      paymentTerms: 'Monthly milestones',
      validUntil: daysAgo(30),
      sentAt: daysAgo(60),
      acceptedAt: daysAgo(45),
    },
  });
  await prisma.proposalDeliverable.createMany({
    data: [
      { proposalId: proposal1.id, title: 'UX Research Report', description: 'Comprehensive user research with patient interviews and journey mapping', sortOrder: 1 },
      { proposalId: proposal1.id, title: 'Design System & Prototypes', description: 'Full design system with interactive prototypes for key flows', sortOrder: 2 },
      { proposalId: proposal1.id, title: 'Frontend Application', description: 'React-based patient portal with responsive design', sortOrder: 3 },
      { proposalId: proposal1.id, title: 'EHR Integration Layer', description: 'FHIR-compliant API integration with existing EHR system', sortOrder: 4 },
    ],
  });

  const proposal2 = await prisma.proposal.create({
    data: {
      clientId: vertex.id,
      title: 'Digital Marketing Platform Development',
      status: 'Sent',
      type: 'Proposal',
      executiveSummary: 'Build a custom marketing automation platform to streamline campaign management and improve ROI tracking.',
      problemStatement: 'Vertex currently uses 6 different tools for campaign management, resulting in data silos and inefficient workflows.',
      scopeOfWork: 'Platform architecture, core development, integrations, and training.',
      timeline: '12 weeks',
      investment: 72000,
      paymentTerms: 'Net 30 on monthly invoices',
      validUntil: daysFromNow(21),
      sentAt: daysAgo(3),
    },
  });
  await prisma.proposalDeliverable.createMany({
    data: [
      { proposalId: proposal2.id, title: 'Platform Architecture Document', description: 'Technical architecture and infrastructure plan', sortOrder: 1 },
      { proposalId: proposal2.id, title: 'Campaign Management Module', description: 'Core campaign creation and management functionality', sortOrder: 2 },
      { proposalId: proposal2.id, title: 'Analytics Dashboard', description: 'Real-time campaign performance analytics', sortOrder: 3 },
    ],
  });

  const proposal3 = await prisma.proposal.create({
    data: {
      clientId: cascade.id,
      title: 'Data Pipeline Optimization',
      status: 'Draft',
      type: 'SOW',
      executiveSummary: 'Optimize existing data pipelines to reduce processing time by 60% and enable real-time analytics.',
      scopeOfWork: 'Audit existing pipelines, redesign architecture, implement streaming, migrate workloads.',
      timeline: '8 weeks',
      investment: 48000,
      paymentTerms: 'Bi-weekly milestones',
    },
  });
  await prisma.proposalDeliverable.createMany({
    data: [
      { proposalId: proposal3.id, title: 'Pipeline Audit Report', description: 'Detailed analysis of current bottlenecks', sortOrder: 1 },
      { proposalId: proposal3.id, title: 'Streaming Architecture', description: 'Apache Kafka-based real-time pipeline', sortOrder: 2 },
    ],
  });
  console.log('Created 3 proposals');

  // 5. Deals
  const deals = [
    await prisma.deal.create({ data: { clientId: meridian.id, title: 'Patient Portal Redesign', value: 96000, stage: 'Closed Won', probability: 100, closeDate: daysAgo(60), actualCloseDate: daysAgo(45), winFactors: 'Strong relationship, clear ROI case', proposalId: proposal1.id } }),
    await prisma.deal.create({ data: { clientId: meridian.id, title: 'Telemedicine Integration', value: 45000, stage: 'Proposal', probability: 60, closeDate: daysFromNow(30), nextStep: 'Send proposal by end of week' } }),
    await prisma.deal.create({ data: { clientId: cascade.id, title: 'Analytics Dashboard v2', value: 35000, stage: 'Negotiation', probability: 75, closeDate: daysFromNow(14), nextStep: 'Finalize pricing with Maya' } }),
    await prisma.deal.create({ data: { clientId: cascade.id, title: 'Data Pipeline Optimization', value: 48000, stage: 'Discovery', probability: 30, closeDate: daysFromNow(60), nextStep: 'Schedule technical deep-dive', proposalId: proposal3.id } }),
    await prisma.deal.create({ data: { clientId: vertex.id, title: 'Marketing Platform Build', value: 72000, stage: 'Proposal', probability: 40, closeDate: daysFromNow(45), nextStep: 'Follow up on proposal', proposalId: proposal2.id } }),
    await prisma.deal.create({ data: { clientId: vertex.id, title: 'Brand Strategy Consulting', value: 15000, stage: 'Lead', probability: 10, closeDate: daysFromNow(90), nextStep: 'Initial discovery call' } }),
    await prisma.deal.create({ data: { clientId: horizon.id, title: 'Route Optimization System', value: 65000, stage: 'Closed Won', probability: 100, closeDate: daysAgo(200), actualCloseDate: daysAgo(195), winFactors: 'Competitive pricing, Meridian referral' } }),
    await prisma.deal.create({ data: { clientId: horizon.id, title: 'Warehouse Management Module', value: 38000, stage: 'Stalled', probability: 20, closeDate: daysAgo(15), notes: 'On hold due to budget freeze', nextStep: 'Re-engage after Q2 budget review' } }),
    await prisma.deal.create({ data: { clientId: summit.id, title: 'Learning Platform Development', value: 50400, stage: 'Closed Won', probability: 100, closeDate: daysAgo(15), actualCloseDate: daysAgo(10), winFactors: 'EdTech expertise, Cascade referral' } }),
    await prisma.deal.create({ data: { clientId: summit.id, title: 'Assessment Engine', value: 28000, stage: 'Discovery', probability: 25, closeDate: daysFromNow(75), nextStep: 'Gather requirements from curriculum team' } }),
    await prisma.deal.create({ data: { clientId: coastal.id, title: 'E-commerce Platform Migration', value: 85000, stage: 'Closed Lost', probability: 0, closeDate: daysAgo(90), actualCloseDate: daysAgo(80), lostReason: 'Budget eliminated due to restructuring' } }),
    await prisma.deal.create({ data: { clientId: coastal.id, title: 'Inventory Management System', value: 42000, stage: 'Closed Lost', probability: 0, closeDate: daysAgo(60), actualCloseDate: daysAgo(50), lostReason: 'Client churned before deal could progress' } }),
  ];
  console.log('Created', deals.length, 'deals');

  // Stage history for some deals
  await prisma.stageChange.createMany({
    data: [
      { dealId: deals[0].id, fromStage: 'Lead', toStage: 'Discovery', changedAt: daysAgo(90) },
      { dealId: deals[0].id, fromStage: 'Discovery', toStage: 'Proposal', changedAt: daysAgo(75) },
      { dealId: deals[0].id, fromStage: 'Proposal', toStage: 'Negotiation', changedAt: daysAgo(60) },
      { dealId: deals[0].id, fromStage: 'Negotiation', toStage: 'Closed Won', changedAt: daysAgo(45) },
      { dealId: deals[2].id, fromStage: 'Lead', toStage: 'Discovery', changedAt: daysAgo(30) },
      { dealId: deals[2].id, fromStage: 'Discovery', toStage: 'Proposal', changedAt: daysAgo(20) },
      { dealId: deals[2].id, fromStage: 'Proposal', toStage: 'Negotiation', changedAt: daysAgo(7) },
      { dealId: deals[4].id, fromStage: 'Lead', toStage: 'Discovery', changedAt: daysAgo(15) },
      { dealId: deals[4].id, fromStage: 'Discovery', toStage: 'Proposal', changedAt: daysAgo(5) },
      { dealId: deals[6].id, fromStage: 'Lead', toStage: 'Discovery', changedAt: daysAgo(240) },
      { dealId: deals[6].id, fromStage: 'Discovery', toStage: 'Proposal', changedAt: daysAgo(220) },
      { dealId: deals[6].id, fromStage: 'Proposal', toStage: 'Closed Won', changedAt: daysAgo(195) },
    ],
  });
  console.log('Created stage changes');

  // 6. Tasks (25 tasks)
  const tasks = await Promise.all([
    prisma.task.create({ data: { title: 'Prepare QBR deck for Meridian', clientId: meridian.id, priority: 'High', status: 'open', category: 'QBR', dueDate: daysFromNow(5) } }),
    prisma.task.create({ data: { title: 'Review Cascade analytics dashboard wireframes', clientId: cascade.id, priority: 'High', status: 'open', category: 'Development', dueDate: daysFromNow(2) } }),
    prisma.task.create({ data: { title: 'Send Vertex proposal follow-up', clientId: vertex.id, priority: 'Medium', status: 'open', category: 'Sales', dueDate: daysFromNow(1) } }),
    prisma.task.create({ data: { title: 'Schedule at-risk intervention call with Horizon', clientId: horizon.id, priority: 'Urgent', status: 'open', category: 'Customer Success', dueDate: daysFromNow(0), playbook: 'At-Risk Intervention' } }),
    prisma.task.create({ data: { title: 'Complete Summit onboarding checklist', clientId: summit.id, priority: 'High', status: 'in-progress', category: 'Onboarding', dueDate: daysFromNow(3), playbook: 'New Client Onboarding' } }),
    prisma.task.create({ data: { title: 'Update time entries for last week', priority: 'Medium', status: 'open', category: 'Admin', dueDate: daysFromNow(1), recurring: 'weekly', nextRecurrence: daysFromNow(8) } }),
    prisma.task.create({ data: { title: 'Send monthly invoices', priority: 'High', status: 'open', category: 'Billing', dueDate: daysFromNow(3), recurring: 'monthly', nextRecurrence: daysFromNow(33) } }),
    prisma.task.create({ data: { title: 'Review Meridian patient portal test results', clientId: meridian.id, priority: 'Medium', status: 'in-progress', category: 'Development', dueDate: daysFromNow(4) } }),
    prisma.task.create({ data: { title: 'Draft telemedicine proposal for Meridian', clientId: meridian.id, priority: 'Medium', status: 'open', category: 'Sales', dueDate: daysFromNow(7) } }),
    prisma.task.create({ data: { title: 'Set up Summit development environment', clientId: summit.id, priority: 'High', status: 'completed', category: 'Onboarding', dueDate: daysAgo(2), completedAt: daysAgo(1) } }),
    prisma.task.create({ data: { title: 'Cascade data migration planning', clientId: cascade.id, priority: 'Medium', status: 'open', category: 'Development', dueDate: daysFromNow(10) } }),
    prisma.task.create({ data: { title: 'Quarterly tax preparation', priority: 'High', status: 'open', category: 'Finance', dueDate: daysFromNow(15) } }),
    prisma.task.create({ data: { title: 'Follow up with Horizon on payment', clientId: horizon.id, priority: 'Urgent', status: 'open', category: 'Billing', dueDate: daysFromNow(0) } }),
    prisma.task.create({ data: { title: 'Write case study for Meridian project', clientId: meridian.id, priority: 'Low', status: 'open', category: 'Marketing', dueDate: daysFromNow(21) } }),
    prisma.task.create({ data: { title: 'Update portfolio website', priority: 'Low', status: 'open', category: 'Marketing', dueDate: daysFromNow(30) } }),
    prisma.task.create({ data: { title: 'Renew Horizon contract discussion', clientId: horizon.id, priority: 'High', status: 'open', category: 'Customer Success', dueDate: daysFromNow(14), playbook: 'Renewal Prep' } }),
    prisma.task.create({ data: { title: 'Summit kickoff meeting prep', clientId: summit.id, priority: 'High', status: 'completed', category: 'Onboarding', dueDate: daysAgo(5), completedAt: daysAgo(5) } }),
    prisma.task.create({ data: { title: 'Review insurance renewal', priority: 'Medium', status: 'open', category: 'Admin', dueDate: daysFromNow(45) } }),
    prisma.task.create({ data: { title: 'Cascade API documentation review', clientId: cascade.id, priority: 'Low', status: 'open', category: 'Development', dueDate: daysFromNow(12) } }),
    prisma.task.create({ data: { title: 'Send satisfaction survey to Meridian', clientId: meridian.id, priority: 'Medium', status: 'open', category: 'Customer Success', dueDate: daysFromNow(7) } }),
    prisma.task.create({ data: { title: 'Plan expansion discovery for Cascade', clientId: cascade.id, priority: 'Medium', status: 'open', category: 'Sales', dueDate: daysFromNow(14), playbook: 'Expansion Discovery' } }),
    prisma.task.create({ data: { title: 'Horizon health check analysis', clientId: horizon.id, priority: 'Urgent', status: 'in-progress', category: 'Customer Success', dueDate: daysFromNow(1) } }),
    prisma.task.create({ data: { title: 'Update CRM with Vertex contact info', clientId: vertex.id, priority: 'Low', status: 'completed', category: 'Admin', dueDate: daysAgo(3), completedAt: daysAgo(3) } }),
    prisma.task.create({ data: { title: 'Prepare Cascade QBR agenda', clientId: cascade.id, priority: 'Medium', status: 'open', category: 'QBR', dueDate: daysFromNow(10), playbook: 'QBR Prep' } }),
    prisma.task.create({ data: { title: 'Review and update contract templates', priority: 'Low', status: 'open', category: 'Admin', dueDate: daysFromNow(20) } }),
  ]);
  console.log('Created', tasks.length, 'tasks');

  // 7. Invoices
  const inv1 = await prisma.invoice.create({ data: { clientId: meridian.id, number: 'INV-2026-001', amount: 8500, tax: 0, status: 'Paid', issuedDate: daysAgo(60), dueDate: daysAgo(30), paidDate: daysAgo(28), paymentMethod: 'ACH Transfer', terms: 'Net 30', notes: 'January retainer' } });
  const inv2 = await prisma.invoice.create({ data: { clientId: meridian.id, number: 'INV-2026-002', amount: 8500, tax: 0, status: 'Paid', issuedDate: daysAgo(30), dueDate: daysAgo(0), paidDate: daysAgo(2), paymentMethod: 'ACH Transfer', terms: 'Net 30', notes: 'February retainer' } });
  const inv3 = await prisma.invoice.create({ data: { clientId: meridian.id, number: 'INV-2026-003', amount: 8500, tax: 0, status: 'Sent', issuedDate: daysAgo(3), dueDate: daysFromNow(27), terms: 'Net 30', notes: 'March retainer' } });
  const inv4 = await prisma.invoice.create({ data: { clientId: cascade.id, number: 'INV-2026-004', amount: 5200, tax: 0, status: 'Paid', issuedDate: daysAgo(45), dueDate: daysAgo(15), paidDate: daysAgo(17), paymentMethod: 'Wire Transfer', terms: 'Net 30' } });
  const inv5 = await prisma.invoice.create({ data: { clientId: cascade.id, number: 'INV-2026-005', amount: 5200, tax: 0, status: 'Sent', issuedDate: daysAgo(5), dueDate: daysFromNow(25), terms: 'Net 30' } });
  const inv6 = await prisma.invoice.create({ data: { clientId: horizon.id, number: 'INV-2026-006', amount: 3800, tax: 0, status: 'Overdue', issuedDate: daysAgo(45), dueDate: daysAgo(15), terms: 'Net 30', reminderSentAt: daysAgo(7), notes: 'Payment follow-up needed' } });
  const inv7 = await prisma.invoice.create({ data: { clientId: horizon.id, number: 'INV-2026-007', amount: 3800, tax: 0, status: 'Sent', issuedDate: daysAgo(5), dueDate: daysFromNow(25), terms: 'Net 30' } });
  const inv8 = await prisma.invoice.create({ data: { clientId: summit.id, number: 'INV-2026-008', amount: 4200, tax: 0, status: 'Draft', issuedDate: daysAgo(0), dueDate: daysFromNow(30), terms: 'Net 30', notes: 'First invoice - onboarding month' } });
  const invoices = [inv1, inv2, inv3, inv4, inv5, inv6, inv7, inv8];
  console.log('Created', invoices.length, 'invoices');

  // Invoice line items
  await prisma.invoiceLineItem.createMany({
    data: [
      { invoiceId: inv1.id, description: 'Monthly retainer - consulting services', quantity: 1, unitPrice: 8500, amount: 8500, sortOrder: 1 },
      { invoiceId: inv2.id, description: 'Monthly retainer - consulting services', quantity: 1, unitPrice: 8500, amount: 8500, sortOrder: 1 },
      { invoiceId: inv3.id, description: 'Monthly retainer - consulting services', quantity: 1, unitPrice: 8500, amount: 8500, sortOrder: 1 },
      { invoiceId: inv4.id, description: 'Analytics platform development', quantity: 32, unitPrice: 162.5, amount: 5200, sortOrder: 1 },
      { invoiceId: inv5.id, description: 'Dashboard v2 design & prototyping', quantity: 20, unitPrice: 175, amount: 3500, sortOrder: 1 },
      { invoiceId: inv5.id, description: 'API integration consulting', quantity: 10, unitPrice: 170, amount: 1700, sortOrder: 2 },
      { invoiceId: inv6.id, description: 'Route optimization maintenance', quantity: 1, unitPrice: 3800, amount: 3800, sortOrder: 1 },
      { invoiceId: inv7.id, description: 'Route optimization maintenance', quantity: 1, unitPrice: 3800, amount: 3800, sortOrder: 1 },
      { invoiceId: inv8.id, description: 'Onboarding & discovery phase', quantity: 24, unitPrice: 175, amount: 4200, sortOrder: 1 },
    ],
  });

  // 8. Time Entries (50+ spanning 3 months)
  const timeEntries = await Promise.all([
    // Meridian - last 3 months
    prisma.timeEntry.create({ data: { clientId: meridian.id, description: 'Patient portal UX research sessions', hours: 6, rate: 175, date: daysAgo(85), category: 'Research', invoiceId: inv1.id, billable: true } }),
    prisma.timeEntry.create({ data: { clientId: meridian.id, description: 'Wireframe review with stakeholders', hours: 3, rate: 175, date: daysAgo(82), category: 'Design', invoiceId: inv1.id, billable: true } }),
    prisma.timeEntry.create({ data: { clientId: meridian.id, description: 'Design system component library', hours: 8, rate: 175, date: daysAgo(78), category: 'Design', invoiceId: inv1.id, billable: true } }),
    prisma.timeEntry.create({ data: { clientId: meridian.id, description: 'Sprint planning and backlog grooming', hours: 2, rate: 175, date: daysAgo(75), category: 'Project Management', invoiceId: inv1.id, billable: true } }),
    prisma.timeEntry.create({ data: { clientId: meridian.id, description: 'Frontend development - auth flows', hours: 7, rate: 175, date: daysAgo(72), category: 'Development', invoiceId: inv1.id, billable: true } }),
    prisma.timeEntry.create({ data: { clientId: meridian.id, description: 'Frontend development - dashboard', hours: 8, rate: 175, date: daysAgo(68), category: 'Development', invoiceId: inv1.id, billable: true } }),
    prisma.timeEntry.create({ data: { clientId: meridian.id, description: 'API integration planning', hours: 4, rate: 175, date: daysAgo(65), category: 'Development', invoiceId: inv1.id, billable: true } }),
    prisma.timeEntry.create({ data: { clientId: meridian.id, description: 'EHR integration development', hours: 8, rate: 175, date: daysAgo(55), category: 'Development', invoiceId: inv2.id, billable: true } }),
    prisma.timeEntry.create({ data: { clientId: meridian.id, description: 'EHR integration testing', hours: 5, rate: 175, date: daysAgo(50), category: 'Development', invoiceId: inv2.id, billable: true } }),
    prisma.timeEntry.create({ data: { clientId: meridian.id, description: 'Stakeholder demo and feedback', hours: 2, rate: 175, date: daysAgo(48), category: 'Meeting', invoiceId: inv2.id, billable: true } }),
    prisma.timeEntry.create({ data: { clientId: meridian.id, description: 'Bug fixes and polish', hours: 6, rate: 175, date: daysAgo(42), category: 'Development', invoiceId: inv2.id, billable: true } }),
    prisma.timeEntry.create({ data: { clientId: meridian.id, description: 'Performance optimization', hours: 4, rate: 175, date: daysAgo(38), category: 'Development', invoiceId: inv2.id, billable: true } }),
    prisma.timeEntry.create({ data: { clientId: meridian.id, description: 'User acceptance testing support', hours: 3, rate: 175, date: daysAgo(35), category: 'Testing', invoiceId: inv2.id, billable: true } }),
    prisma.timeEntry.create({ data: { clientId: meridian.id, description: 'Launch preparation and documentation', hours: 5, rate: 175, date: daysAgo(30), category: 'Documentation', invoiceId: inv2.id, billable: true } }),
    prisma.timeEntry.create({ data: { clientId: meridian.id, description: 'Post-launch monitoring and support', hours: 4, rate: 175, date: daysAgo(25), category: 'Support', billable: true } }),
    prisma.timeEntry.create({ data: { clientId: meridian.id, description: 'Monthly retainer - consulting', hours: 6, rate: 175, date: daysAgo(15), category: 'Consulting', billable: true } }),
    prisma.timeEntry.create({ data: { clientId: meridian.id, description: 'Telemedicine feature scoping', hours: 3, rate: 175, date: daysAgo(5), category: 'Consulting', billable: true } }),
    // Cascade - last 3 months
    prisma.timeEntry.create({ data: { clientId: cascade.id, description: 'Analytics platform architecture review', hours: 4, rate: 175, date: daysAgo(88), category: 'Consulting', invoiceId: inv4.id, billable: true } }),
    prisma.timeEntry.create({ data: { clientId: cascade.id, description: 'Data model optimization', hours: 6, rate: 175, date: daysAgo(80), category: 'Development', invoiceId: inv4.id, billable: true } }),
    prisma.timeEntry.create({ data: { clientId: cascade.id, description: 'Dashboard component development', hours: 8, rate: 175, date: daysAgo(75), category: 'Development', invoiceId: inv4.id, billable: true } }),
    prisma.timeEntry.create({ data: { clientId: cascade.id, description: 'Real-time data streaming setup', hours: 5, rate: 175, date: daysAgo(70), category: 'Development', invoiceId: inv4.id, billable: true } }),
    prisma.timeEntry.create({ data: { clientId: cascade.id, description: 'API endpoint development', hours: 7, rate: 175, date: daysAgo(65), category: 'Development', invoiceId: inv4.id, billable: true } }),
    prisma.timeEntry.create({ data: { clientId: cascade.id, description: 'Sprint review with product team', hours: 2, rate: 175, date: daysAgo(60), category: 'Meeting', billable: true } }),
    prisma.timeEntry.create({ data: { clientId: cascade.id, description: 'Dashboard v2 design exploration', hours: 6, rate: 175, date: daysAgo(40), category: 'Design', billable: true } }),
    prisma.timeEntry.create({ data: { clientId: cascade.id, description: 'Prototype testing and iteration', hours: 4, rate: 175, date: daysAgo(35), category: 'Design', billable: true } }),
    prisma.timeEntry.create({ data: { clientId: cascade.id, description: 'Technical architecture for v2', hours: 5, rate: 175, date: daysAgo(28), category: 'Development', billable: true } }),
    prisma.timeEntry.create({ data: { clientId: cascade.id, description: 'API integration consulting', hours: 3, rate: 170, date: daysAgo(20), category: 'Consulting', billable: true } }),
    prisma.timeEntry.create({ data: { clientId: cascade.id, description: 'Performance benchmarking', hours: 4, rate: 175, date: daysAgo(10), category: 'Development', billable: true } }),
    prisma.timeEntry.create({ data: { clientId: cascade.id, description: 'Weekly sync and planning', hours: 1.5, rate: 175, date: daysAgo(3), category: 'Meeting', billable: true } }),
    // Horizon
    prisma.timeEntry.create({ data: { clientId: horizon.id, description: 'Route optimization maintenance', hours: 4, rate: 150, date: daysAgo(80), category: 'Development', invoiceId: inv6.id, billable: true } }),
    prisma.timeEntry.create({ data: { clientId: horizon.id, description: 'Bug fix - routing algorithm', hours: 3, rate: 150, date: daysAgo(70), category: 'Development', invoiceId: inv6.id, billable: true } }),
    prisma.timeEntry.create({ data: { clientId: horizon.id, description: 'Monthly check-in meeting', hours: 1, rate: 150, date: daysAgo(60), category: 'Meeting', invoiceId: inv6.id, billable: true } }),
    prisma.timeEntry.create({ data: { clientId: horizon.id, description: 'Performance monitoring review', hours: 2, rate: 150, date: daysAgo(45), category: 'Support', billable: true } }),
    prisma.timeEntry.create({ data: { clientId: horizon.id, description: 'Warehouse module requirements', hours: 3, rate: 150, date: daysAgo(35), category: 'Consulting', billable: true } }),
    prisma.timeEntry.create({ data: { clientId: horizon.id, description: 'Status update call', hours: 0.5, rate: 150, date: daysAgo(20), category: 'Meeting', billable: true } }),
    // Summit (recent onboarding)
    prisma.timeEntry.create({ data: { clientId: summit.id, description: 'Kickoff meeting preparation', hours: 2, rate: 175, date: daysAgo(10), category: 'Onboarding', billable: true } }),
    prisma.timeEntry.create({ data: { clientId: summit.id, description: 'Kickoff meeting', hours: 3, rate: 175, date: daysAgo(9), category: 'Meeting', billable: true } }),
    prisma.timeEntry.create({ data: { clientId: summit.id, description: 'Requirements gathering sessions', hours: 6, rate: 175, date: daysAgo(7), category: 'Research', billable: true } }),
    prisma.timeEntry.create({ data: { clientId: summit.id, description: 'Technical environment setup', hours: 4, rate: 175, date: daysAgo(5), category: 'Development', billable: true } }),
    prisma.timeEntry.create({ data: { clientId: summit.id, description: 'Architecture design document', hours: 5, rate: 175, date: daysAgo(3), category: 'Documentation', billable: true } }),
    prisma.timeEntry.create({ data: { clientId: summit.id, description: 'Curriculum team interviews', hours: 3, rate: 175, date: daysAgo(2), category: 'Research', billable: true } }),
    prisma.timeEntry.create({ data: { clientId: summit.id, description: 'Sprint 1 planning', hours: 2, rate: 175, date: daysAgo(1), category: 'Project Management', billable: true } }),
    // Internal / non-billable
    prisma.timeEntry.create({ data: { description: 'Business development - conference prep', hours: 3, rate: 0, date: daysAgo(60), category: 'Business Development', billable: false } }),
    prisma.timeEntry.create({ data: { description: 'Professional development - Next.js course', hours: 4, rate: 0, date: daysAgo(50), category: 'Learning', billable: false } }),
    prisma.timeEntry.create({ data: { description: 'Marketing - blog post writing', hours: 2, rate: 0, date: daysAgo(40), category: 'Marketing', billable: false } }),
    prisma.timeEntry.create({ data: { description: 'Accounting and bookkeeping', hours: 3, rate: 0, date: daysAgo(30), category: 'Admin', billable: false } }),
    prisma.timeEntry.create({ data: { description: 'Proposal writing - Vertex', hours: 4, rate: 0, date: daysAgo(8), category: 'Sales', billable: false } }),
    prisma.timeEntry.create({ data: { description: 'Invoice preparation', hours: 1, rate: 0, date: daysAgo(5), category: 'Admin', billable: false } }),
    prisma.timeEntry.create({ data: { description: 'Networking event', hours: 2, rate: 0, date: daysAgo(15), category: 'Business Development', billable: false } }),
    prisma.timeEntry.create({ data: { description: 'Tool setup and automation', hours: 3, rate: 0, date: daysAgo(22), category: 'Admin', billable: false } }),
    prisma.timeEntry.create({ data: { description: 'Quarterly planning', hours: 4, rate: 0, date: daysAgo(2), category: 'Strategy', billable: false } }),
  ]);
  console.log('Created', timeEntries.length, 'time entries');

  // 9. Contracts
  const contractsList = await Promise.all([
    prisma.contract.create({ data: { clientId: meridian.id, title: 'Meridian Health - Annual Retainer Agreement', type: 'Retainer', status: 'Active', startDate: daysAgo(180), endDate: daysFromNow(185), value: 102000, monthlyValue: 8500, renewalType: 'Auto-renew', renewalTerms: '12-month auto-renewal with 60-day notice', reminderDays: 60, autoRenewDate: daysFromNow(125), terminationClause: '60 days written notice required' } }),
    prisma.contract.create({ data: { clientId: cascade.id, title: 'Cascade Analytics - Development Services', type: 'Project', status: 'Active', startDate: daysAgo(120), endDate: daysFromNow(60), value: 62400, monthlyValue: 5200, renewalType: 'Manual', reminderDays: 30 } }),
    prisma.contract.create({ data: { clientId: horizon.id, title: 'Horizon Logistics - Maintenance & Support', type: 'Retainer', status: 'Active', startDate: daysAgo(240), endDate: daysFromNow(30), value: 45600, monthlyValue: 3800, renewalType: 'Manual', reminderDays: 30, notes: 'Client may not renew - at-risk status' } }),
    prisma.contract.create({ data: { clientId: summit.id, title: 'Summit Education - Platform Development', type: 'Project', status: 'Active', startDate: daysAgo(10), endDate: daysFromNow(170), value: 50400, monthlyValue: 4200, renewalType: 'Manual', reminderDays: 30 } }),
    prisma.contract.create({ data: { clientId: coastal.id, title: 'Coastal Retail - E-commerce Consulting', type: 'Retainer', status: 'Terminated', startDate: daysAgo(365), endDate: daysAgo(45), value: 72000, monthlyValue: 6000, notes: 'Terminated early due to client restructuring' } }),
    prisma.contract.create({ data: { clientId: meridian.id, title: 'Meridian Health - NDA', type: 'NDA', status: 'Active', startDate: daysAgo(200), endDate: daysFromNow(165) } }),
  ]);
  console.log('Created', contractsList.length, 'contracts');

  // 10. Activities (40+)
  const mc = contacts[meridian.id];
  const cc = contacts[cascade.id];
  const vc = contacts[vertex.id];
  const hc = contacts[horizon.id];
  const sc = contacts[summit.id];
  const coc = contacts[coastal.id];

  await Promise.all([
    // Meridian activities
    prisma.activity.create({ data: { clientId: meridian.id, contactId: mc[0].id, type: 'Meeting', title: 'Project kickoff meeting', description: 'Kicked off patient portal redesign project. Aligned on timeline, budget, and key milestones.', date: daysAgo(85), duration: 60, outcome: 'Aligned on project scope and timeline', sentiment: 'Positive', isKeyMoment: true } }),
    prisma.activity.create({ data: { clientId: meridian.id, contactId: mc[1].id, type: 'Call', title: 'Technical requirements review', description: 'Reviewed EHR integration requirements with James. Identified FHIR API endpoints needed.', date: daysAgo(80), duration: 45, outcome: 'Requirements documented', sentiment: 'Positive' } }),
    prisma.activity.create({ data: { clientId: meridian.id, contactId: mc[2].id, type: 'Email', title: 'Design review feedback', description: 'Sent wireframes for patient portal. Lisa provided detailed feedback on navigation flow.', date: daysAgo(70), outcome: 'Feedback received, revisions planned', sentiment: 'Positive' } }),
    prisma.activity.create({ data: { clientId: meridian.id, contactId: mc[0].id, type: 'Meeting', title: 'Mid-project review', description: 'Presented progress to Dr. Chen. On track for deadline. Discussed potential telemedicine add-on.', date: daysAgo(50), duration: 45, outcome: 'Project on track, expansion opportunity identified', sentiment: 'Positive', isKeyMoment: true } }),
    prisma.activity.create({ data: { clientId: meridian.id, contactId: mc[1].id, type: 'Call', title: 'EHR integration testing sync', description: 'Troubleshooting integration issues with James. Resolved data mapping discrepancies.', date: daysAgo(40), duration: 30, outcome: 'Issues resolved', sentiment: 'Neutral' } }),
    prisma.activity.create({ data: { clientId: meridian.id, contactId: mc[0].id, type: 'Meeting', title: 'Patient portal launch review', description: 'Successful launch celebration. Portal adoption at 45% in first week, exceeding target.', date: daysAgo(25), duration: 30, outcome: 'Successful launch, exceeding targets', sentiment: 'Positive', isKeyMoment: true } }),
    prisma.activity.create({ data: { clientId: meridian.id, contactId: mc[3].id, type: 'Email', title: 'Invoice and project summary', description: 'Sent final project summary and invoice to Robert. Included ROI projections.', date: daysAgo(20), outcome: 'Invoice acknowledged', sentiment: 'Neutral' } }),
    prisma.activity.create({ data: { clientId: meridian.id, contactId: mc[0].id, type: 'Call', title: 'Telemedicine feature discussion', description: 'Discussed telemedicine integration scope with Dr. Chen. Strong interest in Q2 project.', date: daysAgo(5), duration: 30, outcome: 'Proposal requested', sentiment: 'Positive' } }),
    prisma.activity.create({ data: { clientId: meridian.id, type: 'Note', title: 'QBR preparation notes', description: 'Preparing quarterly business review deck. Key metrics: portal adoption 62%, support tickets down 34%.', date: daysAgo(2) } }),

    // Cascade activities
    prisma.activity.create({ data: { clientId: cascade.id, contactId: cc[0].id, type: 'Meeting', title: 'Weekly standup', description: 'Regular weekly sync with Maya. Reviewed sprint progress and upcoming priorities.', date: daysAgo(3), duration: 30, outcome: 'Sprint on track', sentiment: 'Positive' } }),
    prisma.activity.create({ data: { clientId: cascade.id, contactId: cc[1].id, type: 'Call', title: 'Architecture review session', description: 'Deep-dive on data pipeline architecture with David. Agreed on streaming approach.', date: daysAgo(10), duration: 60, outcome: 'Architecture decisions finalized', sentiment: 'Positive' } }),
    prisma.activity.create({ data: { clientId: cascade.id, contactId: cc[2].id, type: 'Meeting', title: 'Product roadmap alignment', description: 'Met with Emma to align our deliverables with their product roadmap for Q2.', date: daysAgo(20), duration: 45, outcome: 'Roadmap aligned', sentiment: 'Positive' } }),
    prisma.activity.create({ data: { clientId: cascade.id, contactId: cc[0].id, type: 'Email', title: 'Dashboard v2 proposal', description: 'Sent proposal for dashboard v2 with new visualization features.', date: daysAgo(15), outcome: 'Proposal well received', sentiment: 'Positive' } }),
    prisma.activity.create({ data: { clientId: cascade.id, contactId: cc[1].id, type: 'Call', title: 'API performance discussion', description: 'Discussed API latency concerns. Proposed caching strategy.', date: daysAgo(25), duration: 30, outcome: 'Caching strategy approved', sentiment: 'Neutral' } }),
    prisma.activity.create({ data: { clientId: cascade.id, contactId: cc[0].id, type: 'Meeting', title: 'Monthly business review', description: 'Monthly review with Maya. NPS score 9/10. Discussed expansion into ML features.', date: daysAgo(30), duration: 45, outcome: 'High satisfaction, expansion interest', sentiment: 'Positive', isKeyMoment: true } }),
    prisma.activity.create({ data: { clientId: cascade.id, type: 'Note', title: 'Expansion opportunity notes', description: 'Cascade showing strong interest in ML/AI features. Potential $48K data pipeline project.', date: daysAgo(1) } }),

    // Vertex activities
    prisma.activity.create({ data: { clientId: vertex.id, contactId: vc[0].id, type: 'Meeting', title: 'Initial discovery meeting', description: 'Met Tyler at SaaS Connect conference. Discussed their marketing tech challenges.', date: daysAgo(20), duration: 30, outcome: 'Interest in platform build', sentiment: 'Positive', isKeyMoment: true } }),
    prisma.activity.create({ data: { clientId: vertex.id, contactId: vc[0].id, type: 'Call', title: 'Follow-up discovery call', description: 'Deeper dive into their current tech stack and pain points. 6 tools, no integration.', date: daysAgo(12), duration: 45, outcome: 'Pain points documented', sentiment: 'Positive' } }),
    prisma.activity.create({ data: { clientId: vertex.id, contactId: vc[1].id, type: 'Call', title: 'Operations requirements', description: 'Spoke with Aisha about operational workflow requirements for the platform.', date: daysAgo(8), duration: 30, outcome: 'Requirements gathered', sentiment: 'Positive' } }),
    prisma.activity.create({ data: { clientId: vertex.id, contactId: vc[0].id, type: 'Email', title: 'Proposal sent', description: 'Sent digital marketing platform proposal to Tyler. $72K over 12 weeks.', date: daysAgo(3), outcome: 'Awaiting response', sentiment: 'Neutral' } }),

    // Horizon activities
    prisma.activity.create({ data: { clientId: horizon.id, contactId: hc[0].id, type: 'Call', title: 'Monthly check-in', description: 'Struggled to get Karen on the call. Mentioned budget pressures and new VP coming in.', date: daysAgo(30), duration: 20, outcome: 'Warning signs of churn risk', sentiment: 'Negative', isKeyMoment: true } }),
    prisma.activity.create({ data: { clientId: horizon.id, contactId: hc[1].id, type: 'Email', title: 'Feature update notification', description: 'Sent route optimization update details to Tom. No response.', date: daysAgo(25), outcome: 'No response', sentiment: 'Neutral' } }),
    prisma.activity.create({ data: { clientId: horizon.id, contactId: hc[2].id, type: 'Call', title: 'Budget discussion', description: 'Rachel raised concerns about ROI. Asked for detailed value report.', date: daysAgo(21), duration: 30, outcome: 'Value report requested', sentiment: 'Negative' } }),
    prisma.activity.create({ data: { clientId: horizon.id, contactId: hc[0].id, type: 'Email', title: 'Value report and ROI analysis', description: 'Sent comprehensive ROI analysis showing 23% efficiency improvement.', date: daysAgo(18), outcome: 'Acknowledged, under review', sentiment: 'Neutral' } }),
    prisma.activity.create({ data: { clientId: horizon.id, type: 'Note', title: 'At-risk assessment', description: 'Horizon showing multiple churn signals: payment delays, reduced engagement, leadership changes. Need intervention plan.', date: daysAgo(14), isKeyMoment: true } }),
    prisma.activity.create({ data: { clientId: horizon.id, contactId: hc[0].id, type: 'Email', title: 'Payment reminder', description: 'Sent payment reminder for overdue invoice INV-2026-006.', date: daysAgo(7), outcome: 'No response yet', sentiment: 'Negative' } }),

    // Summit activities
    prisma.activity.create({ data: { clientId: summit.id, contactId: sc[0].id, type: 'Meeting', title: 'Contract signing', description: 'Signed platform development contract with Dr. Osei. Excited about the partnership.', date: daysAgo(10), duration: 30, outcome: 'Contract signed', sentiment: 'Positive', isKeyMoment: true } }),
    prisma.activity.create({ data: { clientId: summit.id, contactId: sc[1].id, type: 'Meeting', title: 'Technical kickoff', description: 'Detailed technical kickoff with Nathan. Reviewed architecture and tech stack decisions.', date: daysAgo(9), duration: 90, outcome: 'Tech stack agreed', sentiment: 'Positive' } }),
    prisma.activity.create({ data: { clientId: summit.id, contactId: sc[2].id, type: 'Meeting', title: 'Curriculum requirements workshop', description: 'Facilitated requirements workshop with Jennifer and curriculum team.', date: daysAgo(7), duration: 120, outcome: 'Requirements documented', sentiment: 'Positive' } }),
    prisma.activity.create({ data: { clientId: summit.id, contactId: sc[3].id, type: 'Call', title: 'IT infrastructure review', description: 'Reviewed existing IT infrastructure with Carlos. Identified integration points.', date: daysAgo(5), duration: 45, outcome: 'Infrastructure documented', sentiment: 'Neutral' } }),
    prisma.activity.create({ data: { clientId: summit.id, contactId: sc[0].id, type: 'Email', title: 'Onboarding progress update', description: 'Sent week 1 progress update to Dr. Osei. All onboarding milestones on track.', date: daysAgo(3), outcome: 'Positive acknowledgment', sentiment: 'Positive' } }),
    prisma.activity.create({ data: { clientId: summit.id, contactId: sc[1].id, type: 'Meeting', title: 'Sprint 1 planning', description: 'Planned first sprint with Nathan. Focused on authentication and user management.', date: daysAgo(1), duration: 60, outcome: 'Sprint backlog created', sentiment: 'Positive' } }),

    // Coastal activities (historical)
    prisma.activity.create({ data: { clientId: coastal.id, contactId: coc[0].id, type: 'Call', title: 'Restructuring announcement', description: 'Diane informed us about major restructuring. Consulting budget being eliminated.', date: daysAgo(60), duration: 30, outcome: 'Churn likely', sentiment: 'Negative', isKeyMoment: true } }),
    prisma.activity.create({ data: { clientId: coastal.id, contactId: coc[1].id, type: 'Call', title: 'Transition planning', description: 'Worked with Steve on knowledge transfer and transition plan.', date: daysAgo(55), duration: 45, outcome: 'Transition plan created', sentiment: 'Neutral' } }),
    prisma.activity.create({ data: { clientId: coastal.id, contactId: coc[0].id, type: 'Meeting', title: 'Final review and offboarding', description: 'Final meeting with Diane. Completed knowledge transfer. Left door open for future engagement.', date: daysAgo(45), duration: 30, outcome: 'Clean offboarding', sentiment: 'Neutral', isKeyMoment: true } }),

    // Additional activities for volume
    prisma.activity.create({ data: { clientId: meridian.id, contactId: mc[1].id, type: 'Email', title: 'Sprint update email', description: 'Weekly sprint update sent to James with progress screenshots.', date: daysAgo(60), outcome: 'Acknowledged', sentiment: 'Positive' } }),
    prisma.activity.create({ data: { clientId: cascade.id, contactId: cc[0].id, type: 'Call', title: 'Quick sync on priorities', description: 'Brief call with Maya to reprioritize Q2 backlog items.', date: daysAgo(7), duration: 15, outcome: 'Priorities updated', sentiment: 'Positive' } }),
    prisma.activity.create({ data: { clientId: meridian.id, contactId: mc[0].id, type: 'Meeting', title: 'Executive lunch meeting', description: 'Lunch with Dr. Chen to discuss long-term technology roadmap.', date: daysAgo(15), duration: 60, outcome: 'Strong relationship, multiple opportunities', sentiment: 'Positive' } }),
    prisma.activity.create({ data: { clientId: horizon.id, contactId: hc[3].id, type: 'Call', title: 'User feedback session', description: 'Gathered feedback from Mike on route optimization tool usage.', date: daysAgo(35), duration: 30, outcome: 'Mixed feedback, some usability concerns', sentiment: 'Neutral' } }),
    prisma.activity.create({ data: { clientId: cascade.id, contactId: cc[2].id, type: 'Email', title: 'Feature request documentation', description: 'Emma sent detailed feature request for custom report builder.', date: daysAgo(12), outcome: 'Feature added to backlog', sentiment: 'Positive' } }),
  ]);
  console.log('Created 40+ activities');

  // 11. Client Goals
  await Promise.all([
    prisma.clientGoal.create({ data: { clientId: meridian.id, title: 'Increase patient portal adoption to 70%', description: 'Drive patient portal adoption from current 62% to 70% by end of Q2', targetMetric: 'Portal Adoption Rate', targetValue: 70, currentValue: 62, status: 'In Progress', dueDate: daysFromNow(60), quarter: 'Q2 2026' } }),
    prisma.clientGoal.create({ data: { clientId: meridian.id, title: 'Reduce support ticket volume by 40%', description: 'Leverage self-service portal features to reduce support tickets', targetMetric: 'Support Tickets', targetValue: 40, currentValue: 34, status: 'In Progress', dueDate: daysFromNow(60), quarter: 'Q2 2026' } }),
    prisma.clientGoal.create({ data: { clientId: meridian.id, title: 'Launch telemedicine integration', description: 'Integrate telemedicine capabilities into the patient portal', targetMetric: 'Feature Launch', targetValue: 1, currentValue: 0, status: 'Not Started', dueDate: daysFromNow(120), quarter: 'Q3 2026' } }),
    prisma.clientGoal.create({ data: { clientId: cascade.id, title: 'Achieve sub-200ms dashboard load time', description: 'Optimize dashboard performance for real-time analytics', targetMetric: 'Load Time (ms)', targetValue: 200, currentValue: 350, status: 'In Progress', dueDate: daysFromNow(30), quarter: 'Q2 2026' } }),
    prisma.clientGoal.create({ data: { clientId: cascade.id, title: 'Process 1M events per day', description: 'Scale data pipeline to handle 1 million events daily', targetMetric: 'Events/Day', targetValue: 1000000, currentValue: 650000, status: 'In Progress', dueDate: daysFromNow(45), quarter: 'Q2 2026' } }),
    prisma.clientGoal.create({ data: { clientId: summit.id, title: 'Complete platform MVP', description: 'Deliver minimum viable learning platform with core features', targetMetric: 'Feature Completion', targetValue: 100, currentValue: 15, status: 'In Progress', dueDate: daysFromNow(90), quarter: 'Q2 2026' } }),
    prisma.clientGoal.create({ data: { clientId: summit.id, title: 'Onboard 500 pilot students', description: 'Successfully onboard first cohort of students onto new platform', targetMetric: 'Students Onboarded', targetValue: 500, currentValue: 0, status: 'Not Started', dueDate: daysFromNow(150), quarter: 'Q3 2026' } }),
    prisma.clientGoal.create({ data: { clientId: horizon.id, title: 'Demonstrate 25% route efficiency gain', description: 'Show measurable improvement in route optimization to justify continued investment', targetMetric: 'Efficiency Improvement %', targetValue: 25, currentValue: 23, status: 'At Risk', dueDate: daysFromNow(15), quarter: 'Q1 2026', notes: 'Need to present compelling data to retain account' } }),
  ]);
  console.log('Created client goals');

  // 12. Playbooks
  const pb1 = await prisma.playbook.create({ data: { name: 'New Client Onboarding', description: 'Structured 30-day onboarding process for new clients to ensure smooth transition and early value delivery.', trigger: 'client_status_onboarding', isActive: true } });
  await prisma.playbookStep.createMany({ data: [
    { playbookId: pb1.id, title: 'Send welcome packet and contract', dayOffset: 0, taskTemplate: 'Send welcome packet to {{client_name}}', sortOrder: 1 },
    { playbookId: pb1.id, title: 'Schedule kickoff meeting', dayOffset: 1, taskTemplate: 'Schedule kickoff meeting with {{client_name}}', sortOrder: 2 },
    { playbookId: pb1.id, title: 'Conduct kickoff meeting', dayOffset: 3, taskTemplate: 'Conduct kickoff meeting with {{client_name}}', sortOrder: 3 },
    { playbookId: pb1.id, title: 'Set up project workspace and tools', dayOffset: 5, taskTemplate: 'Set up workspace for {{client_name}}', sortOrder: 4 },
    { playbookId: pb1.id, title: 'Complete requirements gathering', dayOffset: 10, taskTemplate: 'Complete requirements gathering for {{client_name}}', sortOrder: 5 },
    { playbookId: pb1.id, title: 'Deliver project plan and timeline', dayOffset: 14, taskTemplate: 'Deliver project plan to {{client_name}}', sortOrder: 6 },
    { playbookId: pb1.id, title: 'First deliverable / quick win', dayOffset: 21, taskTemplate: 'Deliver first quick win for {{client_name}}', sortOrder: 7 },
    { playbookId: pb1.id, title: '30-day check-in and feedback', dayOffset: 30, taskTemplate: '30-day onboarding check-in with {{client_name}}', sortOrder: 8 },
  ]});

  const pb2 = await prisma.playbook.create({ data: { name: 'Renewal Prep', description: 'Contract renewal preparation playbook starting 90 days before expiry.', trigger: 'contract_expiry_90_days', isActive: true } });
  await prisma.playbookStep.createMany({ data: [
    { playbookId: pb2.id, title: 'Review account health and metrics', dayOffset: 0, taskTemplate: 'Review {{client_name}} account health for renewal', sortOrder: 1 },
    { playbookId: pb2.id, title: 'Prepare value report', dayOffset: 7, taskTemplate: 'Prepare value report for {{client_name}} renewal', sortOrder: 2 },
    { playbookId: pb2.id, title: 'Internal renewal strategy meeting', dayOffset: 14, taskTemplate: 'Plan renewal strategy for {{client_name}}', sortOrder: 3 },
    { playbookId: pb2.id, title: 'Schedule renewal discussion with client', dayOffset: 21, taskTemplate: 'Schedule renewal discussion with {{client_name}}', sortOrder: 4 },
    { playbookId: pb2.id, title: 'Present renewal proposal', dayOffset: 45, taskTemplate: 'Present renewal proposal to {{client_name}}', sortOrder: 5 },
    { playbookId: pb2.id, title: 'Negotiate and finalize terms', dayOffset: 60, taskTemplate: 'Finalize renewal terms with {{client_name}}', sortOrder: 6 },
    { playbookId: pb2.id, title: 'Execute renewal contract', dayOffset: 75, taskTemplate: 'Execute renewal contract for {{client_name}}', sortOrder: 7 },
  ]});

  const pb3 = await prisma.playbook.create({ data: { name: 'At-Risk Intervention', description: 'Immediate intervention playbook when a client health score drops below 40.', trigger: 'health_score_below_40', isActive: true } });
  await prisma.playbookStep.createMany({ data: [
    { playbookId: pb3.id, title: 'Analyze risk factors and root cause', dayOffset: 0, taskTemplate: 'Analyze risk factors for {{client_name}}', sortOrder: 1 },
    { playbookId: pb3.id, title: 'Prepare intervention plan', dayOffset: 1, taskTemplate: 'Create intervention plan for {{client_name}}', sortOrder: 2 },
    { playbookId: pb3.id, title: 'Executive outreach call', dayOffset: 2, taskTemplate: 'Schedule executive outreach call with {{client_name}}', sortOrder: 3 },
    { playbookId: pb3.id, title: 'Deliver quick win or concession', dayOffset: 7, taskTemplate: 'Deliver quick win for {{client_name}}', sortOrder: 4 },
    { playbookId: pb3.id, title: 'Weekly check-in cadence', dayOffset: 14, taskTemplate: 'Weekly check-in with {{client_name}} (at-risk)', sortOrder: 5 },
    { playbookId: pb3.id, title: 'Re-assess health score', dayOffset: 30, taskTemplate: 'Re-assess {{client_name}} health score', sortOrder: 6 },
  ]});

  const pb4 = await prisma.playbook.create({ data: { name: 'QBR Prep', description: 'Quarterly business review preparation checklist.', trigger: 'qbr_date_14_days', isActive: true } });
  await prisma.playbookStep.createMany({ data: [
    { playbookId: pb4.id, title: 'Gather metrics and KPIs', dayOffset: 0, taskTemplate: 'Gather QBR metrics for {{client_name}}', sortOrder: 1 },
    { playbookId: pb4.id, title: 'Prepare QBR deck', dayOffset: 3, taskTemplate: 'Prepare QBR deck for {{client_name}}', sortOrder: 2 },
    { playbookId: pb4.id, title: 'Internal review of QBR content', dayOffset: 7, taskTemplate: 'Internal review of {{client_name}} QBR deck', sortOrder: 3 },
    { playbookId: pb4.id, title: 'Send QBR agenda to client', dayOffset: 10, taskTemplate: 'Send QBR agenda to {{client_name}}', sortOrder: 4 },
    { playbookId: pb4.id, title: 'Conduct QBR', dayOffset: 14, taskTemplate: 'Conduct QBR with {{client_name}}', sortOrder: 5 },
    { playbookId: pb4.id, title: 'Send QBR follow-up and action items', dayOffset: 16, taskTemplate: 'Send QBR follow-up to {{client_name}}', sortOrder: 6 },
  ]});

  const pb5 = await prisma.playbook.create({ data: { name: 'Expansion Discovery', description: 'Playbook for identifying and pursuing expansion opportunities with existing clients.', trigger: 'manual_trigger', isActive: true } });
  await prisma.playbookStep.createMany({ data: [
    { playbookId: pb5.id, title: 'Review current usage and satisfaction', dayOffset: 0, taskTemplate: 'Review {{client_name}} usage patterns and satisfaction', sortOrder: 1 },
    { playbookId: pb5.id, title: 'Identify expansion opportunities', dayOffset: 3, taskTemplate: 'Map expansion opportunities for {{client_name}}', sortOrder: 2 },
    { playbookId: pb5.id, title: 'Schedule discovery conversation', dayOffset: 7, taskTemplate: 'Schedule expansion discovery call with {{client_name}}', sortOrder: 3 },
    { playbookId: pb5.id, title: 'Conduct discovery and needs analysis', dayOffset: 14, taskTemplate: 'Conduct expansion needs analysis with {{client_name}}', sortOrder: 4 },
    { playbookId: pb5.id, title: 'Prepare expansion proposal', dayOffset: 21, taskTemplate: 'Prepare expansion proposal for {{client_name}}', sortOrder: 5 },
    { playbookId: pb5.id, title: 'Present and negotiate', dayOffset: 28, taskTemplate: 'Present expansion proposal to {{client_name}}', sortOrder: 6 },
  ]});
  console.log('Created 5 playbooks with steps');

  // 13. Templates (10 email templates)
  await Promise.all([
    prisma.template.create({ data: { name: 'Welcome Email', category: 'Onboarding', subject: 'Welcome to {{businessName}} - Getting Started', body: 'Hi {{contactName}},\n\nWelcome aboard! We are thrilled to begin working with {{clientName}}.\n\nHere is what you can expect over the next 30 days:\n\n1. Kickoff meeting (scheduled for {{kickoffDate}})\n2. Requirements gathering sessions\n3. Project plan delivery\n4. First deliverable\n\nPlease do not hesitate to reach out if you have any questions.\n\nBest regards,\n{{userName}}', variables: 'contactName,clientName,businessName,kickoffDate,userName' } }),
    prisma.template.create({ data: { name: 'Invoice Reminder', category: 'Billing', subject: 'Friendly Reminder: Invoice {{invoiceNumber}} Due {{dueDate}}', body: 'Hi {{contactName}},\n\nThis is a friendly reminder that invoice {{invoiceNumber}} for {{amount}} is due on {{dueDate}}.\n\nIf you have already sent payment, please disregard this message.\n\nPayment can be made via ACH transfer or wire to the account details on the invoice.\n\nThank you,\n{{userName}}', variables: 'contactName,invoiceNumber,amount,dueDate,userName' } }),
    prisma.template.create({ data: { name: 'QBR Invitation', category: 'Customer Success', subject: 'Quarterly Business Review - {{clientName}}', body: 'Hi {{contactName}},\n\nI would like to schedule our quarterly business review for {{clientName}}. In this session, we will cover:\n\n- Progress against goals\n- Key metrics and KPIs\n- Upcoming priorities\n- Strategic recommendations\n\nWould {{proposedDate}} work for your team? Please let me know your availability.\n\nBest,\n{{userName}}', variables: 'contactName,clientName,proposedDate,userName' } }),
    prisma.template.create({ data: { name: 'Proposal Follow-up', category: 'Sales', subject: 'Following Up: {{proposalTitle}}', body: 'Hi {{contactName}},\n\nI wanted to follow up on the proposal I sent for {{proposalTitle}}. I hope you have had a chance to review it.\n\nKey highlights:\n- Investment: {{investment}}\n- Timeline: {{timeline}}\n- Expected ROI: {{roi}}\n\nI would love to schedule a call to discuss any questions or adjustments. What does your schedule look like this week?\n\nBest regards,\n{{userName}}', variables: 'contactName,proposalTitle,investment,timeline,roi,userName' } }),
    prisma.template.create({ data: { name: 'Project Update', category: 'Project Management', subject: 'Weekly Update: {{projectName}}', body: 'Hi {{contactName}},\n\nHere is your weekly project update for {{projectName}}:\n\nCompleted This Week:\n{{completedItems}}\n\nIn Progress:\n{{inProgressItems}}\n\nUpcoming:\n{{upcomingItems}}\n\nBlockers:\n{{blockers}}\n\nPlease let me know if you have any questions or concerns.\n\nBest,\n{{userName}}', variables: 'contactName,projectName,completedItems,inProgressItems,upcomingItems,blockers,userName' } }),
    prisma.template.create({ data: { name: 'Contract Renewal Notice', category: 'Contracts', subject: 'Contract Renewal - {{clientName}}', body: 'Hi {{contactName}},\n\nYour contract with us is set to {{renewalAction}} on {{endDate}}. I wanted to reach out to discuss the renewal and any adjustments we should consider.\n\nCurrent contract details:\n- Type: {{contractType}}\n- Monthly value: {{monthlyValue}}\n- End date: {{endDate}}\n\nI have prepared a summary of the value we have delivered this period. Shall we schedule a call to discuss?\n\nBest regards,\n{{userName}}', variables: 'contactName,clientName,renewalAction,endDate,contractType,monthlyValue,userName' } }),
    prisma.template.create({ data: { name: 'Meeting Follow-up', category: 'General', subject: 'Follow-up: {{meetingTitle}}', body: 'Hi {{contactName}},\n\nThank you for taking the time to meet today. Here is a summary of our discussion:\n\nKey Points:\n{{keyPoints}}\n\nAction Items:\n{{actionItems}}\n\nNext Steps:\n{{nextSteps}}\n\nPlease let me know if I missed anything or if you have additional thoughts.\n\nBest,\n{{userName}}', variables: 'contactName,meetingTitle,keyPoints,actionItems,nextSteps,userName' } }),
    prisma.template.create({ data: { name: 'At-Risk Outreach', category: 'Customer Success', subject: 'Checking In - {{clientName}}', body: 'Hi {{contactName}},\n\nI wanted to personally reach out to check in on how things are going. Your satisfaction is incredibly important to us, and I want to make sure we are delivering maximum value to {{clientName}}.\n\nI would love to schedule a brief call to:\n- Hear your feedback\n- Address any concerns\n- Discuss how we can better support your goals\n\nWould you have 30 minutes this week for a quick conversation?\n\nBest regards,\n{{userName}}', variables: 'contactName,clientName,userName' } }),
    prisma.template.create({ data: { name: 'New Contact Introduction', category: 'General', subject: 'Introduction - {{userName}} from {{businessName}}', body: 'Hi {{contactName}},\n\nI am {{userName}} from {{businessName}}, and I have been working with {{clientName}} on {{projectDescription}}.\n\n{{referrerName}} suggested I reach out to introduce myself as we will be collaborating on upcoming initiatives.\n\nI would love to schedule a brief introductory call at your convenience. Please let me know what works for you.\n\nBest regards,\n{{userName}}', variables: 'contactName,userName,businessName,clientName,projectDescription,referrerName' } }),
    prisma.template.create({ data: { name: 'Thank You - Project Completion', category: 'Customer Success', subject: 'Thank You - {{projectName}} Complete!', body: 'Hi {{contactName}},\n\nI am delighted to share that we have successfully completed {{projectName}}!\n\nKey achievements:\n{{achievements}}\n\nIt has been a pleasure working with the {{clientName}} team on this project. I am confident the results will drive significant value for your organization.\n\nI would love to discuss next steps and how we can continue supporting your goals. Shall we schedule a follow-up?\n\nWith gratitude,\n{{userName}}', variables: 'contactName,projectName,achievements,clientName,userName' } }),
  ]);
  console.log('Created 10 templates');

  // 14. Expenses
  await Promise.all([
    prisma.expense.create({ data: { title: 'Software subscriptions (tools & platforms)', amount: 450, frequency: 'monthly', category: 'Software', startDate: daysAgo(365) } }),
    prisma.expense.create({ data: { title: 'Professional liability insurance', amount: 2400, frequency: 'annual', category: 'Insurance', startDate: daysAgo(180) } }),
    prisma.expense.create({ data: { title: 'Coworking space membership', amount: 350, frequency: 'monthly', category: 'Office', startDate: daysAgo(365) } }),
    prisma.expense.create({ data: { title: 'Accounting & bookkeeping service', amount: 200, frequency: 'monthly', category: 'Professional Services', startDate: daysAgo(365) } }),
    prisma.expense.create({ data: { title: 'Professional development & courses', amount: 150, frequency: 'monthly', category: 'Education', startDate: daysAgo(180) } }),
  ]);
  console.log('Created expenses');

  // 15. Health Score Snapshots
  const healthClients = [
    { id: meridian.id, scores: [
      { score: 75, engagement: 70, satisfaction: 85, payment: 100, adoption: 60, csmPulse: 75, daysAgo: 90 },
      { score: 78, engagement: 72, satisfaction: 88, payment: 100, adoption: 65, csmPulse: 78, daysAgo: 60 },
      { score: 82, engagement: 75, satisfaction: 90, payment: 100, adoption: 70, csmPulse: 80, daysAgo: 30 },
      { score: 82, engagement: 75, satisfaction: 90, payment: 100, adoption: 70, csmPulse: 80, daysAgo: 3 },
    ]},
    { id: cascade.id, scores: [
      { score: 85, engagement: 88, satisfaction: 85, payment: 100, adoption: 80, csmPulse: 85, daysAgo: 90 },
      { score: 88, engagement: 90, satisfaction: 88, payment: 100, adoption: 85, csmPulse: 88, daysAgo: 60 },
      { score: 91, engagement: 95, satisfaction: 92, payment: 100, adoption: 88, csmPulse: 90, daysAgo: 30 },
      { score: 91, engagement: 95, satisfaction: 92, payment: 100, adoption: 88, csmPulse: 90, daysAgo: 1 },
    ]},
    { id: horizon.id, scores: [
      { score: 65, engagement: 60, satisfaction: 70, payment: 90, adoption: 55, csmPulse: 60, daysAgo: 90 },
      { score: 50, engagement: 45, satisfaction: 55, payment: 75, adoption: 40, csmPulse: 45, daysAgo: 60 },
      { score: 38, engagement: 30, satisfaction: 45, payment: 65, adoption: 32, csmPulse: 30, daysAgo: 30 },
      { score: 32, engagement: 25, satisfaction: 40, payment: 60, adoption: 30, csmPulse: 25, daysAgo: 1 },
    ]},
  ];
  for (const hc of healthClients) {
    for (const s of hc.scores) {
      await prisma.healthScoreSnapshot.create({
        data: {
          clientId: hc.id,
          score: s.score,
          engagement: s.engagement,
          satisfaction: s.satisfaction,
          payment: s.payment,
          adoption: s.adoption,
          csmPulse: s.csmPulse,
          recordedAt: daysAgo(s.daysAgo),
        },
      });
    }
  }
  console.log('Created health score snapshots');

  // 16. Metric Snapshots
  await Promise.all([
    prisma.metricSnapshot.create({ data: { metric: 'monthly_revenue', value: 17500, recordedAt: daysAgo(90) } }),
    prisma.metricSnapshot.create({ data: { metric: 'monthly_revenue', value: 19800, recordedAt: daysAgo(60) } }),
    prisma.metricSnapshot.create({ data: { metric: 'monthly_revenue', value: 21700, recordedAt: daysAgo(30) } }),
    prisma.metricSnapshot.create({ data: { metric: 'active_clients', value: 4, recordedAt: daysAgo(90) } }),
    prisma.metricSnapshot.create({ data: { metric: 'active_clients', value: 4, recordedAt: daysAgo(60) } }),
    prisma.metricSnapshot.create({ data: { metric: 'active_clients', value: 3, recordedAt: daysAgo(30) } }),
    prisma.metricSnapshot.create({ data: { metric: 'pipeline_value', value: 250000, recordedAt: daysAgo(90) } }),
    prisma.metricSnapshot.create({ data: { metric: 'pipeline_value', value: 195000, recordedAt: daysAgo(60) } }),
    prisma.metricSnapshot.create({ data: { metric: 'pipeline_value', value: 170000, recordedAt: daysAgo(30) } }),
    prisma.metricSnapshot.create({ data: { metric: 'utilization_rate', value: 72, recordedAt: daysAgo(90) } }),
    prisma.metricSnapshot.create({ data: { metric: 'utilization_rate', value: 78, recordedAt: daysAgo(60) } }),
    prisma.metricSnapshot.create({ data: { metric: 'utilization_rate', value: 81, recordedAt: daysAgo(30) } }),
  ]);
  console.log('Created metric snapshots');

  console.log('\nSeed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
