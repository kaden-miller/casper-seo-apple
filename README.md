# SEO Ops Console

Multi-client SEO operations dashboard for monthly SEO workflows.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS + shadcn/ui
- Supabase Auth + PostgreSQL
- Prisma ORM

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Required variables:

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (server-only)
- `DATABASE_URL` — Pooled Postgres connection (port 6543, `?pgbouncer=true`)
- `DIRECT_URL` — Direct Postgres connection for migrations (port 5432)

### 3. Run database migrations

Get your connection strings from **Supabase Dashboard → Connect → ORMs → Prisma** (region: `us-west-2`).

Your `.env` needs two URLs:

| Variable | Use | Port |
|----------|-----|------|
| `DATABASE_URL` | App runtime (transaction pooler) | `6543` + `?pgbouncer=true` |
| `DIRECT_URL` | Prisma CLI migrations | `5432` (session pooler or direct) |

Example format (replace `[PASSWORD]` with your database password from **Project Settings → Database**):

```env
DATABASE_URL="postgresql://postgres.ghbcdrvotdwgnltsfgae:[PASSWORD]@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require"
DIRECT_URL="postgresql://postgres.ghbcdrvotdwgnltsfgae:[PASSWORD]@aws-0-us-west-2.pooler.supabase.com:5432/postgres?sslmode=require"
```

Then run:

```bash
npm run db:migrate
```

If the schema was already applied (e.g. via Supabase MCP), mark the migration as applied:

```bash
npm run db:resolve-init
```

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Phase 0 verification

1. Visit `/` — redirects to `/login` when signed out
2. Create an account at `/signup`
3. Land on `/dashboard` with sidebar navigation
4. Check database status card on dashboard (requires `DATABASE_URL`)
5. Visit `/api/health` — returns `{ "db": "ok" }` when DB is connected

## Phase 1 verification

1. Run `npm run db:migrate` (applies `20250622200000_phase1_client_website`)
2. Sign in and open **Clients** from the sidebar
3. Create a client with business description, industry, and notes
4. From the client detail page, add a website with URL, CMS, service areas, and target services
5. Open the website dashboard — confirm placeholder metrics and data freshness cards
6. Add keywords and competitors on the website page
7. Edit client and website details via their edit pages
8. Confirm **Websites** list shows all websites across clients
9. Dashboard shows live client and website counts

## Phase 2 verification

1. Run `npm run db:migrate` (applies `20260623134011_phase2_full_mvp_schema`)
2. Run `npm run db:seed` to create demo data
3. Confirm seed output shows **Acme Lawn Care** client and website
4. In Supabase Table Editor (or `npx prisma studio`), verify tables exist:
   - Core: `Client`, `Website`, `Keyword`, `Competitor`
   - Integrations: `Integration`, `IntegrationRun`
   - Crawl: `Page`, `PageSnapshot`, `CrawlRun`, `InternalLink`
   - Snapshots: `GscPageSnapshot`, `GscQuerySnapshot`, `GscQueryPageSnapshot`, `Ga4LandingPageSnapshot`, `RankSnapshot`, `BacklinkSnapshot`
   - Workflow: `Recommendation`, `Task`, `ChangeLog`, `AgentRun`, `MonthlyReport`
5. Sign in — your user workspace is separate from the demo org; seed data lives in **SEO Ops Demo Workspace**
6. Repository layer is available at `src/lib/repositories/` for use in Phases 3+

## Phase 3 verification

1. Sign in and open a website with a real, crawlable URL (e.g. `https://example.com`)
2. Click **Run crawl** on the website dashboard
3. Wait for the crawl to finish (every same-domain page; large sites take longer)
4. Confirm the **Pages crawled** card and page inventory populate
5. Check crawl history table for status, page count, and any errors
6. Click a page URL to view crawl details (title, meta, H1, word count, schema, etc.)
7. Open **Pages** in the sidebar to see inventory across all websites
8. Re-run a crawl — new `PageSnapshot` records are created; page inventory updates

Crawler module: `src/lib/crawler/` (BFS, cheerio extraction, Prisma persistence)

## Phase 4 verification

