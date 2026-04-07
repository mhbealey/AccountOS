import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function daysFromNow(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

async function main() {
  // Clear existing data
  await prisma.auditLog.deleteMany();
  await prisma.invoiceLineItem.deleteMany();
  await prisma.timeEntry.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.stageChange.deleteMany();
  await prisma.proposalDeliverable.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.proposal.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.task.deleteMany();
  await prisma.clientGoal.deleteMany();
  await prisma.clientService.deleteMany();
  await prisma.clientCompetitor.deleteMany();
  await prisma.healthScoreSnapshot.deleteMany();
  await prisma.note.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.playbookStep.deleteMany();
  await prisma.playbookExecution.deleteMany();
  await prisma.playbook.deleteMany();
  await prisma.template.deleteMany();
  await prisma.snippet.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.networkContact.deleteMany();
  await prisma.metricSnapshot.deleteMany();
  await prisma.healthScoreConfig.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  // User
  const passwordHash = await hash('password123', 12);
  const user = await prisma.user.create({
    data: {
      email: 'admin@accountos.com',
      passwordHash,
      name: 'Admin User',
      businessName: 'AccountOS Consulting',
      defaultRate: 175,
      goalAnnualRev: 1200000,
      goalMonthlyHrs: 160,
    },
  });

  // Clients
  const clientsData = [
    { name: 'TechCorp Industries', status: 'Active', industry: 'Technology', tier: 'Enterprise', companySize: '1000-5000', mrr: 22000, contractValue: 264000, healthScore: 88, engagementScore: 85, paymentScore: 95, csmPulse: 90, source: 'Referral', onboardedAt: daysAgo(365), lastContactAt: daysAgo(2), nextQbrDate: daysFromNow(15) },
    { name: 'Meridian Financial', status: 'Active', industry: 'Financial Services', tier: 'Enterprise', companySize: '5000+', mrr: 25000, contractValue: 300000, healthScore: 72, engagementScore: 65, paymentScore: 100, csmPulse: 70, source: 'Conference', onboardedAt: daysAgo(540), lastContactAt: daysAgo(8), nextQbrDate: daysFromNow(30) },
    { name: 'Apex Healthcare', status: 'At-Risk', industry: 'Healthcare', tier: 'Mid-Market', companySize: '500-1000', mrr: 12000, contractValue: 144000, healthScore: 35, engagementScore: 30, paymentScore: 60, csmPulse: 25, source: 'Website', onboardedAt: daysAgo(200), lastContactAt: daysAgo(25), nextQbrDate: daysAgo(5) },
    { name: 'Quantum Defense', status: 'Active', industry: 'Defense & Aerospace', tier: 'Enterprise', companySize: '1000-5000', mrr: 18000, contractValue: 216000, healthScore: 92, engagementScore: 90, paymentScore: 100, csmPulse: 95, source: 'Partner', onboardedAt: daysAgo(730), lastContactAt: daysAgo(1), nextQbrDate: daysFromNow(45) },
    { name: 'NovaStar Retail', status: 'Onboarding', industry: 'Retail', tier: 'Mid-Market', companySize: '200-500', mrr: 8000, contractValue: 96000, healthScore: 60, engagementScore: 55, paymentScore: 100, csmPulse: 65, source: 'Outbound', onboardedAt: daysAgo(14), lastContactAt: daysAgo(1) },
    { name: 'Atlas Manufacturing', status: 'Active', industry: 'Manufacturing', tier: 'SMB', companySize: '50-200', mrr: 5000, contractValue: 60000, healthScore: 78, engagementScore: 75, paymentScore: 90, csmPulse: 80, source: 'Referral', onboardedAt: daysAgo(180), lastContactAt: daysAgo(5), nextQbrDate: daysFromNow(20) },
    { name: 'Pinnacle Logistics', status: 'Prospect', industry: 'Logistics', tier: 'Mid-Market', companySize: '500-1000', mrr: 0, contractValue: 0, healthScore: 50, engagementScore: 50, paymentScore: 100, csmPulse: 50, source: 'Conference', lastContactAt: daysAgo(3) },
  ];

  const clients: Record<string, string> = {};
  for (const c of clientsData) {
    const client = await prisma.client.create({ data: c });
    clients[c.name] = client.id;
  }

  // Contacts
  const contactsData = [
    { clientName: 'TechCorp Industries', name: 'Sarah Chen', title: 'CISO', email: 'schen@techcorp.com', phone: '555-0101', role: 'Champion', sentiment: 'Positive', isPrimary: true, isExecutive: true },
    { clientName: 'TechCorp Industries', name: 'Mike Rodriguez', title: 'VP Engineering', email: 'mrodriguez@techcorp.com', role: 'Technical Buyer', sentiment: 'Positive' },
    { clientName: 'TechCorp Industries', name: 'Lisa Park', title: 'Security Analyst', email: 'lpark@techcorp.com', role: 'End User', sentiment: 'Neutral' },
    { clientName: 'Meridian Financial', name: 'James Wilson', title: 'CTO', email: 'jwilson@meridianfin.com', phone: '555-0201', role: 'Economic Buyer', sentiment: 'Neutral', isPrimary: true, isExecutive: true },
    { clientName: 'Meridian Financial', name: 'Angela Torres', title: 'Director of Security', email: 'atorres@meridianfin.com', role: 'Champion', sentiment: 'Positive' },
    { clientName: 'Apex Healthcare', name: 'Dr. Robert Kim', title: 'CIO', email: 'rkim@apexhealth.com', phone: '555-0301', role: 'Economic Buyer', sentiment: 'Negative', isPrimary: true, isExecutive: true },
    { clientName: 'Apex Healthcare', name: 'Patricia Nguyen', title: 'IT Manager', email: 'pnguyen@apexhealth.com', role: 'Technical Buyer', sentiment: 'Negative' },
    { clientName: 'Quantum Defense', name: 'Col. David Brown', title: 'CISO', email: 'dbrown@quantumdef.com', phone: '555-0401', role: 'Champion', sentiment: 'Positive', isPrimary: true, isExecutive: true },
    { clientName: 'Quantum Defense', name: 'Maria Garcia', title: 'Security Operations Lead', email: 'mgarcia@quantumdef.com', role: 'Technical Buyer', sentiment: 'Positive' },
    { clientName: 'NovaStar Retail', name: 'Tom Anderson', title: 'CEO', email: 'tanderson@novastar.com', phone: '555-0501', role: 'Economic Buyer', sentiment: 'Positive', isPrimary: true, isExecutive: true },
    { clientName: 'NovaStar Retail', name: 'Jenny Liu', title: 'IT Director', email: 'jliu@novastar.com', role: 'Champion', sentiment: 'Neutral' },
    { clientName: 'Atlas Manufacturing', name: 'Bill Murphy', title: 'Owner/CEO', email: 'bmurphy@atlasmfg.com', phone: '555-0601', role: 'Economic Buyer', sentiment: 'Positive', isPrimary: true, isExecutive: true },
    { clientName: 'Atlas Manufacturing', name: 'Karen White', title: 'Office Manager', email: 'kwhite@atlasmfg.com', role: 'End User', sentiment: 'Neutral' },
    { clientName: 'Pinnacle Logistics', name: 'Steve Clark', title: 'VP Operations', email: 'sclark@pinnaclelogistics.com', phone: '555-0701', role: 'Economic Buyer', sentiment: 'Neutral', isPrimary: true },
  ];

  const contactIds: Record<string, string> = {};
  for (const c of contactsData) {
    const { clientName, ...data } = c;
    const contact = await prisma.contact.create({
      data: { ...data, clientId: clients[clientName], lastContactAt: daysAgo(Math.floor(Math.random() * 20)) },
    });
    contactIds[c.name] = contact.id;
  }

  // Deals
  const dealsData = [
    { clientName: 'TechCorp Industries', title: 'Enterprise MDR Expansion', value: 350000, stage: 'Negotiation', probability: 75, closeDate: daysFromNow(20), nextStep: 'Final pricing review' },
    { clientName: 'TechCorp Industries', title: 'Cloud Security Assessment', value: 45000, stage: 'Closed Won', probability: 100, actualCloseDate: daysAgo(30) },
    { clientName: 'Meridian Financial', title: 'SOC-as-a-Service', value: 500000, stage: 'Proposal', probability: 50, closeDate: daysFromNow(45), nextStep: 'Present proposal to board' },
    { clientName: 'Meridian Financial', title: 'Pen Testing Engagement', value: 75000, stage: 'Discovery', probability: 25, closeDate: daysFromNow(60) },
    { clientName: 'Apex Healthcare', title: 'HIPAA Compliance Remediation', value: 120000, stage: 'Proposal', probability: 50, closeDate: daysFromNow(30) },
    { clientName: 'Quantum Defense', title: 'Zero Trust Architecture', value: 280000, stage: 'Closed Won', probability: 100, actualCloseDate: daysAgo(60), winFactors: 'Strong relationship, technical expertise' },
    { clientName: 'Quantum Defense', title: 'CMMC Level 3 Readiness', value: 180000, stage: 'Negotiation', probability: 75, closeDate: daysFromNow(15) },
    { clientName: 'NovaStar Retail', title: 'PCI-DSS Compliance Program', value: 95000, stage: 'Lead', probability: 10, closeDate: daysFromNow(90) },
    { clientName: 'Atlas Manufacturing', title: 'OT Security Assessment', value: 55000, stage: 'Discovery', probability: 25, closeDate: daysFromNow(45) },
    { clientName: 'Pinnacle Logistics', title: 'Managed Security Services', value: 200000, stage: 'Lead', probability: 10, closeDate: daysFromNow(120) },
    { clientName: 'Apex Healthcare', title: 'Incident Response Retainer', value: 60000, stage: 'Closed Lost', probability: 0, lostReason: 'Budget constraints', actualCloseDate: daysAgo(15) },
    { clientName: 'Meridian Financial', title: 'vCISO Advisory', value: 150000, stage: 'Closed Won', probability: 100, actualCloseDate: daysAgo(90) },
  ];

  const dealIds: string[] = [];
  for (const d of dealsData) {
    const { clientName, ...data } = d;
    const deal = await prisma.deal.create({
      data: { ...data, clientId: clients[clientName] },
    });
    dealIds.push(deal.id);
  }

  // Activities
  const activityTypes = ['meeting', 'call', 'email', 'note'];
  const sentiments = ['Positive', 'Neutral', 'Negative', null];
  const clientNames = Object.keys(clients);

  for (let i = 0; i < 50; i++) {
    const clientName = clientNames[i % clientNames.length];
    const type = activityTypes[i % activityTypes.length];
    const titles: Record<string, string[]> = {
      meeting: ['QBR Meeting', 'Security Review', 'Onboarding Session', 'Executive Briefing', 'Roadmap Discussion'],
      call: ['Check-in Call', 'Support Call', 'Escalation Call', 'Follow-up Call', 'Demo Call'],
      email: ['Proposal Follow-up', 'Weekly Update', 'Incident Report', 'Renewal Reminder', 'Thank You Note'],
      note: ['Client Feedback', 'Internal Note', 'Action Items', 'Risk Assessment', 'Opportunity Identified'],
    };
    await prisma.activity.create({
      data: {
        clientId: clients[clientName],
        type,
        title: titles[type][i % 5],
        description: `${type} activity with ${clientName}`,
        date: daysAgo(Math.floor(Math.random() * 60)),
        duration: type === 'meeting' ? 60 : type === 'call' ? 30 : undefined,
        sentiment: sentiments[i % sentiments.length],
        isKeyMoment: i % 10 === 0,
        isProactive: i % 3 !== 0,
      },
    });
  }

  // Tasks
  const taskCategories = ['Follow-up', 'Delivery', 'Administrative', 'Sales', 'Support'];
  const priorities = ['Urgent', 'High', 'Medium', 'Low'];
  const taskTitles = [
    'Send QBR report', 'Schedule executive review', 'Update security roadmap', 'Prepare proposal',
    'Review SLA metrics', 'Follow up on escalation', 'Complete risk assessment', 'Renew contract',
    'Update client portal', 'Create incident report', 'Plan security awareness training',
    'Review vulnerability scan results', 'Update compliance documentation', 'Prepare monthly report',
    'Schedule penetration test', 'Review access controls', 'Update disaster recovery plan',
    'Conduct security audit', 'Prepare board presentation', 'Review insurance requirements',
    'Update SOW', 'Schedule team training', 'Review vendor assessments', 'Prepare RFP response',
  ];

  for (let i = 0; i < taskTitles.length; i++) {
    const isCompleted = i < 8;
    const clientName = clientNames[i % clientNames.length];
    await prisma.task.create({
      data: {
        title: taskTitles[i],
        clientId: clients[clientName],
        priority: priorities[i % priorities.length],
        status: isCompleted ? 'completed' : 'open',
        category: taskCategories[i % taskCategories.length],
        dueDate: isCompleted ? daysAgo(Math.floor(Math.random() * 10)) : daysFromNow(Math.floor(Math.random() * 30)),
        completedAt: isCompleted ? daysAgo(Math.floor(Math.random() * 5)) : undefined,
        sortOrder: i,
      },
    });
  }

  // Time Entries
  const timeCategories = ['Consulting', 'Implementation', 'Support', 'Assessment', 'Training'];
  for (let i = 0; i < 20; i++) {
    const clientName = clientNames[i % clientNames.length];
    await prisma.timeEntry.create({
      data: {
        clientId: clients[clientName],
        description: `${timeCategories[i % timeCategories.length]} work for ${clientName}`,
        hours: [0.5, 1, 1.5, 2, 3, 4, 6, 8][i % 8],
        rate: 175,
        date: daysAgo(Math.floor(Math.random() * 30)),
        category: timeCategories[i % timeCategories.length],
        billable: i % 5 !== 0,
      },
    });
  }

  // Invoices
  const invoicesData = [
    { clientName: 'TechCorp Industries', number: 'INV-001', amount: 22000, status: 'Paid', issuedDate: daysAgo(60), dueDate: daysAgo(30), paidDate: daysAgo(25), paymentMethod: 'ACH' },
    { clientName: 'Meridian Financial', number: 'INV-002', amount: 25000, status: 'Paid', issuedDate: daysAgo(45), dueDate: daysAgo(15), paidDate: daysAgo(12), paymentMethod: 'Wire' },
    { clientName: 'Apex Healthcare', number: 'INV-003', amount: 12000, status: 'Overdue', issuedDate: daysAgo(45), dueDate: daysAgo(15) },
    { clientName: 'Quantum Defense', number: 'INV-004', amount: 18000, status: 'Sent', issuedDate: daysAgo(10), dueDate: daysFromNow(20) },
    { clientName: 'Atlas Manufacturing', number: 'INV-005', amount: 5000, status: 'Draft', issuedDate: new Date(), dueDate: daysFromNow(30) },
    { clientName: 'TechCorp Industries', number: 'INV-006', amount: 45000, status: 'Sent', issuedDate: daysAgo(5), dueDate: daysFromNow(25) },
  ];

  for (const inv of invoicesData) {
    const { clientName, ...data } = inv;
    const invoice = await prisma.invoice.create({
      data: { ...data, clientId: clients[clientName], terms: 'Net 30' },
    });
    // Line items
    await prisma.invoiceLineItem.create({
      data: { invoiceId: invoice.id, description: 'Monthly Managed Security Services', quantity: 1, unitPrice: data.amount * 0.7, amount: data.amount * 0.7, sortOrder: 0 },
    });
    await prisma.invoiceLineItem.create({
      data: { invoiceId: invoice.id, description: 'Additional Consulting Hours', quantity: Math.ceil(data.amount * 0.3 / 175), unitPrice: 175, amount: data.amount * 0.3, sortOrder: 1 },
    });
  }

  // Contracts
  const contractsData = [
    { clientName: 'TechCorp Industries', title: 'Master Services Agreement', type: 'MSA', status: 'Active', startDate: daysAgo(365), endDate: daysFromNow(365), value: 264000, monthlyValue: 22000, renewalType: 'Auto-Renew' },
    { clientName: 'Meridian Financial', title: 'Enterprise Security Agreement', type: 'MSA', status: 'Active', startDate: daysAgo(540), endDate: daysFromNow(25), value: 300000, monthlyValue: 25000, renewalType: 'Manual', reminderDays: 30 },
    { clientName: 'Quantum Defense', title: 'Government Security Contract', type: 'Fixed-Price', status: 'Active', startDate: daysAgo(180), endDate: daysFromNow(180), value: 216000, monthlyValue: 18000, renewalType: 'Auto-Renew' },
    { clientName: 'NovaStar Retail', title: 'Onboarding SOW', type: 'SOW', status: 'Draft', startDate: new Date(), value: 96000, monthlyValue: 8000 },
  ];

  for (const c of contractsData) {
    const { clientName, ...data } = c;
    await prisma.contract.create({ data: { ...data, clientId: clients[clientName] } });
  }

  // Proposals
  const proposalsData = [
    { clientName: 'Meridian Financial', title: 'SOC-as-a-Service Proposal', status: 'Sent', investment: 500000, executiveSummary: 'Comprehensive 24/7 SOC monitoring and incident response', sentAt: daysAgo(10), validUntil: daysFromNow(20) },
    { clientName: 'Apex Healthcare', title: 'HIPAA Compliance Remediation', status: 'Draft', investment: 120000, executiveSummary: 'Full HIPAA compliance gap assessment and remediation plan' },
    { clientName: 'Pinnacle Logistics', title: 'Managed Security Services', status: 'Draft', investment: 200000, executiveSummary: 'End-to-end managed security for logistics operations' },
  ];

  for (const p of proposalsData) {
    const { clientName, ...data } = p;
    const proposal = await prisma.proposal.create({ data: { ...data, clientId: clients[clientName] } });
    await prisma.proposalDeliverable.create({ data: { proposalId: proposal.id, title: 'Discovery & Assessment', description: 'Initial security posture assessment', sortOrder: 0 } });
    await prisma.proposalDeliverable.create({ data: { proposalId: proposal.id, title: 'Implementation', description: 'Deploy and configure security controls', sortOrder: 1 } });
    await prisma.proposalDeliverable.create({ data: { proposalId: proposal.id, title: 'Ongoing Management', description: 'Continuous monitoring and optimization', sortOrder: 2 } });
  }

  // Client Goals
  const goalsPerClient: Record<string, Array<{ title: string; status: string; targetValue: number; currentValue: number; unit: string; targetMetric: string }>> = {
    'TechCorp Industries': [
      { title: 'Reduce Mean Time to Detect', status: 'In Progress', targetValue: 15, currentValue: 22, unit: 'minutes', targetMetric: 'MTTD' },
      { title: 'Achieve SOC 2 Type II', status: 'Achieved', targetValue: 100, currentValue: 100, unit: '%', targetMetric: 'Compliance' },
      { title: 'Reduce Vulnerability Count', status: 'In Progress', targetValue: 50, currentValue: 120, unit: 'vulnerabilities', targetMetric: 'Critical Vulns' },
    ],
    'Meridian Financial': [
      { title: 'PCI-DSS Compliance', status: 'In Progress', targetValue: 100, currentValue: 78, unit: '%', targetMetric: 'Compliance Score' },
      { title: 'Security Awareness Score', status: 'At Risk', targetValue: 90, currentValue: 55, unit: '%', targetMetric: 'Phishing Test Pass Rate' },
    ],
    'Apex Healthcare': [
      { title: 'HIPAA Compliance', status: 'At Risk', targetValue: 100, currentValue: 45, unit: '%', targetMetric: 'Compliance' },
      { title: 'Incident Response Time', status: 'In Progress', targetValue: 30, currentValue: 120, unit: 'minutes', targetMetric: 'MTTR' },
    ],
    'Quantum Defense': [
      { title: 'CMMC Level 3 Certification', status: 'In Progress', targetValue: 100, currentValue: 82, unit: '%', targetMetric: 'Readiness Score' },
      { title: 'Zero Trust Implementation', status: 'In Progress', targetValue: 100, currentValue: 65, unit: '%', targetMetric: 'ZT Score' },
      { title: 'Supply Chain Security', status: 'Achieved', targetValue: 100, currentValue: 100, unit: '%', targetMetric: 'Vendor Assessment' },
    ],
  };

  for (const [clientName, goals] of Object.entries(goalsPerClient)) {
    for (const g of goals) {
      await prisma.clientGoal.create({
        data: {
          clientId: clients[clientName],
          ...g,
          baselineValue: g.currentValue * 1.5,
          quarter: 'Q2 2026',
          dueDate: daysFromNow(90),
          achievedAt: g.status === 'Achieved' ? daysAgo(30) : undefined,
        },
      });
    }
  }

  // Client Services
  const servicesByClient: Record<string, Array<{ serviceName: string; category: string; status: string; revenue: number }>> = {
    'TechCorp Industries': [
      { serviceName: 'Managed Detection & Response', category: 'Security Operations', status: 'Active', revenue: 12000 },
      { serviceName: 'Vulnerability Management', category: 'Risk Management', status: 'Active', revenue: 5000 },
      { serviceName: 'Compliance Advisory', category: 'Compliance', status: 'Active', revenue: 5000 },
    ],
    'Meridian Financial': [
      { serviceName: 'vCISO Advisory', category: 'Strategy', status: 'Active', revenue: 15000 },
      { serviceName: 'Penetration Testing', category: 'Assessment', status: 'Active', revenue: 5000 },
      { serviceName: 'Security Awareness Training', category: 'Training', status: 'Active', revenue: 5000 },
    ],
    'Apex Healthcare': [
      { serviceName: 'HIPAA Compliance', category: 'Compliance', status: 'Active', revenue: 8000 },
      { serviceName: 'Managed Firewall', category: 'Security Operations', status: 'At-Risk', revenue: 4000 },
    ],
    'Quantum Defense': [
      { serviceName: 'CMMC Readiness', category: 'Compliance', status: 'Active', revenue: 10000 },
      { serviceName: 'Zero Trust Architecture', category: 'Strategy', status: 'Active', revenue: 8000 },
    ],
    'NovaStar Retail': [
      { serviceName: 'PCI-DSS Compliance', category: 'Compliance', status: 'Onboarding', revenue: 5000 },
      { serviceName: 'Endpoint Protection', category: 'Security Operations', status: 'Onboarding', revenue: 3000 },
    ],
    'Atlas Manufacturing': [
      { serviceName: 'OT Security Monitoring', category: 'Security Operations', status: 'Active', revenue: 3000 },
      { serviceName: 'Incident Response Retainer', category: 'Response', status: 'Active', revenue: 2000 },
    ],
  };

  for (const [clientName, services] of Object.entries(servicesByClient)) {
    for (const s of services) {
      await prisma.clientService.create({
        data: { ...s, clientId: clients[clientName], startDate: daysAgo(180) },
      });
    }
  }

  // Health Score Snapshots
  for (const [clientName, clientId] of Object.entries(clients)) {
    const baseScore = clientsData.find(c => c.name === clientName)?.healthScore ?? 50;
    for (let i = 3; i >= 0; i--) {
      const variance = Math.floor(Math.random() * 10) - 5;
      await prisma.healthScoreSnapshot.create({
        data: {
          clientId,
          score: Math.max(10, Math.min(100, baseScore + variance - i * 3)),
          engagement: Math.max(10, Math.min(100, baseScore + variance - 5)),
          payment: Math.max(10, Math.min(100, baseScore + variance + 10)),
          csmPulse: Math.max(10, Math.min(100, baseScore + variance)),
          recordedAt: daysAgo(i * 30),
        },
      });
    }
  }

  // Playbooks
  const onboarding = await prisma.playbook.create({
    data: { name: 'New Client Onboarding', description: 'Standard onboarding process for new clients', trigger: 'client_created' },
  });
  const onboardingSteps = ['Welcome call & kickoff', 'Send security questionnaire', 'Initial risk assessment', 'Deploy monitoring agents', 'Configure alerting thresholds', 'First monthly review'];
  for (let i = 0; i < onboardingSteps.length; i++) {
    await prisma.playbookStep.create({
      data: { playbookId: onboarding.id, title: onboardingSteps[i], dayOffset: i * 3, sortOrder: i },
    });
  }

  const qbr = await prisma.playbook.create({
    data: { name: 'QBR Preparation', description: 'Quarterly business review preparation checklist', trigger: 'qbr_upcoming' },
  });
  const qbrSteps = ['Pull metrics & KPIs', 'Prepare executive summary', 'Draft recommendations', 'Schedule QBR meeting', 'Send pre-read materials'];
  for (let i = 0; i < qbrSteps.length; i++) {
    await prisma.playbookStep.create({
      data: { playbookId: qbr.id, title: qbrSteps[i], dayOffset: i * 2, sortOrder: i },
    });
  }

  const churn = await prisma.playbook.create({
    data: { name: 'Churn Prevention', description: 'Intervention playbook for at-risk clients', trigger: 'health_drop' },
  });
  const churnSteps = ['Immediate executive outreach', 'Root cause analysis', 'Create remediation plan', 'Daily check-ins for 2 weeks', 'Post-recovery review'];
  for (let i = 0; i < churnSteps.length; i++) {
    await prisma.playbookStep.create({
      data: { playbookId: churn.id, title: churnSteps[i], dayOffset: i, taskPriority: 'Urgent', sortOrder: i },
    });
  }

  // Templates
  await prisma.template.create({ data: { name: 'QBR Agenda', category: 'Meeting', subject: 'Quarterly Business Review - {{clientName}}', body: 'Dear {{contactName}},\n\nPlease find the agenda for our upcoming QBR:\n\n1. Performance Review\n2. Security Metrics\n3. Roadmap Discussion\n4. Action Items\n\nBest regards' } });
  await prisma.template.create({ data: { name: 'Monthly Report', category: 'Report', subject: 'Monthly Security Report - {{clientName}}', body: 'Security Highlights:\n- Incidents detected: {{incidents}}\n- Vulnerabilities remediated: {{vulns}}\n- Compliance score: {{compliance}}%\n\nKey Recommendations:\n{{recommendations}}' } });
  await prisma.template.create({ data: { name: 'Welcome Email', category: 'Onboarding', subject: 'Welcome to AccountOS Security Services', body: 'Dear {{contactName}},\n\nWelcome aboard! We are thrilled to partner with {{clientName}} on your cybersecurity journey.\n\nYour dedicated team is ready to begin the onboarding process.\n\nBest regards' } });

  // Snippets
  await prisma.snippet.create({ data: { title: 'Incident Response Process', category: 'Security', content: 'Our incident response follows NIST SP 800-61: Preparation, Detection, Containment, Eradication, Recovery, Lessons Learned.', tags: 'IR,NIST,process' } });
  await prisma.snippet.create({ data: { title: 'Compliance Frameworks', category: 'Compliance', content: 'We support SOC 2, HIPAA, PCI-DSS, CMMC, NIST CSF, and ISO 27001 compliance programs.', tags: 'compliance,frameworks' } });

  // Network Contacts
  await prisma.networkContact.create({ data: { name: 'Alex Thompson', company: 'CyberVault Inc', title: 'CEO', email: 'alex@cybervault.com', relationship: 'Partner', source: 'Conference', tags: 'partner,referral', lastContactAt: daysAgo(10) } });
  await prisma.networkContact.create({ data: { name: 'Diana Martinez', company: 'InsureTech Corp', title: 'VP Sales', email: 'diana@insuretech.com', relationship: 'Prospect', source: 'LinkedIn', tags: 'prospect,insurance', lastContactAt: daysAgo(20) } });
  await prisma.networkContact.create({ data: { name: 'Chris Lee', company: 'ThreatHunter Labs', title: 'CTO', email: 'chris@threathunter.com', relationship: 'Vendor', source: 'Referral', tags: 'vendor,technology', lastContactAt: daysAgo(5) } });

  // Competitors
  await prisma.clientCompetitor.create({ data: { clientId: clients['Apex Healthcare'], name: 'CrowdStrike', services: 'MDR, EDR', threatLevel: 'High', notes: 'Actively pitching to their CISO' } });
  await prisma.clientCompetitor.create({ data: { clientId: clients['Meridian Financial'], name: 'Palo Alto Networks', services: 'SASE, Firewall', threatLevel: 'Medium', notes: 'Existing firewall vendor' } });

  // Health Score Config
  await prisma.healthScoreConfig.create({
    data: { engagementWeight: 25, satisfactionWeight: 20, paymentWeight: 20, adoptionWeight: 15, csmPulseWeight: 20 },
  });

  console.log('Seed data created successfully!');
  console.log(`  - 1 user`);
  console.log(`  - ${clientsData.length} clients`);
  console.log(`  - ${contactsData.length} contacts`);
  console.log(`  - ${dealsData.length} deals`);
  console.log(`  - 50 activities`);
  console.log(`  - ${taskTitles.length} tasks`);
  console.log(`  - 20 time entries`);
  console.log(`  - ${invoicesData.length} invoices`);
  console.log(`  - ${contractsData.length} contracts`);
  console.log(`  - ${proposalsData.length} proposals`);
  console.log(`  - 3 playbooks`);
  console.log(`  - 3 templates`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
