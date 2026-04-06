import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

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

function monthsAgo(n: number): Date {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d;
}

async function main() {
  console.log('Seeding database...');

  // ── Clear existing data (order matters for FK constraints) ──────────────
  await prisma.activity.deleteMany();
  await prisma.task.deleteMany();
  await prisma.clientService.deleteMany();
  await prisma.service.deleteMany();
  await prisma.scoreSnapshot.deleteMany();
  await prisma.valueOutcome.deleteMany();
  await prisma.journeyPhase.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  // ── 1. User ─────────────────────────────────────────────────────────────
  const hashedPassword = await hash('admin123', 10);
  const user = await prisma.user.create({
    data: {
      email: 'admin@accountos.app',
      password: hashedPassword,
      name: 'Admin',
    },
  });
  console.log('Created user:', user.email);

  // ── 2. Clients ──────────────────────────────────────────────────────────
  const clientData = [
    {
      name: 'Meridian Capital Partners',
      industry: 'Financial Services',
      size: 'Enterprise',
      status: 'active',
      tier: 'Gold',
      mrr: 15000,
      contactName: 'Victoria Langford',
      contactEmail: 'v.langford@meridiancapital.com',
      contactPhone: '(212) 555-0190',
    },
    {
      name: 'Atlas Healthcare Group',
      industry: 'Healthcare',
      size: 'Mid-Market',
      status: 'active',
      tier: 'Silver',
      mrr: 8500,
      contactName: 'Dr. Marcus Chen',
      contactEmail: 'm.chen@atlashealthcare.com',
      contactPhone: '(415) 555-0234',
    },
    {
      name: 'Pinnacle Manufacturing',
      industry: 'Manufacturing',
      size: 'Mid-Market',
      status: 'active',
      tier: 'Silver',
      mrr: 6000,
      contactName: 'Robert Kowalski',
      contactEmail: 'r.kowalski@pinnaclemfg.com',
      contactPhone: '(312) 555-0178',
    },
    {
      name: 'Horizon Tech Ventures',
      industry: 'Technology',
      size: 'SMB',
      status: 'onboarding',
      tier: 'Bronze',
      mrr: 3500,
      contactName: 'Priya Sharma',
      contactEmail: 'p.sharma@horizontech.io',
      contactPhone: '(650) 555-0312',
    },
    {
      name: 'Summit Legal Associates',
      industry: 'Legal',
      size: 'SMB',
      status: 'active',
      tier: 'Bronze',
      mrr: 4200,
      contactName: 'James Whitfield',
      contactEmail: 'j.whitfield@summitlegal.com',
      contactPhone: '(202) 555-0145',
    },
    {
      name: 'Coastal Retail Group',
      industry: 'Retail',
      size: 'Mid-Market',
      status: 'active',
      tier: 'Silver',
      mrr: 7000,
      contactName: 'Angela Torres',
      contactEmail: 'a.torres@coastalretail.com',
      contactPhone: '(305) 555-0267',
    },
  ] as const;

  const clients = [];
  for (const data of clientData) {
    const client = await prisma.client.create({ data: { ...data } });
    clients.push(client);
  }
  const [meridian, atlas, pinnacle, horizon, summit, coastal] = clients;
  console.log(`Created ${clients.length} clients`);

  // ── 3. Journey Phases ───────────────────────────────────────────────────
  const phases = [
    'CRA',
    'Remediation',
    'Implementation',
    'Monitoring',
    'Optimization',
    'Maturity',
  ];

  // Status maps: how far each client has progressed
  // completed phases, then in_progress, then not_started
  const journeyProgress: Record<string, number> = {
    // number = index of the in_progress phase (all before are completed)
    [meridian.id]: 5,   // 0-4 completed, 5 (Maturity) in_progress
    [atlas.id]: 3,      // 0-2 completed, 3 (Monitoring) in_progress
    [pinnacle.id]: 2,   // 0-1 completed, 2 (Implementation) in_progress
    [horizon.id]: 0,    // 0 (CRA) in_progress, rest not_started
    [summit.id]: 4,     // 0-3 completed, 4 (Optimization) in_progress
    [coastal.id]: 3,    // 0-2 completed, 3 (Monitoring) in_progress
  };

  for (const client of clients) {
    const inProgressIdx = journeyProgress[client.id];
    for (let i = 0; i < phases.length; i++) {
      let status: string;
      let startedAt: Date | null = null;
      let completedAt: Date | null = null;

      if (i < inProgressIdx) {
        status = 'completed';
        startedAt = monthsAgo(6 - i);
        completedAt = monthsAgo(5 - i);
      } else if (i === inProgressIdx) {
        status = 'in_progress';
        startedAt = monthsAgo(1);
      } else {
        status = 'not_started';
      }

      await prisma.journeyPhase.create({
        data: {
          clientId: client.id,
          phase: phases[i],
          status,
          order: i + 1,
          startedAt,
          completedAt,
        },
      });
    }
  }
  console.log('Created journey phases');

  // ── 4. Value Outcomes ───────────────────────────────────────────────────
  const outcomeCategories = [
    'risk_reduction',
    'compliance',
    'resilience',
    'data_protection',
    'incident_response',
    'security_culture',
  ];

  const outcomeScores: Record<string, number[]> = {
    [meridian.id]: [88, 92, 85, 90, 78, 82],
    [atlas.id]: [72, 68, 65, 70, 60, 55],
    [pinnacle.id]: [55, 48, 42, 50, 38, 35],
    [horizon.id]: [20, 15, 18, 22, 10, 12],
    [summit.id]: [78, 82, 75, 80, 72, 68],
    [coastal.id]: [65, 70, 62, 68, 58, 55],
  };

  for (const client of clients) {
    const scores = outcomeScores[client.id];
    for (let i = 0; i < outcomeCategories.length; i++) {
      await prisma.valueOutcome.create({
        data: {
          clientId: client.id,
          category: outcomeCategories[i],
          score: scores[i],
        },
      });
    }
  }
  console.log('Created value outcomes');

  // ── 5. Score Snapshots ──────────────────────────────────────────────────
  // Current scores from outcomeScores; build 6 monthly snapshots trending upward
  for (const client of clients) {
    const currentScores = outcomeScores[client.id];
    for (let month = 5; month >= 0; month--) {
      // Each month back, reduce scores proportionally
      const factor = 1 - month * 0.08; // 5 months ago = 60% of current, now = 100%
      const riskReduction = Math.round(currentScores[0] * factor);
      const compliance = Math.round(currentScores[1] * factor);
      const resilience = Math.round(currentScores[2] * factor);
      const dataProtection = Math.round(currentScores[3] * factor);
      const incidentResponse = Math.round(currentScores[4] * factor);
      const securityCulture = Math.round(currentScores[5] * factor);
      const overallScore = Math.round(
        (riskReduction + compliance + resilience + dataProtection + incidentResponse + securityCulture) / 6
      );

      await prisma.scoreSnapshot.create({
        data: {
          clientId: client.id,
          overallScore,
          riskReduction,
          compliance,
          resilience,
          dataProtection,
          incidentResponse,
          securityCulture,
          capturedAt: monthsAgo(month),
        },
      });
    }
  }
  console.log('Created score snapshots');

  // ── 6. Services ─────────────────────────────────────────────────────────
  const serviceData = [
    { name: 'Cyber Risk Assessment', category: 'Assessment' },
    { name: 'Penetration Testing', category: 'Assessment' },
    { name: '24/7 SOC Monitoring', category: 'Managed' },
    { name: 'Endpoint Protection', category: 'Managed' },
    { name: 'vCISO Services', category: 'Advisory' },
    { name: 'Board Reporting', category: 'Advisory' },
    { name: 'Security Awareness Training', category: 'Training' },
    { name: 'Phishing Simulation', category: 'Training' },
    { name: 'Compliance Gap Analysis', category: 'Compliance' },
    { name: 'Policy Development', category: 'Compliance' },
    { name: 'Incident Response Retainer', category: 'Incident' },
    { name: 'Forensic Analysis', category: 'Incident' },
  ];

  const services = [];
  for (const data of serviceData) {
    const svc = await prisma.service.create({ data });
    services.push(svc);
  }
  console.log(`Created ${services.length} services`);

  // ── 7. Client-Service Assignments ───────────────────────────────────────
  // [clientIndex, serviceIndex, status]
  const assignments: [number, number, string][] = [
    // Meridian — most active services (8 total, mostly active)
    [0, 0, 'active'],
    [0, 1, 'active'],
    [0, 2, 'active'],
    [0, 3, 'active'],
    [0, 4, 'active'],
    [0, 5, 'active'],
    [0, 6, 'active'],
    [0, 10, 'planned'],
    // Atlas
    [1, 0, 'active'],
    [1, 2, 'active'],
    [1, 3, 'active'],
    [1, 6, 'active'],
    [1, 8, 'planned'],
    // Pinnacle
    [2, 0, 'active'],
    [2, 3, 'active'],
    [2, 7, 'planned'],
    [2, 9, 'planned'],
    // Horizon — mostly opportunities (new client)
    [3, 0, 'active'],
    [3, 2, 'opportunity'],
    [3, 4, 'opportunity'],
    [3, 6, 'opportunity'],
    [3, 8, 'opportunity'],
    [3, 10, 'opportunity'],
    // Summit
    [4, 0, 'active'],
    [4, 2, 'active'],
    [4, 4, 'active'],
    [4, 8, 'active'],
    [4, 9, 'active'],
    [4, 11, 'planned'],
    // Coastal
    [5, 0, 'active'],
    [5, 2, 'active'],
    [5, 3, 'active'],
    [5, 6, 'planned'],
    [5, 7, 'planned'],
  ];

  for (const [ci, si, status] of assignments) {
    await prisma.clientService.create({
      data: {
        clientId: clients[ci].id,
        serviceId: services[si].id,
        status,
      },
    });
  }
  console.log(`Created ${assignments.length} client-service records`);

  // ── 8. Tasks ────────────────────────────────────────────────────────────
  const tasks = [
    { title: 'Review firewall rules', description: 'Audit inbound/outbound rules for Meridian perimeter firewalls', status: 'in_progress', priority: 'urgent', dueDate: daysAgo(1), clientId: meridian.id },
    { title: 'Schedule CRA follow-up', description: 'Book follow-up meeting to discuss CRA findings', status: 'todo', priority: 'high', dueDate: daysFromNow(3), clientId: horizon.id },
    { title: 'Update incident response plan', description: 'Revise IRP with lessons learned from Q1 tabletop exercise', status: 'in_progress', priority: 'high', dueDate: daysFromNow(7), clientId: summit.id },
    { title: 'Deploy endpoint agents', description: 'Roll out EDR agents to remaining 45 workstations', status: 'todo', priority: 'medium', dueDate: daysFromNow(14), clientId: pinnacle.id },
    { title: 'Prepare board security briefing', description: 'Create executive summary for Q2 board presentation', status: 'todo', priority: 'high', dueDate: daysFromNow(21), clientId: meridian.id },
    { title: 'Conduct phishing simulation', description: 'Launch Q2 phishing campaign across all departments', status: 'done', priority: 'medium', dueDate: daysAgo(5), clientId: atlas.id },
    { title: 'Review SOC alert thresholds', description: 'Tune SIEM correlation rules to reduce false positives', status: 'in_progress', priority: 'medium', dueDate: daysFromNow(5), clientId: coastal.id },
    { title: 'Complete compliance gap analysis', description: 'Finalize PCI-DSS gap analysis report', status: 'done', priority: 'high', dueDate: daysAgo(10), clientId: coastal.id },
    { title: 'Onboard Horizon to SOC', description: 'Set up log forwarding and initial SIEM configuration', status: 'todo', priority: 'urgent', dueDate: daysFromNow(2), clientId: horizon.id },
    { title: 'Renew penetration testing scope', description: 'Define scope for annual external pen test', status: 'todo', priority: 'medium', dueDate: daysFromNow(30), clientId: meridian.id },
    { title: 'Patch critical vulnerabilities', description: 'Apply emergency patches for CVE-2026-1234', status: 'done', priority: 'urgent', dueDate: daysAgo(3), clientId: atlas.id },
    { title: 'Draft security policies', description: 'Create acceptable use and data classification policies', status: 'in_progress', priority: 'medium', dueDate: daysFromNow(10), clientId: pinnacle.id },
    { title: 'Configure MFA enrollment', description: 'Enable MFA for all admin and privileged accounts', status: 'todo', priority: 'high', dueDate: daysFromNow(5), clientId: horizon.id },
    { title: 'Review access control lists', description: 'Quarterly review of user permissions and service accounts', status: 'todo', priority: 'low', dueDate: daysFromNow(45), clientId: summit.id },
    { title: 'Update network diagrams', description: 'Reflect recent infrastructure changes in network documentation', status: 'done', priority: 'low', dueDate: daysAgo(7), clientId: meridian.id },
  ];

  for (const data of tasks) {
    await prisma.task.create({ data });
  }
  console.log(`Created ${tasks.length} tasks`);

  // ── 9. Activities ───────────────────────────────────────────────────────
  const activities = [
    { clientId: meridian.id, type: 'meeting', title: 'Quarterly business review', details: 'Reviewed security posture improvements and upcoming initiatives', createdAt: daysAgo(2) },
    { clientId: meridian.id, type: 'score_update', title: 'Overall score increased to 86', details: 'Compliance score jumped 5 points after policy rollout', createdAt: daysAgo(5) },
    { clientId: meridian.id, type: 'email', title: 'Sent board briefing draft', details: 'Emailed Q2 security briefing draft to Victoria for review', createdAt: daysAgo(8) },
    { clientId: atlas.id, type: 'call', title: 'Phishing simulation debrief', details: 'Discussed results of Q2 phishing campaign — 12% click rate, down from 28%', createdAt: daysAgo(1) },
    { clientId: atlas.id, type: 'journey_update', title: 'Monitoring phase started', details: 'Implementation phase completed; transitioned to continuous monitoring', createdAt: daysAgo(6) },
    { clientId: atlas.id, type: 'note', title: 'Expansion opportunity noted', details: 'Dr. Chen mentioned interest in vCISO services for new clinic locations', createdAt: daysAgo(10) },
    { clientId: pinnacle.id, type: 'meeting', title: 'Implementation kickoff', details: 'Kicked off endpoint protection deployment with IT team', createdAt: daysAgo(3) },
    { clientId: pinnacle.id, type: 'email', title: 'Sent deployment schedule', details: 'Shared phased rollout plan for EDR agents across manufacturing floor', createdAt: daysAgo(7) },
    { clientId: pinnacle.id, type: 'note', title: 'OT network concerns flagged', details: 'Robert raised concerns about agent impact on SCADA systems', createdAt: daysAgo(12) },
    { clientId: horizon.id, type: 'meeting', title: 'Onboarding kickoff call', details: 'Initial meeting with Priya and team to scope CRA engagement', createdAt: daysAgo(1) },
    { clientId: horizon.id, type: 'email', title: 'Welcome package sent', details: 'Sent onboarding documentation and data collection questionnaire', createdAt: daysAgo(2) },
    { clientId: horizon.id, type: 'note', title: 'Startup environment assessment', details: 'Cloud-native stack, minimal existing security controls, high growth rate', createdAt: daysAgo(4) },
    { clientId: summit.id, type: 'call', title: 'Compliance review call', details: 'Reviewed SOC 2 Type II readiness and remaining gaps', createdAt: daysAgo(3) },
    { clientId: summit.id, type: 'score_update', title: 'Compliance score updated to 82', details: 'Policy development completion drove compliance improvement', createdAt: daysAgo(9) },
    { clientId: summit.id, type: 'journey_update', title: 'Optimization phase initiated', details: 'Client progressed to optimization after completing monitoring milestones', createdAt: daysAgo(14) },
    { clientId: coastal.id, type: 'meeting', title: 'PCI-DSS gap analysis review', details: 'Presented gap analysis findings and remediation roadmap', createdAt: daysAgo(2) },
    { clientId: coastal.id, type: 'call', title: 'SOC onboarding check-in', details: 'Verified log ingestion from all 12 retail locations', createdAt: daysAgo(6) },
    { clientId: coastal.id, type: 'email', title: 'Monthly security report sent', details: 'Delivered March security operations summary report', createdAt: daysAgo(8) },
    { clientId: meridian.id, type: 'note', title: 'Contract renewal discussion', details: 'Victoria indicated interest in upgrading to Platinum tier at renewal', createdAt: daysAgo(15) },
    { clientId: atlas.id, type: 'meeting', title: 'Incident response tabletop', details: 'Conducted ransomware scenario tabletop exercise with leadership team', createdAt: daysAgo(18) },
  ];

  for (const data of activities) {
    await prisma.activity.create({ data });
  }
  console.log(`Created ${activities.length} activities`);

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