1. Configure Google OAuth env vars (see **Google Search Console setup** below)
2. Open a website dashboard and click **Connect Search Console**
3. Complete Google OAuth and select a GSC property (dropdown or manual URL)
4. Click **Sync GSC data** — imports last 28 days and previous 28 days
5. Confirm organic clicks/impressions cards populate on the website dashboard
6. Check the GSC sync history table for record counts and any errors
7. In the database, verify `GscPageSnapshot`, `GscQuerySnapshot`, and `GscQueryPageSnapshot` rows

GSC module: `src/lib/integrations/gsc/` · OAuth: `src/lib/integrations/google/`

### Google Search Console setup

1. **Google Cloud project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create or select a project
   - Enable **Google Search Console API** (APIs & Services → Library)

2. **OAuth consent screen**
   - APIs & Services → OAuth consent screen
   - User type: **External** (or Internal for Workspace)
   - Add scope: `https://www.googleapis.com/auth/webmasters.readonly`
   - Add your Google account as a test user while in testing mode

3. **OAuth client**
   - APIs & Services → Credentials → Create credentials → **OAuth client ID**
   - Application type: **Web application**
   - Authorized redirect URI:
     ```
     http://localhost:3000/api/integrations/google/callback
     ```
     (Use your production URL in production, e.g. `https://your-app.com/api/integrations/google/callback`)

4. **Environment variables** (add to `.env`):

   ```env
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   TOKEN_ENCRYPTION_KEY=generate-a-long-random-string-at-least-32-chars
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

   Generate `TOKEN_ENCRYPTION_KEY` with e.g. `openssl rand -base64 32`.

5. **Search Console access**
   - The Google account you use for OAuth must have access to the property in [Search Console](https://search.google.com/search-console)
   - Property URL must match GSC format (`https://example.com/` or `sc-domain:example.com`)

## Phase 5 verification

1. Ensure Google OAuth env vars are set (same as Phase 4)
2. In Google Cloud, enable **Google Analytics Admin API** and **Google Analytics Data API**
3. Add OAuth scope `https://www.googleapis.com/auth/analytics.readonly` to your consent screen
4. Open a website dashboard → **Connect Google Analytics**
5. Select a GA4 property (dropdown or manual property ID) → **Save property**
6. Click **Sync GA4 data** — imports organic landing pages for last 28 days and previous 28 days
7. Confirm GA4 metric cards and top landing pages table populate
8. Open a crawled page detail view — confirm GA4 organic metrics appear
9. Verify `Ga4LandingPageSnapshot` rows in the database

GA4 module: `src/lib/integrations/ga4/`

### Google Analytics 4 setup

Uses the **same OAuth client** as Search Console. Additionally:

1. **Enable APIs** in Google Cloud Console:
   - Google Analytics Admin API
   - Google Analytics Data API

2. **OAuth consent screen** — add scope:
   - `https://www.googleapis.com/auth/analytics.readonly`

3. **GA4 access** — the Google account must have at least Viewer access to the GA4 property

4. **Property ID** — found in GA4 → Admin → Property Settings (numeric ID, e.g. `123456789`)

No extra environment variables beyond Phase 4. GSC and GA4 use separate OAuth connections per website (different scopes, separate `Integration` records).

## Phase 6 verification

1. Ensure a website has **crawl data** and **GSC data** synced (two periods for comparisons)
2. Open the website dashboard → click **View analysis** or **Open full analysis**
3. Confirm findings appear grouped by type:
   - High impressions / low CTR queries
   - Pages losing clicks
   - Impression growth with weak click growth
   - Queries ranking 4–15 and 16–30
   - Missing titles, meta descriptions, H1s
   - Thin pages, images missing alt text
   - Duplicate titles and meta descriptions
4. Click a finding linked to a crawled page — confirm page detail opens
5. Dashboard shows analysis summary badge counts

Analysis module: `src/lib/analysis/` · Page: `/websites/[id]/analysis`

## Phase 7 verification

1. Set `OPENAI_API_KEY` in `.env` (optional for `dataIngestionAgent`, required for LLM agents)
2. Open **Agent test** in the sidebar (`/agents/test`)
3. Select a website and **Data Ingestion Agent** → **Run agent** (works without OpenAI)
4. Confirm run result shows `SUCCESS`, parsed output, and an `AgentRun` row in the database
5. Run an LLM agent (e.g. Technical SEO Agent) with sample JSON input
6. Confirm `AgentRun` stores provider, model, raw output, and parsed output
7. Provide invalid JSON to an LLM agent or malformed output to confirm `VALIDATION_FAILED` is stored without creating recommendations

