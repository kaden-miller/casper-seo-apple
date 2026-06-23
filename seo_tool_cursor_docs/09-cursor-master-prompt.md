# 09 — Cursor Master Prompt

Use this as the main prompt to give Cursor when starting the project.

---

You are helping me build a comprehensive multi-client SEO operations tool called SEO Ops Console.

This is not a generic AI chat app. It is a structured SEO workflow system for monthly SEO work.

The app should:

1. Manage multiple clients and websites.
2. Connect to Google Search Console.
3. Connect to Google Analytics 4.
4. Crawl websites and store on-page SEO data.
5. Store historical SEO snapshots over time.
6. Analyze page/query/analytics/crawl data.
7. Use specialized AI agents to generate structured SEO recommendations.
8. Convert recommendations into human-reviewable tasks.
9. Track what humans actually changed.
10. Generate monthly SEO reports.
11. Later support Ahrefs, rank tracking, competitor analysis, and WordPress read-only/draft workflows.

## Recommended stack

Use:

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Prisma
- PostgreSQL
- Zod for validation
- Server actions or route handlers
- Background jobs when needed

## Main product principle

Every AI output must become structured data.

Do not build an app where AI only returns long unstructured prose.

Recommendations should be stored in a database and include:

- Type
- URL/page
- Current value
- Suggested value
- Reason
- Supporting data
- Priority
- Impact
- Effort
- Risk
- Confidence score
- Status

## Human-in-the-middle rule

The MVP must not automatically modify websites.

The AI recommends work. A human reviews, approves, performs the update manually, then marks the task complete and records what changed.

## Agents

The system should support these agents:

1. Data Ingestion Agent
2. Technical SEO Agent
3. Search Performance Agent
4. Content Opportunity Agent
5. On-Page SEO Agent
6. Competitor Analysis Agent
7. Prioritization Agent
8. QA Agent
9. Reporting Agent

Each agent should:

- Have a narrow role
- Receive structured input
- Return structured JSON
- Store raw output
- Store parsed output
- Validate output with Zod
- Avoid inventing unsupported data

## MVP build phases

Build the app in phases, not all at once.

Phase 0:
Project setup: Next.js, TypeScript, Tailwind, shadcn/ui, Prisma, PostgreSQL, Auth, layout.

Phase 1:
Client and website setup: CRUD for clients, websites, keywords, competitors, business notes, service areas, target services.

Phase 2:
Database foundation: Prisma schema for clients, websites, pages, snapshots, integrations, recommendations, tasks, change logs, agent runs, reports.

Phase 3:
Crawler: crawl a website and store page snapshots.

Phase 4:
Google Search Console integration.

Phase 5:
GA4 integration.

Phase 6:
Deterministic analysis functions.

Phase 7:
Agent runner foundation.

Phase 8:
First agents: Technical SEO, Search Performance, On-Page SEO, Prioritization, QA.

Phase 9:
Recommendation and task workflow.

Phase 10:
Monthly reports.

Later:
Ahrefs, rank tracking, competitor SERP analysis, WordPress draft workflows.

## Start now with Phase 0 only

Create the initial project foundation.

Do not implement all features yet.

After implementation, tell me:

1. What files you created or changed.
2. What environment variables I need.
3. How to run the app.
4. How to verify Phase 0 works.

---

## Follow-up prompt for Phase 1

Now implement Phase 1: client and website setup.

Requirements:

- Create database models if not already created.
- Build UI for creating, editing, listing, and viewing clients.
- Build UI for creating, editing, listing, and viewing websites.
- Each website belongs to a client.
- Store business description, industry, service areas, target services, CMS type, notes.
- Add simple keyword and competitor management.
- Add a website dashboard placeholder.

After implementation, explain how to test it.

---

## Follow-up prompt for Phase 2

Now implement Phase 2: database foundation.

Create or update the Prisma schema to support the full MVP data model:

