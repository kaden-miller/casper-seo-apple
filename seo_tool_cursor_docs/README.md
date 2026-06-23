# SEO Operations Tool — Cursor Build Pack

This folder contains the planning documents Cursor should use to build a comprehensive multi-client SEO operations tool.

The goal is not to build a generic AI chat wrapper. The goal is to build a structured SEO workflow system that:

1. Pulls SEO/analytics data from reliable sources.
2. Crawls client websites.
3. Stores historical snapshots.
4. Detects SEO issues and opportunities.
5. Generates structured recommendations.
6. Converts recommendations into human-reviewable tasks.
7. Tracks what changed.
8. Measures whether the changes helped in future months.

## Suggested build order

Use these files in this order:

1. `01-product-requirements.md`
2. `02-system-architecture.md`
3. `03-database-schema.md`
4. `04-agent-system.md`
5. `05-data-integrations.md`
6. `06-seo-workflows.md`
7. `07-ui-pages.md`
8. `08-implementation-roadmap.md`
9. `09-cursor-master-prompt.md`
10. `10-acceptance-criteria.md`

## Recommended MVP stack

- Frontend: Next.js App Router
- Backend: Next.js route handlers/server actions
- Database: PostgreSQL
- ORM: Prisma
- Jobs: Trigger.dev, Inngest, BullMQ, or cron-based background workers
- Auth: Clerk, Auth.js, or Supabase Auth
- AI: OpenAI API or compatible LLM provider
- Deployment: Vercel for app, managed Postgres for database

## Core principle

Every AI output should become structured data, not just text.

Bad:

```txt
The AI says, “You should improve this title tag.”
```

Good:

```json
{
  "type": "title_tag_opportunity",
  "url": "https://example.com/service-page",
  "current_value": "Service Page | Company",
  "suggested_value": "Lawn Care in Wichita, KS | Company",
  "reason": "High impressions and low CTR for target query.",
  "priority": "high",
  "status": "needs_review"
}
```
