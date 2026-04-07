# AccountOS

Your second brain for client relationships. Built for independent contract account managers.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS + shadcn/ui patterns
- **State:** Zustand
- **Database:** SQLite via Prisma
- **Auth:** NextAuth v5
- **AI:** Claude API (Anthropic SDK)
- **Charts:** Recharts
- **Fonts:** Outfit (body) + IBM Plex Mono (numbers/timestamps)

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local

# Push database schema
npx prisma db push

# Seed with demo data
npx prisma db seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Login: `admin@accountos.app` / `password123`

## Modules

| Module | Description |
|--------|-------------|
| Dashboard | 7 KPI cards, priorities, activity feed, charts, AI insights |
| Clients | Full CRUD, 7-tab detail (overview, contacts, goals, activity, financials, deals, docs) |
| Pipeline | Kanban drag-and-drop, list view, stage history, win/loss tracking |
| Tasks | Categories, priorities, recurring tasks, overdue tracking |
| Time | Live timer, manual entry, weekly grid, monthly summary, charts |
| Invoices | State machine, line items, aging report, PDF-ready layout |
| Contracts | Lifecycle tracking, renewal alerts, expiry warnings |
| Activity | Relationship journal, 14 activity types, sentiment, key moments |
| Proposals | Full-page section editor, deliverables, preview |
| Playbooks | 5 built-in playbooks, trigger mechanism, custom creation |
| Templates | Email templates with {{variable}} substitution |
| Reports | Revenue, pipeline, clients, utilization, 13-week cash flow |
| AI Copilot | Meeting prep, QBR generation, email drafts, weekly digest |
| Settings | Business config, health weights, data export/import |

## Architecture

```
src/
├── app/           # Next.js pages + API routes
├── components/    # UI + layout + module components
├── stores/        # Zustand stores (12 domain stores)
├── hooks/         # Custom React hooks
├── lib/           # Business logic (health score, state machine, validators)
├── types/         # TypeScript interfaces
└── generated/     # Prisma client
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| DATABASE_URL | Yes | SQLite path: `file:./prisma/dev.db` |
| NEXTAUTH_SECRET | Yes | JWT signing secret |
| NEXTAUTH_URL | Yes | App URL (http://localhost:3000) |
| ANTHROPIC_API_KEY | No | Enables AI Copilot features |

## Docker

```bash
docker build -t accountos .
docker run -p 3000:3000 --env-file .env accountos
```