- User
- Organization
- Client
- Website
- Integration
- IntegrationRun
- Keyword
- Competitor
- Page
- PageSnapshot
- CrawlRun
- InternalLink
- GscPageSnapshot
- GscQuerySnapshot
- GscQueryPageSnapshot
- Ga4LandingPageSnapshot
- RankSnapshot placeholder
- BacklinkSnapshot placeholder
- Recommendation
- Task
- ChangeLog
- AgentRun
- MonthlyReport

Add enums for statuses, priorities, recommendation types, integration types, and agent types.

Generate migrations.

Add seed data for one demo client and one demo website.

After implementation, explain how to test it.

---

## Follow-up prompt for Phase 3

Now implement Phase 3: basic website crawler.

Requirements:

- User can manually run a crawl from a website dashboard.
- Crawl only the same domain.
- Limit crawl to a safe number of pages for MVP.
- Extract status code, final URL, title, meta description, H1, H2s, canonical, robots meta, word count, internal links, external links, image count, missing alt count, and schema types.
- Store CrawlRun, Page, PageSnapshot, and InternalLink records.
- Show crawl status and crawl results in the UI.
- Store errors and show them clearly.

After implementation, explain how to test it.

---

## Follow-up prompt for Phase 4

Now implement Phase 4: Google Search Console integration.

Requirements:

- OAuth connection flow.
- Store integration record.
- Let user select or enter GSC site URL/property.
- Pull Search Analytics data for last 28 days and previous 28 days.
- Import page-level data.
- Import query-level data.
- Import query + page-level data.
- Store IntegrationRun records.
- Store GscPageSnapshot, GscQuerySnapshot, and GscQueryPageSnapshot records.
- Show GSC metrics on website dashboard.
- Show import errors.

After implementation, explain required Google Cloud setup and environment variables.

---

## Follow-up prompt for Phase 5

Now implement Phase 5: Google Analytics 4 integration.

Requirements:

- OAuth connection flow.
- Store integration record.
- Let user select or enter GA4 property ID.
- Pull landing page data for last 28 days and previous 28 days.
- Store Ga4LandingPageSnapshot records.
- Show organic landing page metrics in the website dashboard and page detail.
- Store IntegrationRun records.
- Show import errors.

After implementation, explain required Google Cloud setup and environment variables.

---

## Follow-up prompt for Phase 6

Now implement Phase 6: deterministic SEO analysis functions.

Create functions that identify:

- High impression / low CTR queries
- Pages with click declines
- Pages with impression growth but weak click growth
- Queries ranking positions 4–15
- Queries ranking positions 16–30
- Pages with missing titles
- Pages with missing meta descriptions
- Pages with missing H1s
- Thin pages
- Images missing alt text
- Duplicate title tags
- Duplicate meta descriptions

Show these findings in a website analysis page.

These should not require AI yet.

---

## Follow-up prompt for Phase 7

Now implement Phase 7: AI agent runner foundation.

Do not build the full agent logic yet. Build the reusable framework that all future SEO agents will use.

### Agents to register now

Create the agent registry and prompt/schema placeholders for these agents:

1. technicalSeoAgent
2. searchPerformanceAgent
3. contentOpportunityAgent
4. onPageSeoAgent
5. competitiveAnalysisAgent
6. prioritizationAgent
7. qaAgent
8. reportingAgent

Optional/non-AI or mostly-rule-based agent:

9. dataIngestionAgent

The dataIngestionAgent may not need an LLM call. It can exist in the registry as a non-AI/system agent if that fits the architecture.

---

## Requirements

### 1. Create an AI provider abstraction

Create a centralized AI service that all agents must use.

Agents should not call the OpenAI SDK or any AI provider SDK directly.

Use a function similar to:

