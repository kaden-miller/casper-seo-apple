# 08 — Implementation Roadmap

## Build philosophy

Do not build the full dream product first.

Build a solid MVP that proves the core workflow:

```txt
Data in -> analysis -> recommendations -> human tasks -> change log -> report
```

## Phase 0: Project setup

Deliverables:

- Next.js app
- TypeScript
- Tailwind
- shadcn/ui
- Prisma
- PostgreSQL
- Auth
- Basic layout/navigation
- Environment variables

Acceptance criteria:

- User can sign in.
- User can access dashboard.
- Database connection works.
- Prisma schema is initialized.

## Phase 1: Client and website setup

Deliverables:

- Client CRUD
- Website CRUD
- Business notes
- Target services
- Service areas
- Competitors
- Keywords

Acceptance criteria:

- User can create a client.
- User can add a website.
- User can add keywords and competitors.
- Website dashboard exists.

## Phase 2: Database foundation

Deliverables:

- Full Prisma schema for MVP entities
- Migrations
- Seed data
- Basic repository/service layer

Implement tables for:

- User
- Organization
- Client
- Website
- Keyword
- Competitor
- Page
- PageSnapshot
- CrawlRun
- GSC snapshots
- GA4 snapshots
- Recommendation
- Task
- ChangeLog
- AgentRun
- MonthlyReport

Acceptance criteria:

- Schema supports historical snapshots.
- Major records are tied to websiteId/clientId.
- Seed data creates a test client and website.

## Phase 3: Basic crawler

Deliverables:

- Crawl website from start URL
- Limit crawl depth/pages
- Extract title, meta, H1, H2s, canonical, robots, word count, links, images, schema
- Store crawl run
- Store pages
- Store page snapshots

Acceptance criteria:

- User can run crawl manually.
- Crawl results display in UI.
- Page inventory populates.
- Crawler errors are stored and visible.

## Phase 4: Google Search Console integration

Deliverables:

- OAuth connection
- Select property/site URL
- Pull page data
- Pull query data
- Pull query-page data
- Store snapshots
- Show import status

Acceptance criteria:

- User can connect GSC.
- User can import last 28 days.
- User can compare previous 28 days.
- Website dashboard displays GSC metrics.

## Phase 5: GA4 integration

Deliverables:

- OAuth connection
- Select GA4 property
- Pull landing page data
- Store snapshots
- Show import status

Acceptance criteria:

- User can connect GA4.
- User can import landing page performance.
- Page detail shows GA4 data when URL matches.

## Phase 6: Analysis calculations

Deliverables:

Create deterministic analysis functions before AI.

Functions:

- Compare current vs previous GSC page data
- Compare current vs previous GSC query data
- Compare current vs previous GA4 data
- Identify high impression / low CTR queries
- Identify pages with click declines
- Identify pages ranking 4–15
- Identify pages ranking 16–30
- Identify missing titles/meta/H1s
- Identify thin pages

Acceptance criteria:

- App can produce opportunity lists without AI.
- Analysis results are shown in UI.

## Phase 7: Agent runner foundation

Deliverables:

- AgentRun table integration
- Prompt files
- Zod schemas
- AI provider abstraction
- Raw output storage
- Parsed output validation

Acceptance criteria:

- User can run a test agent.
- Agent output is stored.
- Invalid JSON does not create recommendations.

## Phase 8: First recommendation agents

Implement these first:

1. Technical SEO Agent
2. Search Performance Agent
3. On-Page SEO Agent
4. Prioritization Agent
5. QA Agent

Acceptance criteria:

- Agents create structured recommendations.
- Recommendations show supporting data.
- QA can approve/reject recommendations.
- Prioritization sorts recommendations.

## Phase 9: Recommendation and task workflow

Deliverables:

- Recommendations table
- Recommendation detail page
- Approve/reject/edit actions
- Convert recommendation to task
- Task board/table
- Task detail page
- Complete task form
- Change log creation

Acceptance criteria:

- User can review recommendations.
- User can create tasks.
- User can complete tasks.
- Completing a task creates a change log.

## Phase 10: Monthly report

Deliverables:

- MonthlyReport model implementation
- Report generation agent
- Report view page
- Summary of completed tasks
- Summary of recommendations
- Performance summary

Acceptance criteria:

- User can generate a monthly report.
- Report uses stored data.
- Report includes completed work and next steps.

## Phase 11: Version 2 integrations

Add after MVP:

- Ahrefs integration
- Rank tracking API
- Competitor SERP analysis
- More advanced content opportunity agent
- Backlink analysis

## Phase 12: Version 3 capabilities

Add later:

- WordPress read-only integration
- WordPress draft updates
- Client-facing approval portal
- White-label PDF reports
- Scheduled monthly runs
- Email/slack notifications

## Cursor development instructions

When using Cursor, build one phase at a time.

For each phase:

1. Ask Cursor to implement only that phase.
2. Ask Cursor to list changed files.
3. Ask Cursor to explain how to test it.
4. Run the app.
5. Fix errors before moving on.
6. Commit after each stable phase.

Do not ask Cursor to build all phases at once.