Agent framework: `src/lib/agents/` · AI provider: `src/lib/ai/`

### AI model configuration

- Per-agent defaults live in `src/lib/ai/agent-model-config.ts`
- Override via env vars like `ON_PAGE_SEO_MODEL` or `DEFAULT_AI_MODEL`
- Set reasoning effort via `DEFAULT_AI_REASONING_EFFORT` or per-agent vars like `ON_PAGE_SEO_REASONING_EFFORT` (`none`, `minimal`, `low`, `medium`, `high`, `xhigh`)
- Reasoning effort is only sent for o-series / gpt-5+ models; gpt-4.x ignores it
- gpt-5 / o-series models automatically use `max_completion_tokens` instead of `max_tokens`
- Token budget is auto-scaled for reasoning models so JSON output is not truncated
- For structured agents, prefer `low` or `medium` reasoning effort; `high` costs more and needs a larger token budget
- Agents must call `runAgent()` — never import the OpenAI SDK directly in agent files
- `dataIngestionAgent` is a system agent (no LLM call) that checks crawl/GSC/GA4 freshness

## Phase 8 verification

1. Ensure website has crawl + GSC (+ GA4 optional) data synced
2. Set `OPENAI_API_KEY` in `.env`
3. Open website dashboard → **Recommendations** panel
4. Run **Technical SEO**, **Search Performance**, or **On-Page SEO** agent
5. Confirm new `Recommendation` rows appear in the table and database
6. Run **Prioritization** agent — verify priority/impact fields update
7. Run **QA** agent — verify recommendations move to APPROVED, REJECTED, or NEEDS_REVIEW
8. Invalid agent JSON still stores `VALIDATION_FAILED` on `AgentRun` without creating recommendations

Agent input builders: `src/lib/agents/input-builders/` · Persistence: `src/lib/agents/persist-output.ts`

## Phase 9 verification

1. Open **Recommendations** in the sidebar (`/recommendations`)
2. Filter by website, status, or priority
3. Open a recommendation detail page — review supporting data, description, and reason
4. **Approve** or **Reject** a recommendation; confirm status updates in the table
5. **Edit** fields (title, suggested value, priority) and save
6. **Convert to task** — confirm redirect to task detail and recommendation status becomes `CONVERTED_TO_TASK`
7. Open **Tasks** (`/tasks`) — board view groups tasks by status; use filters for table view
8. On task detail, change status (e.g. In progress) or **Complete task** with change type and notes
9. Confirm a `ChangeLog` row is created and linked recommendation moves to `COMPLETED` when applicable

Workflow UI: `src/app/(dashboard)/recommendations/` · `src/app/(dashboard)/tasks/`

## Phase 10 verification

1. Ensure a website has GSC and/or GA4 data synced, plus some tasks/recommendations
2. Set `OPENAI_API_KEY` in `.env`
3. Open **Reports** in the sidebar (`/reports`) or use **Monthly reports** on a website dashboard
4. Select website + month/year → **Generate monthly report**
5. Confirm redirect to report detail with executive summary, performance tables, wins/losses, and priorities
6. Verify `MonthlyReport` row in database with structured JSON for tasks and recommendations
7. Re-generate the same month — report should update in place (unique per website + month + year)

Report pipeline: `src/lib/reports/` · Reporting agent: `reportingAgent`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run db:migrate` | Apply Prisma migrations |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:seed` | Seed demo client and website |

## Documentation

Product and architecture specs live in [`seo_tool_cursor_docs/`](seo_tool_cursor_docs/).

## Supabase MCP (Cursor)

This project includes a project-scoped Supabase MCP server for AI-assisted database work.

**Config files:**
- [`.cursor/mcp.json`](.cursor/mcp.json) — Cursor project MCP config
- [`.mcp.json`](.mcp.json) — Claude Code / compatible CLI config

**Authenticate in Cursor:**
1. Reload the window after adding the MCP config (`Cmd+Shift+P` → "Developer: Reload Window")
2. Open **Cursor Settings → Tools & MCP**
3. Find the **supabase** server and click **Authenticate**
4. Complete the OAuth flow in your browser

**Agent skills** (installed via `npx skills add supabase/agent-skills`):
- `.agents/skills/supabase`
- `.agents/skills/supabase-postgres-best-practices`
