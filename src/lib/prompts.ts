export const PROMPTS = {
  meetingPrep: {
    version: '1.0',
    system: `You are an expert account management advisor. Generate a concise, actionable meeting prep brief.`,
    user: (context: string) => `Based on the following client data, generate a meeting prep brief with:
1. Relationship Summary (2-3 sentences)
2. Key Talking Points (3-5 bullets)
3. Risks to Address
4. Opportunities to Explore
5. Personal Touch Reminders (birthdays, interests)

Client Data:
${context}`,
  },
  qbrGenerate: {
    version: '1.0',
    system: `You are an expert account management advisor. Generate a structured QBR document.`,
    user: (context: string, quarter: string) => `Generate a QBR document for ${quarter} with:
1. Executive Summary
2. Goals Review (progress on each goal)
3. Key Metrics (revenue, hours, deliverables)
4. Achievements & Milestones
5. Challenges & Risks
6. Next Quarter Plan & Recommendations

Data:
${context}`,
  },
  emailDraft: {
    version: '1.0',
    system: `You are a professional account manager. Draft a warm, professional email.`,
    user: (template: string, context: string) => `Draft an email based on this template and client context:

Template: ${template}
Context: ${context}

Write a natural, personalized version. Keep it concise and professional.`,
  },
  proposalAssist: {
    version: '1.0',
    system: `You are an expert proposal writer for consulting and professional services.`,
    user: (context: string) => `Based on the following client needs and context, draft proposal sections:
1. Executive Summary
2. Problem Statement
3. Proposed Scope of Work
4. Recommended Deliverables

Context:
${context}`,
  },
  weeklyDigest: {
    version: '1.0',
    system: `You are an account management advisor providing a weekly priority briefing.`,
    user: (context: string) => `Based on the following portfolio data, generate a weekly digest with:
1. Top 3 Priority Actions (ranked by urgency x impact)
2. Engagement Decay Warnings (clients not contacted recently)
3. Revenue at Risk
4. Wins & Milestones to Celebrate
5. This Week's Focus Areas

Portfolio Data:
${context}`,
  },
};
