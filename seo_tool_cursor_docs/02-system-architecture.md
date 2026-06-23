# 02 — System Architecture

## Recommended architecture

Use a modular web app architecture.

```txt
Next.js App
  ├── Dashboard UI
  ├── API routes/server actions
  ├── Auth
  ├── Prisma ORM
  ├── PostgreSQL database
  ├── Background jobs
  ├── Integration services
  ├── Crawler service
  ├── Agent runner
  └── Report generator
```

## Recommended stack

### Frontend

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- shadcn/ui recommended

### Backend

- Next.js route handlers or server actions
- TypeScript services
- Background worker system

### Database

- PostgreSQL
- Prisma ORM

### Auth

Use one of:

- Clerk
- Auth.js
- Supabase Auth

### Background jobs

Use one of:

- Trigger.dev
- Inngest
- BullMQ with Redis
- Cron jobs for early MVP

Jobs needed:

- GSC sync
- GA4 sync
- Website crawl
- Rank check sync, later
- Ahrefs sync, later
- Recommendation generation
- Monthly report generation

### AI layer

Use an abstraction layer so the model provider can be swapped.

Suggested service:

```txt
/lib/ai/agent-runner.ts
/lib/ai/prompts/
/lib/ai/schemas/
```

The AI layer should:

1. Receive structured input data.
2. Use specific agent prompts.
3. Return structured JSON.
4. Validate JSON with Zod.
5. Store raw and parsed output.
6. Create recommendations/tasks only after validation.

## Major modules

### 1. Client/project module

Responsible for:

- Clients
- Websites
- Integrations
- Keywords
- Competitors
- Service areas
- Business notes

### 2. Data ingestion module

Responsible for:

- Pulling external API data
- Normalizing data
- Storing snapshots
- Tracking import status
- Handling rate limits/errors

### 3. Crawler module

Responsible for crawling website pages and extracting:

- Status code
- Final URL
- Title
- Meta description
- H1
- H2s
- Canonical
- Robots directives
- Internal links
- External links
- Images and alt text
- Schema markup
- Word count
- Basic indexability signals

### 4. Analysis module

Responsible for non-AI calculations:

- Month-over-month deltas
- CTR calculations
- Average position trends
- Conversion rate trends
- Pages with traffic declines
- Queries with impressions but low CTR
- Pages ranking 4–15
- Thin content detection
- Duplicate title detection
- Missing meta detection

### 5. Agent module

Responsible for specialized AI agents:

- Technical SEO Agent
- Search Performance Agent
- Content Opportunity Agent
- On-Page SEO Agent
- Competitor Agent
- Prioritization Agent
- QA Agent
- Reporting Agent

### 6. Recommendation/task module

Responsible for:

- Storing recommendations
- Converting recommendations into tasks
- Task statuses
- Human approval
- Completion notes
- Change logs

### 7. Reporting module

Responsible for:

- Monthly SEO summaries
- Completed task summaries
- Performance snapshots
- Next-month priorities

## Data flow

```txt
External APIs + crawler
  -> Raw imports
  -> Normalized snapshots
  -> Analysis calculations
  -> Agent input packets
  -> Agent outputs
  -> Validated recommendations
  -> Human tasks
  -> Change logs
  -> Monthly report
```

## Data freshness

Every integration run should store:

- Started at
- Finished at
- Status
- Error message if failed
- Number of records imported
- Date range imported
- Data source

The UI should show the user when data was last updated.

## Multi-tenant design

Every major object should belong to a client or website.

Do not allow cross-client data leakage.

Suggested hierarchy:

```txt
User
  -> Organization
    -> Client
      -> Website
        -> Pages
        -> Snapshots
        -> Recommendations
        -> Tasks
```

## AI safety and quality

The AI should never be the source of truth for metrics.

The AI should only interpret data that the system provides.

Every recommendation should be traceable to:

- Crawled page data
- GSC metrics
- GA4 metrics
- Ranking data
- Competitor data
- Manual user input

## Error handling

For every integration:

- Store API errors.
- Display failed imports in the UI.
- Allow manual re-run.
- Do not generate recommendations from stale or failed data without warning.

## Development principle

Build the system in layers:

1. Data model
2. Client setup UI
3. Import/crawl data
4. Display raw data
5. Add analysis calculations
6. Add structured AI recommendations
7. Add tasks/change log
8. Add reporting