```ts
runAgent({
  agentName,
  clientId,
  websiteId,
  input,
  metadata,
})

The runner should:

Load the agent definition from the registry.
Load the correct prompt file.
Load the correct output Zod schema.
Load the correct model configuration.
Call the AI provider through a provider abstraction.
Store the raw output.
Parse and validate the output.
Store the parsed output if valid.
Store validation errors if invalid.
Return a normalized result.

2. Add centralized agent registry

Create a file similar to:

src/lib/agents/agent-registry.ts

Each agent definition should include:

{
  name: "technicalSeoAgent",
  displayName: "Technical SEO Agent",
  description: "Reviews crawl and indexability data to identify technical SEO issues.",
  promptFile: "technical-seo-agent.md",
  outputSchemaName: "technicalSeoOutputSchema",
  defaultModelConfigKey: "technicalSeoAgent",
  enabled: true,
}

Do this for all registered agents.

3. Add model configuration per agent

Create or update:

src/lib/ai/agent-model-config.ts

Each agent should have its own configurable model settings:

export const agentModelConfig = {
  technicalSeoAgent: {
    provider: "openai",
    model: process.env.TECHNICAL_SEO_MODEL || process.env.DEFAULT_AI_MODEL || "gpt-4.1",
    temperature: 0.2,
    maxTokens: 4000,
    promptVersion: "v1",
    enabled: true,
  },

  searchPerformanceAgent: {
    provider: "openai",
    model: process.env.SEARCH_PERFORMANCE_MODEL || process.env.DEFAULT_AI_MODEL || "gpt-4.1",
    temperature: 0.2,
    maxTokens: 5000,
    promptVersion: "v1",
    enabled: true,
  },

  contentOpportunityAgent: {
    provider: "openai",
    model: process.env.CONTENT_OPPORTUNITY_MODEL || process.env.DEFAULT_AI_MODEL || "gpt-4.1",
    temperature: 0.4,
    maxTokens: 6000,
    promptVersion: "v1",
    enabled: true,
  },

  onPageSeoAgent: {
    provider: "openai",
    model: process.env.ON_PAGE_SEO_MODEL || process.env.DEFAULT_AI_MODEL || "gpt-4.1",
    temperature: 0.4,
    maxTokens: 6000,
    promptVersion: "v1",
    enabled: true,
  },

  competitiveAnalysisAgent: {
    provider: "openai",
    model: process.env.COMPETITIVE_ANALYSIS_MODEL || process.env.DEFAULT_AI_MODEL || "gpt-4.1",
    temperature: 0.3,
    maxTokens: 6000,
    promptVersion: "v1",
    enabled: true,
  },

  prioritizationAgent: {
    provider: "openai",
    model: process.env.PRIORITIZATION_MODEL || process.env.DEFAULT_AI_MODEL || "gpt-4.1",
    temperature: 0.2,
    maxTokens: 4000,
    promptVersion: "v1",
    enabled: true,
  },

  qaAgent: {
    provider: "openai",
    model: process.env.QA_AGENT_MODEL || process.env.DEFAULT_AI_MODEL || "gpt-4.1",
    temperature: 0.1,
    maxTokens: 5000,
    promptVersion: "v1",
    enabled: true,
  },

  reportingAgent: {
    provider: "openai",
    model: process.env.REPORTING_AGENT_MODEL || process.env.DEFAULT_AI_MODEL || "gpt-4.1",
    temperature: 0.3,
    maxTokens: 6000,
    promptVersion: "v1",
    enabled: true,
  },
} as const;

Do not hardcode model names inside individual agents.

4. Add prompt files for each agent

Create prompt files in a folder like:

src/lib/agents/prompts/

Add placeholder prompt files for:

technical-seo-agent.md
search-performance-agent.md
content-opportunity-agent.md
on-page-seo-agent.md
competitive-analysis-agent.md
prioritization-agent.md
qa-agent.md
reporting-agent.md

Each prompt file should clearly state:

The agent’s role
The type of input it receives
The expected output format
That it must return valid JSON matching the assigned Zod schema
That it should not invent unsupported recommendations
That every recommendation must include supporting data

For now, these can be simple but production-structured placeholders.

5. Add Zod schemas for agent outputs

Create a file like:

src/lib/agents/schemas.ts

Add output schemas for:

technicalSeoOutputSchema
searchPerformanceOutputSchema
contentOpportunityOutputSchema
onPageSeoOutputSchema
competitiveAnalysisOutputSchema
prioritizationOutputSchema
qaOutputSchema
reportingOutputSchema

For Phase 7, the schemas can share a base recommendation structure where appropriate.

Base recommendation fields should include:

{
  title: string;
  description: string;
  recommendationType: string;
  priority: "low" | "medium" | "high" | "critical";
  impact: "low" | "medium" | "high";
  confidence: "low" | "medium" | "high";
  effort: "low" | "medium" | "high";
  risk: "low" | "medium" | "high";
  pageUrl?: string;
  targetKeyword?: string;
  supportingData: array;
  suggestedAction: string;
}

The QA agent schema should support:

{
  recommendationId: string;
  decision: "approved" | "rejected" | "needs_edits";
  reason: string;
  suggestedEdits?: string;
}

The prioritization schema should support sorted/scored recommendations.

6. Add AgentRun records

Add or update the AgentRun database model.

It should store:

id
agentName
clientId
websiteId
provider
model
temperature
maxTokens
promptVersion
inputJson
rawOutput
parsedOutput
validationError
status
startedAt
completedAt
createdAt
updatedAt

Suggested statuses:

pending
running
completed
failed
validation_failed

If the app already has an AgentRun model, update it instead of creating duplicates.

7. Validation behavior

If an agent output passes Zod validation:

Store raw output.
Store parsed output.
Mark AgentRun as completed.

If an agent output fails Zod validation:

Store raw output.
Store the validation error.
Mark AgentRun as validation_failed.
Do not create recommendations.
Show the validation error in the test runner UI.
8. Build a test agent run button

Add a development/test UI that allows me to:

Pick a client
Pick a website
Pick an agent
Provide sample JSON input
Run the agent
See status
See model used
See raw output
See parsed output
See validation errors

This can be a simple internal admin/dev page.

9. Acceptance criteria

Phase 7 is complete when:

There is a centralized AI provider abstraction.
There is a centralized agent registry.
Each SEO agent is registered by name.
Each registered agent has a prompt file.
Each registered agent has a Zod output schema.
Each registered agent has model configuration.
AgentRun records store raw output and parsed output.
Invalid output is stored but does not create recommendations.
The test agent run button can execute at least one placeholder agent end-to-end.
No individual agent file directly calls an AI provider SDK.
No individual agent file hardcodes a model name.

---

## Follow-up prompt for Phase 8

Now implement Phase 8: first recommendation agents.

Implement:

1. Technical SEO Agent
2. Search Performance Agent
3. On-Page SEO Agent
4. Prioritization Agent
5. QA Agent

Requirements:

- Agents use structured input from stored database records.
- Agents output structured recommendations.
- Recommendations include supporting data.
- Recommendations are validated with Zod.
- Recommendations are saved to the database.
- QA agent can mark recommendations as approved, rejected, or needs edits.
- Prioritization agent sorts recommendations by impact, confidence, business value, effort, and risk.

---

## Follow-up prompt for Phase 9

Now implement Phase 9: recommendation and task workflow.

Requirements:

- Recommendations table.
- Recommendation detail page.
- Approve/reject/edit recommendation.
- Convert recommendation into a task.
- Task table or kanban board.
- Task detail page.
- Complete task form.
- Completion should create ChangeLog record.
- Store before/after values and completion notes.

---

## Follow-up prompt for Phase 10

Now implement Phase 10: monthly reports.

Requirements:

- Generate a MonthlyReport record.
- Include organic performance summary.
- Include top winning pages.
- Include top declining pages.
- Include completed tasks.
- Include open tasks.
- Include recommendations for next month.
- Include items to monitor.
- Create report detail page.
